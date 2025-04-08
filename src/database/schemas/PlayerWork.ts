import { modelOptions, prop } from '@typegoose/typegoose';
import { CreateChildSchemaManager } from '../schema.js';

export class PlayerWorkShiftHours {
	@prop({ type: Number, default: 0 })
	public regular!: number;

	@prop({ type: Number, default: 0 })
	public undertime!: number;

	@prop({ type: Number, default: 0 })
	public overtime!: number;
}

export class PlayerWorkShift {
	@prop({ type: Date, default: null })
	public start!: Date | null;

	@prop({ type: () => PlayerWorkShiftHours, default: new PlayerWorkShiftHours() })
	public hours!: PlayerWorkShiftHours;

	@prop({ type: Date, default: new Date() })
	public end!: Date;
}

export class PlayerWorkEarnings {
	@prop({ type: Number, default: 0 })
	public overtime!: number;

	@prop({ type: Number, default: 0 })
	public regular!: number;
}

export class PlayerWorkEmploymentHistory {
	@prop({ type: String })
	public id!: string;

	@prop({ type: () => PlayerWorkEarnings })
	public earnings!: PlayerWorkEarnings;

	@prop({ type: () => PlayerWorkShiftHours })
	public hours!: PlayerWorkShiftHours;
}

export class PlayerWorkEmploymentHistoryManager extends CreateChildSchemaManager(PlayerWorkEmploymentHistory) {
	public get totalHours() {
		return this.entries.reduce((prev, job) => prev + (job.hours.regular + job.hours.overtime), 0);
	}

	public get totalEarnings() {
		return this.entries.reduce((prev, job) => prev + (job.earnings.regular + job.earnings.overtime), 0);
	}
}

export class PlayerWorkEmployment {
	@prop({ type: () => PlayerWorkEmploymentHistory, default: new PlayerWorkEmploymentHistory() })
	public history!: PlayerWorkEmploymentHistory;

	@prop({ type: Number, default: 0 })
	public absentDays!: number;

	@prop({ type: Date, default: null })
	public resignedUntil!: Date | null;

	@prop({ type: Date, default: null })
	public terminatedUntil!: Date | null;
}

@modelOptions({ schemaOptions: { _id: false } })
export class PlayerWork {
	@prop({ type: String, default: null })
	public jobId!: string | null;

	@prop({ type: () => PlayerWorkShift, default: () => new PlayerWorkShift() })
	public shift!: PlayerWorkShift;

	@prop({ type: () => PlayerWorkEarnings, default: () => new PlayerWorkEarnings() })
	public earnings!: PlayerWorkEarnings;

	@prop({ type: () => PlayerWorkEmployment, default: () => new PlayerWorkEmployment() })
	public employment!: PlayerWorkEmployment;
}
