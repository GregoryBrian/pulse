import { container } from '@sapphire/pieces';
import { Game } from '../game.js';

export const enum RollGameOutcome {
  WIN = 1,
  TIE = 0,
  LOSE = -1
}

export interface RollGameOptions {
  readonly sides: number;
}

export class RollGame extends Game<RollGameOutcome> {
  /**
   * The player dice.
   */
  public readonly dice: RollDice;
  /**
   * The opponent dice.
   */
  public readonly opponent: RollDice;
  /**
   * The number of sides the player can have on their dice.
   */
  public readonly sides: number;

  /**
   * Create a new roll with the given number of sides.
   * @param sides The number of sides on the dice.
   */
  public constructor(public options: RollGameOptions) {
    super();
    this.dice = new RollDice(options.sides);
    this.opponent = new RollDice(options.sides);
    this.sides = options.sides;
  }

  /**
   * Gets the proper outcome of the roll.
   */
  public getOutcome(): RollGameOutcome {
    return this.dice.value > this.opponent.value
      ? RollGameOutcome.WIN
      : this.dice.value === this.opponent.value
        ? RollGameOutcome.TIE
        : RollGameOutcome.LOSE;
  }

  /**
   * Run the roll and set the value.
   * @returns This roll.
   */
  public run() {
    this.dice.roll();
    this.opponent.roll();
    return this;
  }
}

export class RollDice {
  /**
   * The value of the dice after it has been rolled.
   */
  public value: number;

  /**
   * Create a new dice with the given number of sides.
   * @param sides The number of sides on the dice.
   */
  public constructor(public sides: number) {
    this.value = 0;
  }

  /**
   * Whether the dice has been rolled or not.
   */
  public get rolled() {
    return this.value !== 0;
  }

  /**
   * Roll the dice and set the value.
   * @returns The rolled value of the dice
   */
  public roll() {
    this.value = container.utilities['number'].getRandomNumber(1, this.sides);
    return this.value;
  }

  /**
   * Reset the dice to its initial state.
   */
  public reset() {
    this.value = 0;
    return this;
  }
}
