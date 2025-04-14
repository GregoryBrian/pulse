import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Awaitable, Command } from '@sapphire/framework';
import { bold, ChatInputCommandInteraction, Colors } from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'coins',
  description: 'View your coins.'
})
export class Coins extends Command {
  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const user = interaction.options.getUser('user') ?? interaction.user;
    const db = await this.container.db.managers.player.fetch(user.id);

    await interaction.editReply({
      embeds: [
        {
          title: `${user.globalName}'s coins`,
          color: Colors.Gold,
          description: `${bold(db.economy.coins.toLocaleString() + ' CC')} at the moment.`
        }
      ]
    });
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
    registry.registerChatInputCommand(
      (command) =>
        command
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) => option.setName('user').setDescription('The user you want to check for.')),
      { idHints: ['1359050310122868767'] }
    );
  }
}

@ApplyOptions<Command.Options>({
  name: 'add',
  description: 'Add random amount of coins.'
})
export class Add extends Command {
  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const db = await this.container.db.managers.player.fetch(interaction.user.id);
    const amount = this.container.utilities['number'].getRandomNumber(1, 100) * 1e6;

    await this.container.db.managers.player.update(interaction.user.id, (doc) => (doc.economy.coins += amount));

    await interaction.editReply(
      `You just received ${bold(amount.toLocaleString() + ' CC')} from the gods!\nYou have ${bold(db.economy.coins.toLocaleString() + ' CC')} now.`
    );
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
    registry.registerChatInputCommand((command) => command.setName(this.name).setDescription(this.description));
  }
}
