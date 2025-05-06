import { Collection } from 'discord.js';
import type { ParentSchema } from './schema.js';
import type { Ctor } from '@sapphire/utilities';
import { getModelForClass, type ReturnModelType, type DocumentType } from '@typegoose/typegoose';

export class Manager<T extends ParentSchema> extends Collection<T['_id'], T> {
  public model: ReturnModelType<new () => T>;
  public debounced = new Collection<string, NodeJS.Timeout>();

  public constructor(public Constructor: Ctor<[], T>) {
    super();
    this.model = getModelForClass(Constructor);
  }

  public create(id: string) {
    return this.model.create({ _id: id });
  }

  public dehydrate(obj: DocumentType<T>) {
    return obj.toObject() as T;
  }

  public hydrate(obj: T) {
    return new this.model(obj) as DocumentType<T>;
  }

  public async fetch(id: string): Promise<T> {
    const doc = super.get(id);
    if (doc) return doc;

    const data = await this.model.findById({ _id: id }).exec();
    if (!data) return this.create(id).then(this.dehydrate);

    return this.dehydrate(data as DocumentType<T>);
  }

  public async update(id: string, documentFunction: (doc: T) => void): Promise<T> {
    const doc = await this.fetch(id);
    const entry = this.debounced.get(id);

    Reflect.apply(documentFunction, doc, [doc]);

    if (entry) {
      void this.set(id, doc);
      void entry.refresh();
      return doc;
    }

    this.set(id, doc);
    this.debounced.set(
      id,
      setTimeout(async () => {
        void this.debounced.delete(id);
        await this.model.updateOne({ _id: id }, { $set: doc }).exec();
      }, 3_000)
    );

    return doc;
  }
}
