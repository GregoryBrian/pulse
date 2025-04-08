import { prop } from '@typegoose/typegoose';
import { ParentSchema } from '../schema.js';
import { PlayerWork } from './PlayerWork.js';
import { PlayerEconomy } from './PlayerEconomy.js'; // Import PlayerEconomy
import { PlayerClaimManager } from './PlayerClaim.js';
import { PlayerGamblingGameManager } from './PlayerGamble.js';
import { PlayerCredit } from './PlayerCredit.js';

export class PlayerSchema extends ParentSchema {
  @prop({
    type: () => PlayerClaimManager,
    default: () => new PlayerClaimManager()
  })
  public claim!: PlayerClaimManager;

  @prop({ type: () => PlayerCredit, default: () => new PlayerCredit() })
  public credit!: PlayerCredit;

  @prop({ type: () => PlayerEconomy, default: () => new PlayerEconomy() })
  public economy!: PlayerEconomy;

  @prop({
    type: () => PlayerGamblingGameManager,
    default: () => new PlayerGamblingGameManager()
  })
  public gambling!: PlayerGamblingGameManager;

  @prop({ type: () => PlayerWork, default: () => new PlayerWork() })
  public work!: PlayerWork;
}
