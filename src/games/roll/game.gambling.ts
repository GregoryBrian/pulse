import { RollGame, RollGameOptions, RollGameOutcome } from './game.js';
import { Mixin } from 'ts-mixer';
import { GamblingGame, GamblingGameOptions } from '../game.gambling.js';

export const enum RollGamblingGameWinningsType {
  Dice = 1,
  Random = 2
}

export interface RollGamblingGameOptions extends GamblingGameOptions, RollGameOptions {
  winningsType: RollGamblingGameWinningsType;
}

export class RollGamblingGame extends Mixin(RollGame, GamblingGame<RollGameOutcome>) {
  public calculatedWinnings: number;
  public readonly winningsType: RollGamblingGameWinningsType;
  public constructor(options: RollGamblingGameOptions) {
    super(options);
    this.calculatedWinnings = 0;
    this.winningsType = options.winningsType;
  }

  public override get net(): number {
    return this.calculatedWinnings - this.bet;
  }

  public override get winnings(): number {
    let winnings: number;
    let diceDiff = this.dice.value - this.opponent.value;
    let diceMaxDiff = this.sides;
    let { bonus, max, min } = this.multipliers;

    Outcome: switch (this.getOutcome()) {
      case RollGameOutcome.WIN: {
        WinningsType: switch (this.winningsType) {
          case RollGamblingGameWinningsType.Dice: {
            winnings = this.bet * Number((1 + (diceDiff / diceMaxDiff) * (max - 1)).toFixed(2));
            break WinningsType;
          }

          case RollGamblingGameWinningsType.Random: {
            winnings = this.bet * (min + Math.random() * max + bonus);
            break WinningsType;
          }
        }

        break Outcome;
      }

      case RollGameOutcome.TIE: {
        winnings = this.bet;
        break Outcome;
      }

      case RollGameOutcome.LOSE: {
        WinningsType: switch (this.winningsType) {
          case RollGamblingGameWinningsType.Dice: {
            winnings = this.bet * Number((1 + diceDiff / diceMaxDiff).toFixed(2));
            break WinningsType;
          }

          case RollGamblingGameWinningsType.Random: {
            winnings = -this.bet;
            break WinningsType;
          }
        }

        break Outcome;
      }
    }

    return (this.calculatedWinnings = Math.trunc(winnings));
  }
}
