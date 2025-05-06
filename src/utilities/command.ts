import { Awaitable, Command } from '@sapphire/framework';
import { ChatInputCommandInteraction } from 'discord.js';
import { Responder } from './responder.js';
import { InteractionContext } from './interaction-context.js';

export interface PulseCommandOptions extends Command.Options {
  allowedInFlow?: boolean;
  deferInitialReply?: boolean;
}

export abstract class PulseCommand extends Command {
  public allowedInFlow: boolean;
  public deferInitialReply: boolean;

  public constructor(context: Command.LoaderContext, options: PulseCommandOptions) {
    super(context, options);
    this.allowedInFlow = options.allowedInFlow ?? true;
    this.deferInitialReply = options.deferInitialReply ?? false;
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
    const context = new InteractionContext({ interaction, responder: new Responder(interaction) });

    // Defer the initial reply if the option is set to true
    if (this.deferInitialReply) {
      await interaction.deferReply();
    }

    // Execute the command
    await Reflect.apply(this.run, this, [context]);
  }

  public abstract run(context: InteractionContext<ChatInputCommandInteraction<'cached'>>): Awaitable<void>;
}
