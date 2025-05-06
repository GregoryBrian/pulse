import { container } from "@sapphire/pieces";
import { Database } from "../database/db.js";
import { Responder, ResponderTarget } from "./responder.js";
import { Utilities } from "@sapphire/plugin-utilities-store";

export interface InteractionContextOptions<I extends ResponderTarget<'cached'>> {
    readonly interaction: I;
    readonly responder: Responder<'cached', I>;
}

export class InteractionContext<I extends ResponderTarget<'cached'>> {
    public readonly database: Database;
    public readonly interaction: I;
    public readonly responder: Responder<'cached', I>;
    public readonly utilities: Utilities;

    public constructor(options: InteractionContextOptions<I>) {
        this.database = container.db;
        this.interaction = options.interaction;
        this.responder = new Responder(options.interaction);
        this.utilities = container.utilities;
    }

    public get channel() {
        return this.interaction.channel;
    }

    public get guild() {
        return this.channel.guild;
    }

    public get user() {
        return this.interaction.user;
    }

    public static from<I extends ResponderTarget<'cached'>>(options: InteractionContextOptions<I>) {
        return Reflect.construct(this, [options]);
    }
}