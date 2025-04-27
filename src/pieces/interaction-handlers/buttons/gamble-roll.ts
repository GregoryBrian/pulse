import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { bold, ButtonInteraction, ButtonStyle, Colors, ComponentType, inlineCode } from "discord.js";
import { Payload } from "../../../types/index.js";
import { Responder } from "../../../utilities/responder.js";
import { PlayerSchema } from "../../../database/schemas/Player.js";

export default class GambleRoll extends InteractionHandler {
    public constructor(context: InteractionHandler.LoaderContext) {
        super(context, {
            interactionHandlerType: InteractionHandlerTypes.Button,
        });
    }

    public override async run(interaction: ButtonInteraction<'cached'>, { value: betAmount, rolls }: GambleRoll.Parsed) {
        const responder = new Responder(interaction);
        const { getRandomNumber } = this.container.utilities['number'];
        const { createStackedText } = this.container.utilities['string'];
        const ctx = {
            interaction,
            responder,
            player: await this.container.db.managers.Player.fetch(interaction.user.id),
            utilities: this.container.utilities,
            updatePlayer: async (callback: (db: PlayerSchema) => void) => {
                return await this.container.db.managers.Player.update(interaction.user.id, callback);
            },
        };

        const [bot, user] = [getRandomNumber(1, 12), getRandomNumber(1, 12)];
        let winnings = user > bot ? Math.round(betAmount * (0.01 + Math.random() * 2.24 + Number((rolls / 10).toFixed(1)))) : user === bot ? 0 : -betAmount;

        if (betAmount >= ctx.player.economy.coins) {
            return void await ctx.responder.send(builder =>
                builder.setContent('You don\'t have enough coins to bet that much!')
            );
        }

        ctx.updatePlayer(db => db.economy.coins += winnings);

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
                        .setFooter({ text: `Rolls: ${rolls}` })
                )
                .addComponentRow(
                    ComponentType.Button,
                    (row) => row.addComponents(btn =>
                        btn
                            .setCustomId(`roll:${betAmount}:${rolls + 1}`)
                            .setLabel(`Reroll (CC ${betAmount.toLocaleString()})`)
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(ctx.player.economy.coins < betAmount)
                    )
                )
        );
    }

    public override parse(interaction: ButtonInteraction) {
        if (interaction.customId.startsWith('roll')) {
            const [, value, rolls] = interaction.customId.split(':').map(Number);
            return this.some({ value, rolls });
        }

        return this.none();
    }
}

export declare namespace GambleRoll {
    interface Parsed extends Payload<number> {
        rolls: number;
    }
} 