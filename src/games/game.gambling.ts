import { Game } from './game.js';

export interface GamblingGameMultipliers {
  bonus: number;
  max: number;
  min: number;
}

export interface GamblingGameOptions {
  readonly bet: number;
  readonly multipliers: GamblingGameMultipliers;
}

export abstract class GamblingGame<O extends string | number> extends Game<O> {
  public bet: number;
  public multipliers: GamblingGameMultipliers;

  public constructor(protected options: GamblingGameOptions) {
    super();
    this.bet = options.bet;
    this.multipliers = options.multipliers;
  }

  public abstract get net(): number;

  public abstract get winnings(): number;
}
