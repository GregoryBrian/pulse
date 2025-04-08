import { prop } from '@typegoose/typegoose';

export class EconomyBudget {
	@prop({ type: Number, default: 0 })
	public value!: number;

	@prop({ type: Number, default: 0 })
	public withdrawn!: number;
}
