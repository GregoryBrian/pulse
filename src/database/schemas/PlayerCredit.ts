import { prop } from '@typegoose/typegoose';

export class PlayerCredit {
	@prop({ type: Number, default: 0 })
	public available!: number;

	@prop({ type: Number, default: 0 })
	public balance!: number;

	@prop({ type: Date, default: 0 })
	public nextBilling!: Date;
}
