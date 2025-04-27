import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Awaitable } from '@sapphire/framework';
import { bold, Colors } from 'discord.js';
import { PulseCommand, PulseCommandOptions, PulseCommandRunContext } from '../../utilities/command.js';

@ApplyOptions<PulseCommandOptions>({
  name: 'coins',
  description: 'View your coins.',
  deferInitialReply: true,
})
export class Coins extends PulseCommand {
  public override async run(ctx: PulseCommandRunContext) {
    const user = ctx.interaction.options.getUser('user') ?? ctx.interaction.user;
    const db = user.id === ctx.interaction.user.id ? ctx.player : await this.container.db.get('Player', user.id);

    await ctx.responder.send((builder) =>
      builder
        .addEmbed((embed) =>
          embed
            .setTitle(`${user.globalName}'s coins`)
            .setColor(Colors.Gold)
            .setDescription(ctx.utilities['string'].createStackedText(
              `:coin: ${bold(db.economy.coins.toLocaleString() + ' CC')}`,
              `:bank: ${bold(db.economy.bank.toLocaleString() + ' CC')}`,
            ))
            .setFooter({ text: `Requested by ${ctx.interaction.user.globalName}` })
            .setTimestamp()
        )
    );
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

@ApplyOptions<PulseCommandOptions>({
  name: 'inject',
  description: 'Inject random amount of coins.',
  deferInitialReply: true,
})
export class InjectCommand extends PulseCommand {
  public override async run(ctx: PulseCommandRunContext) {
    const coins = ctx.utilities['number'].getRandomNumber(1, 100) * 1e6;

    ctx.updatePlayer(db => db.economy.coins += coins);

    await ctx.responder.send((builder) => builder.setContent(`You just received :coin: ${bold(coins.toLocaleString() + ' CC')} from the gods!`));
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
    registry.registerChatInputCommand((command) => command.setName(this.name).setDescription(this.description));
  }
}