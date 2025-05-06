/**
 * Represents a game.
 * @template O The possible outcomes of this game.
 */
export abstract class Game<O extends number | string> {
  /**
   * The game's outcome.
   */
  public outcome: O | null;

  /**
   * The game's constructor.
   */
  public constructor() {
    this.outcome = null;
  }

  /**
   * Checks if the outcome of this game is that outcome.
   * @param outcome The outcome to check.
   */
  public isOutcome(outcome: O): this is this & Game<O> {
    return this.outcome === outcome;
  }

  /**
   * Runs the logic of this game.
   * @param args The arguments of this function.
   */
  public abstract run(...args: unknown[]): this;

  /**
   * Sets the new outcome of this game.
   * @param outcome The outcome of this game.
   * @returns This game.
   */
  protected setOutcome(outcome: O): this {
    this.outcome = outcome;
    return this;
  }
}
