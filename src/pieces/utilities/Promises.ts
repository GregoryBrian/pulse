import { Utility } from '@sapphire/plugin-utilities-store';
import type { Awaitable } from 'discord.js';
import { setTimeout } from 'node:timers/promises';
import { CreateFunctionType } from '../../types/index.js';

export class PromiseUtilities extends Utility {
  public constructor(context: Utility.LoaderContext) {
    super(context, { name: PromiseUtilities.Name });
  }

  /**
   * Creates a timeout that returns a value after the timeout runs out.
   * @param ms The timeout in milliseconds.
   * @param value The value to return.
   * @returns The value.
   */
  public createTimeout = <T>(ms: number, value: T) => setTimeout(ms, value);

  /**
   * Awaits for multiple promises to be fulfilled before the timeout runs out.
   * @param ms The timeout.
   * @param promises The promises to await for.
   * @returns Values returned by the promises.
   */
  public wait = <T>(ms: number, ...promises: Promise<T>[]) => {
    return Promise.race([this.createTimeout(ms, ms).then(Promise.reject), ...promises]);
  };

  /**
   * Checks if a settled result is fulfilled.
   * @param result A settled result.
   * @returns A boolean.
   */
  public isPromiseFulfilled = <T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> => {
    return result.status === 'fulfilled';
  };

  /**
   * Creates an interval that ticks every second until the time runs out.
   * @param time The time in seconds.
   * @param callback The function to call every tick.
   * @returns An empty resolved value.
   */
  public createInterval = <T>(time: number, callback: CreateFunctionType<[ms: number], Awaitable<T>>): Promise<void> => {
    return this.wait(
      time * 1_000,
      new Promise(async (resolve) => {
        while (time > 0) {
          await Reflect.apply(callback, null, [time]);
          await this.createTimeout(1_000, time--);
        }

        return resolve();
      })
    );
  };
}

export namespace PromiseUtilities {
  export const Name = 'promise' as const;
}

declare module '@sapphire/plugin-utilities-store' {
  interface Utilities {
    [PromiseUtilities.Name]: Omit<PromiseUtilities, keyof Utility>;
  }
}
