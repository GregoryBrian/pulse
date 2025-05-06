import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Awaitable } from '@sapphire/framework';
import { bold, ChatInputCommandInteraction, Colors } from 'discord.js';
import { PulseCommand, PulseCommandOptions } from '../../utilities/command.js';
import { InteractionContext } from '../../utilities/interaction-context.js';

@ApplyOptions<PulseCommandOptions>({
  name: 'coins',
  description: 'View your coins.',
  deferInitialReply: true
})
export class Coins extends PulseCommand {
  public override async run(ctx: InteractionContext<ChatInputCommandInteraction<'cached'>>) {
    const user = ctx.interaction.options.getUser('user') ?? ctx.user;
    const db = await ctx.database.getPlayer(user.id);

    await ctx.responder.send((builder) =>
      builder.addEmbed((embed) =>
        embed
          .setTitle(`${user.globalName}'s coins`)
          .setColor(Colors.Gold)
          .setDescription(
            ctx.utilities['string'].createStackedText(
              `:coin: ${bold('CC ' + db.economy.coins.toLocaleString())}`,
              `:bank: ${bold('CC ' + db.economy.bank.toLocaleString())}`
            )
          )
          .setFooter({ text: `Requested by ${ctx.user.globalName}` })
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
  deferInitialReply: true
})
export class InjectCommand extends PulseCommand {
  public override async run(ctx: InteractionContext<ChatInputCommandInteraction<'cached'>>) {
    const coins = ctx.utilities['number'].getRandomNumber(1, 1_000) * 1e6;

    await ctx.database.updatePlayer(ctx.user.id, (db) => { return (db.economy.coins += coins), db; });
    await ctx.responder.send((builder) => builder.setContent(`You just received :coin: ${bold(coins.toLocaleString() + ' CC')} from the gods!`));
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
    registry.registerChatInputCommand((command) => command.setName(this.name).setDescription(this.description));
  }
}
