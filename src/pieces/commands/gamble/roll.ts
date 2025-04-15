import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Awaitable, Command } from '@sapphire/framework';
import { bold, ChatInputCommandInteraction, Colors, inlineCode } from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'roll',
  description: 'Roll a dice.'
})
export default class extends Command {
  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { getRandomNumber } = this.container.utilities['number'];
    const { createStackedText } = this.container.utilities['string'];
    const db = await this.container.db.managers.player.fetch(interaction.user.id);
    const betAmount = interaction.options.getNumber('bet', true) ?? 0;
    const [bot, user] = [getRandomNumber(1, 12), getRandomNumber(1, 12)];

    // if (Math.random() <= 0.5) {
    //   if (user < bot) [bot, user] = [user, bot];
    // } else {
    //   if (user > bot) [user, bot] = [bot, user];
    // }

    const winnings = user > bot ? Math.round(betAmount * (0.01 + Math.random() * 2.09)) : user === bot ? 0 : -betAmount;

    if (betAmount >= db.economy.coins) {
      return interaction.editReply({
        content: `you don't have that amount, don't try to break me`
      });
    }

    await this.container.db.managers.player.update(interaction.user.id, (doc) => {
      doc.economy.coins += winnings;
    });

    return interaction.editReply({
      embeds: [
        {
          title: `You ${user > bot ? 'won' : user === bot ? 'tied' : 'lost'}!`,
          color: user > bot ? Colors.Green : user === bot ? Colors.Yellow : Colors.Red,
          description: createStackedText(
            `${bold('Net:')} ${user > bot ? '+' : '-'}${Math.abs(winnings).toLocaleString()} CC`,
            `${bold('Coins:')} ${db.economy.coins.toLocaleString()} CC\n`,
            user > bot
              ? `You won ${inlineCode(`${(winnings / betAmount).toFixed(2)}x`)} of your bet!`
              : user === bot
                ? 'We are even, lol. We tied against each other.'
                : 'You lost your bet. Better luck next time!'
          ),
          fields: [
            {
              name: interaction.client.user.username,
              value: `Rolled a ${inlineCode(bot.toString())}`,
              inline: true
            },
            {
              name: interaction.user.displayName,
              value: `Rolled a ${inlineCode(user.toString())}`,
              inline: true
            }
          ]
        }
      ]
    });
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
    registry.registerChatInputCommand((command) =>
      command
        .setName(this.name)
        .setDescription(this.description)
        .addNumberOption((option) =>
          option.setName('bet').setDescription('The amount you want to bet.').setRequired(true).setMinValue(1).setMaxValue(1e12)
        )
    );
  }
}
