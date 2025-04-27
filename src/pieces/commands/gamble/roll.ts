import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Awaitable } from '@sapphire/framework';
import { bold, ButtonStyle, Colors, ComponentType, inlineCode } from 'discord.js';
import { PulseCommand, PulseCommandOptions, PulseCommandRunContext } from '../../../utilities/command.js';

@ApplyOptions<PulseCommandOptions>({
  name: 'roll',
  description: 'Roll a dice.',
  deferInitialReply: true,
})
export default class extends PulseCommand {
  protected rig(bot: number, user: number): { bot: number, user: number } {
    if (Math.random() <= 0.5) {
      if (user < bot) [bot, user] = [user, bot];
    } else {
      if (user > bot) [user, bot] = [bot, user];
    }

    return { bot, user };
  }

  public async run(ctx: PulseCommandRunContext) {
    const { getRandomNumber } = ctx.utilities['number'];
    const { createStackedText } = ctx.utilities['string'];

    const betAmount = ctx.interaction.options.getNumber('bet', true) ?? 0;
    const [bot, user] = [getRandomNumber(1, 12), getRandomNumber(1, 12)];
    const winnings = user > bot ? Math.round(betAmount * (0.01 + Math.random() * 2.24)) : user === bot ? 0 : -betAmount;

    if (betAmount >= ctx.player.economy.coins) {
      return void await ctx.responder.send(builder =>
        builder.setContent('You don\'t have enough coins to bet that much!')
      );
    }

    ctx.updatePlayer(db => db.economy.coins += winnings);

    await ctx.responder.send(builder =>
      builder
        .addEmbed(embed =>
          embed
            .setColor(Colors.Gold)
            .setDescription(createStackedText(
              `:game_die: ${bold('Rolling...')}`,
              `:coin: ${bold(betAmount.toLocaleString() + ' CC')}`
            ))
            .setTimestamp()
        )
    );

    await ctx.utilities['promise'].createTimeout(250, null);
    ctx.responder.content.removeEmbed(0);

    await ctx.responder.edit(builder =>
      builder
        .addEmbed(embed =>
          embed
            .setTitle(`You ${user > bot ? 'won' : user === bot ? 'tied' : 'lost'}!`)
            .setColor(user > bot ? Colors.Green : user === bot ? Colors.Yellow : Colors.Red)
            .setDescription(
              createStackedText(
                `${bold('Net:')} ${user > bot ? '+' : '-'}${Math.abs(winnings).toLocaleString()} CC`,
                `${bold('Coins:')} ${ctx.player.economy.coins.toLocaleString()} CC\n`,
                user > bot
                  ? bold(`You won ${inlineCode(`${(winnings / betAmount).toFixed(2)}x`)} of your bet!`)
                  : user === bot
                    ? 'We are even, lol. We tied against each other.'
                    : 'You lost your bet. Better luck next time!'
              )
            )
            .addFields([
              {
                name: ctx.interaction.client.user.username,
                value: `Rolled a ${inlineCode(bot.toString())}`,
                inline: true
              },
              {
                name: ctx.interaction.user.displayName,
                value: `Rolled a ${inlineCode(user.toString())}`,
                inline: true
              }
            ])
        )
        .addComponentRow(
          ComponentType.Button, 
          (row) => row.addComponents(btn => 
            btn
              .setCustomId(`roll:${Number(betAmount)}:1`)
              .setLabel(`Reroll (CC ${betAmount.toLocaleString()})`)
              .setStyle(ButtonStyle.Primary)
              .setDisabled(ctx.player.economy.coins < betAmount)
          )
        )
    );
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
