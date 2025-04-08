import { Manager } from '../manager.js';
import { EconomySchema } from '../schemas/Economy.js';

export class EconomyManager extends Manager<EconomySchema> {
  public constructor() {
    super(EconomySchema);
  }
}
