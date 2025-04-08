import { prop } from '@typegoose/typegoose';
import { ChildSchema, CreateChildSchemaManager } from '../schema.js';

export const enum PlayerClaimType {
	HOURLY = 1,
	DAILY = 24,
	WEEKLY = 7,
	MONTHLY = 28,
	YEARLY = 365
}

export class PlayerClaim extends ChildSchema<PlayerClaimType> {
	@prop({ type: Number, default: 0 })
	public streak!: number;

	@prop({ type: Date, default: 0 })
	public lastClaimed!: Date;
}

export class PlayerClaimManager extends CreateChildSchemaManager(PlayerClaim) {}
