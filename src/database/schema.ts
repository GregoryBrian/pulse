import { container } from '@sapphire/pieces';
import { isNumber, type Ctor } from '@sapphire/utilities';
import { prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { Payload } from '../types/index.js';

export type TransformSchema<S> = {
  [K in keyof S]: S[K] extends Payload<unknown> ? PayloadToSchema<S[K]> : S[K];
} & { _id: S extends { id: infer Id extends string | number } ? Id : never };

/**
 * Represents the base class for all database schemas.
 */
export abstract class ParentSchema {
  /**
   * The schema's unique identifier.
   */
  @prop({ type: String, immutable: true })
  public readonly _id!: string;
}

export abstract class ChildSchema<Id extends string | number> {
  @prop({ type: mongoose.SchemaTypes.Mixed, immutable: true })
  public readonly id!: Id;

  public constructor(id: Id) {
    this.id = id;
  }
}

/**
 * Transforms a {@link Payload payload} into a {@link ValueSchema value schema}.
 * @template T The payload.
 */
export type PayloadToSchema<T> = T extends Payload<infer U extends ValueSchema.SupportedTypes> ? ValueSchema<U> : T;

/**
 * Represents a schema with a containing value.
 * @template T The value's type.
 */
export abstract class ValueSchema<T extends ValueSchema.SupportedTypes> implements Payload<T> {
  /**
   * The value of this schema.
   */
  public abstract value: T;

  /**
   * If the value is a number, this adds the specified value to the schema's value.
   * @param value The value.
   * @returns This schema.
   */
  public add(value: T): this {
    if (isNumber(value) && isNumber(this.value)) {
      (this.value as number) += value;
    }

    return this;
  }

  /**
   * Sets the value of this schema.
   * @param value The value.
   * @returns This schema.
   */
  public set(value: T): this {
    this.value = value;
    return this;
  }

  /**
   * If the value is a number, this substracts the specified value from the schema's value.
   * @param value The value.
   * @returns This schema.
   */
  public sub(value: T): this {
    if (isNumber(value) && isNumber(this.value)) {
      (this.value as number) -= value;
    }

    return this;
  }
}

export declare namespace ValueSchema {
  /**
   * Supported value types. If the type is a union with `null`, type it to `Mixed`.
   */
  type SupportedTypes = string | number | null;
}

export function CreateValueSchema<T extends Number | String>(ctor: Ctor<[], T>) {
  type ValueType = ReturnType<T['valueOf']>;

  class Schema extends ValueSchema<ValueType> {
    @prop({ type: ctor })
    public override value!: ValueType;
  }

  return Schema;
}

/**
 * Represents the manager for subschemas.
 * @param schemaCtor The schema to manage.
 * @returns A subschema manager.
 */
export abstract class ChildSchemaManager<T extends ChildSchema<string | number>, A extends any[] = []> {
  /**
   * The manager's entries. Since this property is abstract, use {@link prop prop()} to properly set the property's type.
   */
  public abstract entries: T[];

  /**
   * The schema's constructor.
   */
  public abstract get Constructor(): Ctor<A, T>;

  /**
   * Returns a map of ids to subschema pairs via the {@link Collection collection} utility by discord.js
   */
  public get collection() {
    return container.utilities['array'].toCollection(this.entries, (entry) => entry.id);
  }

  /**
   * Returns the ids of all subschemas.
   */
  public get keys() {
    return this.entries.map((entry) => entry.id);
  }

  /**
   * Creates a subschema and inserts it into the entries of this manager.
   * @param args The constructor parameters of the subschema.
   * @returns The constructed subschema.
   */
  public create(...args: A): T {
    return container.utilities['array'].insert(this.entries, Reflect.construct(this.Constructor, args));
  }

  /**
   * Finds a subschema from this manager.
   * @param id The id of the subschema.
   * @returns The resolved element.
   */
  public resolve(id: T['id']) {
    return this.entries.find((elem) => elem.id === id) ?? null;
  }

  /**
   * Finds a subschema and removes it from the manager's entries.
   * @param id The id of the subschema.
   * @returns The subschema.
   */
  public extract(id: T['id']) {
    return container.utilities['array'].extract(this.entries, (elem) => elem.id === id);
  }

  /**
   * The manager's iterator.
   * @returns An iterator.
   */
  public [Symbol.iterator]() {
    return this.entries.values();
  }
}

export function CreateChildSchemaManager<T extends ChildSchema<string | number>, A extends any[] = []>(Constructor: Ctor<A, T>) {
  abstract class Manager extends ChildSchemaManager<T, A> {
    @prop({ type: () => [Constructor] })
    public override entries: T[] = [];

    public override get Constructor(): Ctor<A, T> {
      return Constructor;
    }
  }

  return Manager;
}
