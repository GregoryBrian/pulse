import { prop } from '@typegoose/typegoose';

export class EconomyReserveCollection {
	@prop({ type: Number, default: 0 })
	public gambling!: number;

	@prop({ type: Number, default: 0 })
	public working!: number;

	@prop({ type: Number, default: 0 })
	public drops!: number;

	@prop({ type: Number, default: 0 })
	public tax!: number;

	public incrementGambling(value: number) {
		this.gambling += value;
		return this;
	}

	public incrementWorking(value: number) {
		this.working += value;
		return this;
	}

	public incrementDrops(value: number) {
		this.drops += value;
		return this;
	}

	public incrementTax(value: number) {
		this.tax += value;
		return this;
	}

	public get total() {
		return this.gambling + this.working + this.drops + this.tax;
	}
}

export class EconomyReserve {
	@prop({ type: Number, default: 0 })
	public goal!: number;

	@prop({ type: Number, default: 0 })
	public deposited!: number;

	@prop({
		type: () => EconomyReserveCollection,
		default: () => new EconomyReserveCollection()
	})
	public collection!: EconomyReserveCollection;

	public setGoal(value: number) {
		this.goal = value;
		return this;
	}

	public incrementDeposited(value: number) {
		this.deposited += value;
		return this;
	}
}
