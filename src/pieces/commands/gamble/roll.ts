import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Awaitable } from '@sapphire/framework';
import { bold, ButtonStyle, ChatInputCommandInteraction, Colors, ComponentType, inlineCode, subtext } from 'discord.js';
import { PulseCommand, PulseCommandOptions } from '../../../utilities/command.js';
import { RollGamblingGame, RollGamblingGameWinningsType } from '../../../games/roll/game.gambling.js';
import { RollGameOutcome } from '../../../games/roll/game.js';
import { InteractionContext } from '../../../utilities/interaction-context.js';

@ApplyOptions<PulseCommandOptions>({
  name: 'roll',
  description: 'Roll a dice.',
  deferInitialReply: true
})
export default class extends PulseCommand {
  private getTimeoutMS(roll: RollGamblingGame): number {
    switch (roll.getOutcome()) {
      case RollGameOutcome.WIN: {
        return 1_000;
      }

      default: {
        return 250;
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

  public async run(ctx: InteractionContext<ChatInputCommandInteraction<'cached'>>) {
    const { createStackedText, createTimeout } = { ...ctx.utilities['string'], ...ctx.utilities['promise'] };
    const bet = ctx.interaction.options.getNumber('bet', true) ?? 0;
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

    await ctx.responder.send((builder) =>
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
              .setCustomId(`roll:${Number(bet)}:1`)
              .setEmoji('🎲')
              .setLabel(`Play Again — CC ${bet.toLocaleString()}`)
              .setStyle(ButtonStyle.Primary)
              .setDisabled(player.economy.coins < bet)
          );

          return row;
        })
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
