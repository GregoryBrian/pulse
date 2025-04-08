import { prop } from '@typegoose/typegoose';

export class PlayerEconomy {
  @prop({ type: Number, default: 0 })
  public coins!: number;

  @prop({ type: Number, default: 0 })
  public bank!: number;

  @prop({ type: Number, default: 0 })
  public credit!: number;

  @prop({ type: Number, default: 0 })
  public stars!: number;

  public get prestige() {
    return 0;
  }
}
