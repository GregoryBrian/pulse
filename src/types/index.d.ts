import type { AliasStore, Store } from '@sapphire/framework';
import type { Awaitable } from 'discord.js';

/**
 * Creates a function type.
 * @template A The arguments of the callback.
 * @template R The callback's supposed return type.
 */
type CreateFunctionType<A extends unknown[], R> = (...args: A) => R;

/**
 * Returns the type of piece a sapphire store handles.
 * @template S The store.
 */
type ReturnStorePieceType<S> = S extends Store<infer P> | AliasStore<infer P> ? P : never;

/**
 * Returns the value of a promise holds.
 * @template P A promise.
 */
type ReturnPromiseValue<P> = P extends Promise<infer V> | Awaitable<infer V> ? V : never;

/**
 * Represents a generic payload that contains a value.
 * @template V The value's type.
 */
interface Payload<V> {
  /**
   * The containing value.
   */
  value: V;
}

/**
 * Creates a generic object with a typed value.
 * @template V The value's type.
 */
type CreatePayload<V> = Payload<V>;
