import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { bold, ButtonInteraction, ButtonStyle, Colors, ComponentType, inlineCode } from 'discord.js';
import { Payload } from '../../../types/index.js';
import { Responder } from '../../../utilities/responder.js';
import { RollGamblingGame, RollGamblingGameWinningsType } from '../../../games/roll/game.gambling.js';
import { subtext } from '@discordjs/formatters';
import { InteractionContext } from '../../../utilities/interaction-context.js';
import { RollGameOutcome } from '../../../games/roll/game.js';

export default class GambleRoll extends InteractionHandler {
  public constructor(context: InteractionHandler.LoaderContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button
    });
  }

  private getTimeoutMS(roll: RollGamblingGame): number {
    switch (roll.getOutcome()) {
      case RollGameOutcome.WIN: {
        return 250;
      }

      default: {
        return 100;
      }
    }
  }

  private getEmbedColor(roll: RollGamblingGame) {
    switch (roll.getOutcome()) {
      case RollGameOutcome.WIN: {
        return Colors.Green;
      }

      case RollGameOutcome.TIE: {
        return Colors.Yellow;
      }

      case RollGameOutcome.LOSE: {
        return Colors.Red;
      }
    }
  }

  public override async run(interaction: ButtonInteraction<'cached'>, { value: bet, rolls }: GambleRoll.Parsed) {
    const ctx = InteractionContext.from({ interaction, responder: new Responder(interaction) });
    const { createStackedText, createTimeout } = { ...ctx.utilities['string'], ...ctx.utilities['promise'] };
    let player = await ctx.database.getPlayer(ctx.user.id);

    if (bet >= player.economy.coins) {
      return void (await ctx.responder.send((builder) => builder.setContent("You don't have enough coins to bet that much!")));
    }

    const roll = new RollGamblingGame({
      bet,
      multipliers: { min: 0, max: 2, bonus: 0 },
      sides: 12,
      winningsType: RollGamblingGameWinningsType.Dice
    });

    void ctx.responder.content.removeEmbed(0);
    await ctx.responder.edit((builder) =>
      builder.addEmbed((embed) =>
        embed.setColor(Colors.White).setDescription(`:game_die: Rolling a ${bold(`D${roll.sides}`)} for ${bold('CC ' + bet.toLocaleString())}...`)
      )
    );

    void roll.run();

    await createTimeout(this.getTimeoutMS(roll), null);
    player = await ctx.database.updatePlayer(ctx.user.id, (doc) => {
      doc.economy.coins = Math.trunc(doc.economy.coins + roll.net);
      return doc;
    });

    void ctx.responder.content.removeEmbed(0);
    await ctx.responder.edit((builder) =>
      builder
        .addEmbed((embed) =>
          embed
            .setAuthor({ name: `${ctx.user.globalName}'s Dice Roll` })
            .setColor(this.getEmbedColor(roll))
            .setDescription(
              createStackedText(
                `Coins: ${bold('CC ' + player.economy.coins.toLocaleString())}`,
                `Winnings: ${bold('CC ' + Math.max(0, roll.calculatedWinnings).toLocaleString())}`,
                subtext(`Net: ${bold(`CC ${roll.getOutcome() !== RollGameOutcome.LOSE ? '+' : ''}${roll.net.toLocaleString()}`)}\n`)
              )
            )
            .addFields([
              {
                name: `${ctx.user.displayName} (You)`,
                value: `Rolled a ${inlineCode(roll.dice.value.toString())}`,
                inline: true
              },
              {
                name: `${ctx.user.client.user.username} (Opponent)`,
                value: `Rolled a ${inlineCode(roll.opponent.value.toString())}`,
                inline: true
              }
            ])
        )
        .addComponentRow(ComponentType.Button, (row) => {
          row.addComponents((btn) =>
            btn
              .setCustomId(`roll:${Number(bet)}:${rolls + 1}`)
              .setEmoji('🎲')
              .setLabel(`Play Again — CC ${bet.toLocaleString()}`)
              .setStyle(ButtonStyle.Primary)
              .setDisabled(player.economy.coins < bet)
          );

          return row;
        })
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
