import { prop } from '@typegoose/typegoose';
import { ChildSchema, CreateChildSchemaManager } from '../schema.js';

export class PlayerGamblingGameAmount {
  @prop({ type: Number, default: 0 })
  public won!: number;

  @prop({ type: Number, default: 0 })
  public lost!: number;

  @prop({ type: Number, default: 0 })
  public tied!: number;

  @prop({ type: Number, default: 0 })
  public jackpot!: number;

  @prop({ type: Number, default: 0 })
  public bet!: number;
}

export class PlayerGamblingGameStreak {
  @prop({ type: Number, default: 0 })
  public win!: number;

  @prop({ type: Number, default: 0 })
  public loss!: number;
}

export class PlayerGamblingGame extends ChildSchema<string> {
  @prop({ type: () => PlayerGamblingGameAmount, default: () => new PlayerGamblingGameAmount() })
  public amount!: PlayerGamblingGameAmount;

  @prop({ type: () => PlayerGamblingGameStreak, default: () => new PlayerGamblingGameStreak() })
  public streak!: PlayerGamblingGameStreak;

  @prop({ default: () => new Date() })
  public lastRan!: Date;
}

export class PlayerGamblingGameManager extends CreateChildSchemaManager(PlayerGamblingGame) {}
