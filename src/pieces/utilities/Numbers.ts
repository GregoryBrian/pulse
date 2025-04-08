import { Utility } from '@sapphire/plugin-utilities-store';
import { Payload } from '../../types/index.js';

export class NumberUtilities extends Utility {
	public constructor(context: Utility.LoaderContext) {
		super(context, { name: NumberUtilities.Name });
	}

	/**
	 * Returns a random number between two specific number points.
	 * @param min The minimum number.
	 * @param max The maximim number.
	 * @returns A random number.
	 */
	public getRandomNumber = (min: number, max: number): number => {
		return Math.round(Math.random() * (max - min) + min);
	};

	/**
	 * Distributes the amount unevenly into an array with a specific size.
	 * @param amount The amount.
	 * @param size The size of the array.
	 * @returns An array of {@link Payload payload}s.
	 */
	public distributePercentage = (amount: number, size: number): Payload<number>[] => {
		const { getRandomElement } = this.container.utilities['array'];

		const mutate = (value: number): Payload<number> => ({ value });
		const distributed = Array(size)
			.fill(null)
			.map(() => mutate(Math.floor(100 / size)));

		for (let i = size; i > 0; i--) {
			getRandomElement(distributed).value++;
			getRandomElement(distributed).value--;
		}

		return distributed.map(({ value }) => mutate(amount * (value / 100))).sort((a, b) => b.value - a.value);
	};

	/**
	 * Checks if a number has decimals.
	 * @param num The number.
	 * @returns A boolean.
	 */
	public hasDecimals = (num: number): boolean => Math.trunc(num) !== num;

	/**
	 * Checks if something is a number.
	 * @param value The value.
	 * @returns A boolean.
	 */
	public isNumber = <T>(value: T | unknown): value is number => {
		return typeof value === 'number' && !Number.isNaN(Number(value));
	};
}

export namespace NumberUtilities {
	export const Name = 'number' as const;
}

declare module '@sapphire/plugin-utilities-store' {
	interface Utilities {
		[NumberUtilities.Name]: Omit<NumberUtilities, keyof Utility>;
	}
}
