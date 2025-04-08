import { Utility } from '@sapphire/plugin-utilities-store';
import { Collection } from 'discord.js';
import type { FirstArgument } from '@sapphire/utilities';

export class IterableUtilities extends Utility {
	public constructor(context: Utility.LoaderContext) {
		super(context, { name: IterableUtilities.Name });
	}

	/**
	 * Gets a random element from the source array.
	 * @param arr The source array.
	 * @template T The elements' types.
	 * @returns The element.
	 */
	public getRandomElement = <T>(arr: T[]) => {
		if (!Array.isArray(arr)) throw new Error('Invalid array.');
		if (!arr.length) throw new Error('Received empty array.');

		return arr.at(Math.floor(Math.random() * arr.length))!;
	};

	/**
	 * Excludes specific element(s) from the source array.
	 * @param arr The array.
	 * @param elems The elements to exclude.
	 * @template T The elements' types.
	 * @returns The array.
	 */
	public filterElements = <T>(arr: T[], elems: T[]): T[] => {
		return arr.filter((arrElem) => !elems.some((elem) => arrElem !== elem));
	};

	/**
	 * Shuffles the order of all elements of an array.
	 * @param arr The target array.
	 * @template T The elements' types.
	 * @returns The array.
	 */
	public shuffleElements = <T>(arr: T[]): T[] => {
		return arr.sort(() => Math.random() - 0.5);
	};

	/**
	 * Gets a certain amount of random elements from an array.
	 * @param arr The source array.
	 * @param len The amount of items to return.
	 * @param unique If each random elements should only appear once within the array.
	 * @template T The elements' types.
	 * @returns An array that contains random elements.
	 */
	public getRandomElements = <T>(arr: T[], len = arr.length, unique = true): T[] => {
		const elems: T[] = [];

		while (elems.length < len) {
			const srcArr = unique ? this.filterElements(arr, elems) : arr;
			const randElem = this.getRandomElement(srcArr);

			void this.insertElement(elems, randElem);
		}

		return elems;
	};

	/**
	 * Converts an array into a {@link Collection discord.js Collection}.
	 * @param arr The target array.
	 * @param prop The function to call for the key of an element.
	 * @param collection A {@link Collection discord.js collection} instance.
	 * @template T The elements' types.
	 * @template Id The collections' keys' presumed type.
	 * @returns The collection.
	 */
	public toCollection = <T, Id extends string | number>(
		arr: T[],
		prop: (value: T) => Id,
		collection = new Collection<Id, T>()
	): Collection<Id, T> => {
		return arr.reduce((col, elem) => col.set(prop(elem), elem), collection);
	};

	/**
	 * Retrieves the amount of duplicates an element has within an array.
	 * @param arr The source array.
	 * @param elem The element to check for.
	 * @template T The elements' type.
	 * @returns The amount of dupes the element has.
	 */
	public retrieveCommonElementsLength = <T>(arr: T[], elem: T): number => {
		return arr.filter((el) => el === elem).length;
	};

	/**
	 * Inserts an element into the target array.
	 * @param arr The target array.
	 * @param elem The element.
	 * @template T The elements' type.
	 * @returns The element inserted.
	 */
	public insertElement = <T>(arr: T[], elem: T): T => {
		arr.push(elem);
		return elem;
	};

	/**
	 * Returns the element that passes the filter and removes it from the array.
	 * @param arr The source array.
	 * @param filter The filter predicate.
	 * @template T The elements' type.
	 * @returns The element that passed the filter, or `null`.
	 */
	public extractElement = <T>(arr: T[], filter: FirstArgument<T[]['findIndex']>): T | null => {
		const index = arr.findIndex(filter);
		const removed = arr.splice(index, index === -1 ? 0 : 1);

		return removed.at(0) ?? null;
	};
}

export namespace IterableUtilities {
	export const Name = 'iterable' as const;
}

declare module '@sapphire/plugin-utilities-store' {
	interface Utilities {
		[IterableUtilities.Name]: Omit<IterableUtilities, keyof Utility>;
	}
}
