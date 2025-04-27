import { Awaitable, Command, container } from '@sapphire/framework';
import { ChatInputCommandInteraction } from 'discord.js';
import { Utilities } from '@sapphire/plugin-utilities-store';
import { PlayerSchema } from '../database/schemas/Player.js';
import { Responder } from './responder.js';
import { CreateFunctionType } from '../types/index.js';

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

    public override async chatInputRun(interaction: ChatInputCommandInteraction): Promise<void> {
        const context = Reflect.construct(PulseCommandRunContext, [
            {
                player: await this.container.db.get('Player', interaction.user.id),
                utilities: this.container.utilities,
                interaction,
                responder: new Responder(interaction),
            }
        ]) as PulseCommandRunContext;

        // Defer the initial reply if the option is set to true
        if (this.deferInitialReply) {
            await interaction.deferReply();
        }

        // Execute the command
        await Reflect.apply(this.run, this, [context]);
    }

    public abstract run(context: PulseCommandRunContext): Awaitable<void>;
}

export interface IPulseCommandRunContext {
    player: PlayerSchema;
    utilities: Utilities;
    interaction: ChatInputCommandInteraction<'cached'>;
    responder: Responder<'cached', ChatInputCommandInteraction<'cached'>>;
}

export class PulseCommandRunContext implements IPulseCommandRunContext {
    public player: PlayerSchema;
    public utilities: Utilities;
    public interaction: ChatInputCommandInteraction<'cached'>;
    public responder: Responder<'cached', ChatInputCommandInteraction<'cached'>>;
    public constructor(public options: IPulseCommandRunContext) {
        this.player = options.player;
        this.utilities = options.utilities;
        this.interaction = options.interaction;
        this.responder = new Responder(options.interaction);
    }

    public async updatePlayer<T>(fn: CreateFunctionType<[doc: PlayerSchema], T>, id = this.interaction.user.id) {
        return await container.db.managers.Player.update(id, fn), this;
    }
}