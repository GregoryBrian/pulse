import { Manager } from '../manager.js';
import { PlayerSchema } from '../schemas/Player.js';

export class PlayerManager extends Manager<PlayerSchema> {
  public constructor() {
    super(PlayerSchema);
  }
}
