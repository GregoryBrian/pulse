import { Awaitable, Command } from '@sapphire/framework';
import { ChatInputCommandInteraction } from 'discord.js';
import { PlayerManager } from '../database/managers/Player.js';
import { Utilities } from '@sapphire/plugin-utilities-store';

export interface PulseCommandOptions extends Command.Options {
  allowedInFlow?: boolean;
}

export interface PulseCommandRunContext {
  interaction: ChatInputCommandInteraction;
  responder: any; // PulseCommandResponder;
  utilities: Utilities;
  database: {
    user: PlayerManager['update'];
  };
}

export abstract class PulseCommand extends Command {
  public allowedInFlow: boolean;

  public constructor(context: Command.LoaderContext, options: PulseCommandOptions) {
    super(context, options);
    this.allowedInFlow = options.allowedInFlow ?? true;
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction): Promise<void> {
    const context: PulseCommandRunContext = {
      interaction,
      responder: null,
      utilities: this.container.utilities,
      database: {
        user: this.container.db.managers.player.update.bind(this.container.db.managers.player)
      }
    };

    await Reflect.apply(this.run, this, [context]);
  }

  public abstract run(context: PulseCommandRunContext): Awaitable<void>;
}
