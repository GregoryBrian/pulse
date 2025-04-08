import { Collection } from 'discord.js';
import type { ParentSchema } from './schema.js';
import type { Ctor } from '@sapphire/utilities';
import { getModelForClass, type ReturnModelType, type DocumentType } from '@typegoose/typegoose';

export class Manager<T extends ParentSchema> extends Collection<T['_id'], DocumentType<T>> {
	private model: ReturnModelType<new () => T>;
	private cacheTimeout: number;

	public constructor(Constructor: Ctor<[], T>) {
		super();
		this.model = getModelForClass(Constructor);
		this.cacheTimeout = Manager.DefaultCacheTimeout;
	}

	public add(doc: DocumentType<T>) {
		if (this.has(doc._id)) return doc;

		this.set(doc._id, doc);
		setTimeout(() => this.delete(doc._id), this.cacheTimeout);

		return doc;
	}

	public async fetch(_id: T['_id']) {
		const data = (await this.model.findById({ _id }).exec()) ?? (await this.model.create({ _id }));

		return data;
	}

	/** The manager's default timeout to remove a document from this cache. */
	protected static DefaultCacheTimeout = 60_000;
}
