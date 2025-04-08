import { prop } from '@typegoose/typegoose';
import { ParentSchema } from '../schema.js';
import { EconomyBudget } from './EconomyBudget.js';
import { EconomyReserve } from './EconomyReserve.js';

export class EconomySchema extends ParentSchema {
	@prop({ type: () => EconomyBudget, default: () => new EconomyBudget() })
	public budget!: EconomyBudget;

	@prop({ type: () => EconomyReserve, default: () => new EconomyReserve() })
	public reserve!: EconomyReserve;
}
