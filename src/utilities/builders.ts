import { AnyReadonlyArray, Ctor, isFunction, isNullish, isNullOrUndefined } from '@sapphire/utilities';
import {
  ActionRowBuilder,
  AttachmentBuilder,
  BaseMessageOptions,
  ButtonBuilder,
  ComponentType,
  EmbedBuilder,
  MessageMentionOptions,
  RestOrArray,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { CreateFunctionType } from '../types/index.js';
import { Mixin } from 'ts-mixer';
import { container } from '@sapphire/pieces';

/**
 * The base class for all builders.
 */
export abstract class Builder {
  /**
   * The builder's type.
   */
  declare public ['constructor']: typeof this;

  /**
   * Applies the callback function to this builder.
   * @param fn The callback function.
   * @returns This builder.
   */
  public apply(fn: Builder.Callback<this>) {
    return Builder.build(this, fn);
  }

  /**
   * Applies the async callback function to this builder.
   * @param fn The callback function.
   * @returns This builder.
   */
  public applyAsync(fn: Builder.Callback<this, Promise<this>>) {
    return Builder.build(this, fn);
  }

  /**
   * Creates a new builder class that extends the supplied class.
   * @param ctor The builder class.
   * @returns A new builder class that extends the supplied class.
   * @template T The builder's type.
   * @template A The builder's arguments type.
   */
  public static create<T, A extends AnyReadonlyArray = readonly any[]>(ctor: Ctor<A, T>) {
    return Mixin(Builder, ctor);
  }

  /**
   * Builds the builder via the supplied callback function.
   * @param instance An instance of a {@link Builder}.
   * @param builder The builder.
   */
  public static build<T>(instance: T, builder: Builder.Callback<T>): T;
  public static build<T>(instance: T, builder: Builder.Callback<T, Promise<T>>): Promise<T>;
  public static build<T>(instance: T, builder: Builder.Callback<T, Promise<T>>) {
    return Reflect.apply(builder, instance, [instance]);
  }

  /**
   * Flats out an array of builders or builder functions into an array of builders only.
   * @param ctor The builder class.
   * @param builders The builders.
   * @returns An array of builders.
   */
  public static flat<T, A extends unknown[] = []>(ctor: Ctor<A, T>, args: A, ...builders: RestOrArray<T> | RestOrArray<Builder.Callback<T>>) {
    return builders.flatMap((builder) => {
      const build = (builder: T | Builder.Callback<T>) => (isFunction(builder) ? Builder.build(Reflect.construct(ctor, args), builder) : builder);

      return Array.isArray(builder) ? builder.map(build) : build(builder);
    });
  }
}

export declare namespace Builder {
  /**
   * Represents a builder callback.
   * @template T The builder's type.
   */
  type Callback<T, R = T> = CreateFunctionType<[this: T, builder: T], R>;
}

export class ComponentRowBuilder<T extends ComponentRowBuilder.ComponentTypes> extends Builder.create(ActionRowBuilder) {
  declare public components: ComponentRowBuilder.ComponentMappings[T][];
  public type = ComponentType.ActionRow;

  /**
   * The component builder's constructor.
   * @param Constructor The component class.
   */
  public constructor(public componentsType: T) {
    super();
  }

  /**
   * Adds components into this component row builder.
   * @param components The components.
   */
  public override addComponents(...components: RestOrArray<Builder.Callback<ComponentRowBuilder.ComponentMappings[T]>>): this;
  public override addComponents(...components: RestOrArray<ComponentRowBuilder.ComponentMappings[T]>): this;
  public override addComponents(
    ...components: RestOrArray<ComponentRowBuilder.ComponentMappings[T]> | RestOrArray<Builder.Callback<ComponentRowBuilder.ComponentMappings[T]>>
  ): this {
    return super.addComponents(Builder.flat(this.Constructor as unknown as Ctor<[], ComponentRowBuilder.ComponentMappings[T]>, [], ...components));
  }

  /**
   * Sets the components of this component row builder.
   * @param components The components.
   */
  public override setComponents(...components: RestOrArray<Builder.Callback<ComponentRowBuilder.ComponentMappings[T]>>): this;
  public override setComponents(...components: RestOrArray<ComponentRowBuilder.ComponentMappings[T]>): this;
  public override setComponents(
    ...components: RestOrArray<ComponentRowBuilder.ComponentMappings[T]> | RestOrArray<Builder.Callback<ComponentRowBuilder.ComponentMappings[T]>>
  ): this {
    return super.setComponents(Builder.flat(this.Constructor as unknown as Ctor<[], ComponentRowBuilder.ComponentMappings[T]>, [], ...components));
  }

  public get Constructor() {
    const Constructors: Record<ComponentRowBuilder.ComponentTypes, Ctor<[], ComponentRowBuilder.Components>> = {
      [ComponentType.Button]: ButtonComponentBuilder,
      [ComponentType.StringSelect]: StringSelectMenuComponentBuilder
    };

    return Reflect.get(Constructors, this.componentsType);
  }
}

export declare namespace ComponentRowBuilder {
  /**
   * Represents the components allowed in a {@link ComponentRowBuilder}.
   */
  type Components = ComponentMappings[ComponentTypes];

  /**
   * Represents the component types allowed in a {@link ComponentRowBuilder}.
   */
  type ComponentTypes = keyof ComponentMappings;

  interface ComponentMappings {
    [ComponentType.Button]: ButtonComponentBuilder;
    [ComponentType.StringSelect]: StringSelectMenuComponentBuilder;
  }
}

/**
 * Represents the builder for component buttons.
 * @extends Builder The project's universal builder class.
 * @extends ButtonBuilder The discord.js builder to inherit methods from.
 */
export class ButtonComponentBuilder extends Builder.create(ButtonBuilder) {}

/**
 * Represents the builder for string select menus.
 * @extends Builder The project's universal builder class.
 * @extends StringSelectMenuBuilder The discord.js builder to inherit methods from.
 */
export class StringSelectMenuComponentBuilder extends Builder.create(StringSelectMenuBuilder) {
  public override addOptions(...options: RestOrArray<Builder.Callback<StringSelectMenuOptionBuilder>>): this;
  public override addOptions(...options: RestOrArray<StringSelectMenuOptionBuilder>): this;
  public override addOptions(
    ...options: RestOrArray<StringSelectMenuOptionBuilder> | RestOrArray<Builder.Callback<StringSelectMenuOptionBuilder>>
  ): this {
    return super.addOptions(Builder.flat(StringSelectMenuOptionBuilder, [], ...options));
  }
}

/**
 * Represents the builder for message embeds.
 * @extends Builder The project's universal builder class.
 * @extends EmbedBuilder The discord.js builder to inherit methods from.
 */
export class MessageEmbedBuilder extends Builder.create(EmbedBuilder) {}

/**
 * Represents the builder for message attachments.
 * @extends Builder The project's universal builder class.
 * @extends EmbedBulder The discord.js builder to inherit methods from.
 */
export class MessageAttachmentBuilder extends Builder.create(AttachmentBuilder) {}

//#region BaseMessageBuilder
export abstract class BaseMessageBuilder<TComponents extends ComponentRowBuilder.ComponentTypes = ComponentRowBuilder.ComponentTypes>
  extends Builder
  implements Omit<BaseMessageOptions, 'content'>
{
  public allowedMentions?: BaseMessageOptions['allowedMentions'];
  public components: BaseMessageOptions['components'] & ComponentRowBuilder<TComponents>[] = [];
  public abstract content?: unknown;
  public embeds?: BaseMessageOptions['embeds'];
  public files?: BaseMessageOptions['files'];

  public setAllowedMentions(options: MessageMentionOptions | null): this {
    if (isNullish(options)) {
      delete this.allowedMentions;
    } else {
      this.allowedMentions = options;
    }

    return this;
  }

  public addComponentRow(type: TComponents, rowCb: Builder.Callback<ComponentRowBuilder<TComponents>>) {
    void container.utilities['iterable'].insertElement((this.components ??= []), Builder.build(new ComponentRowBuilder(type), rowCb));

    return this;
  }

  public replaceComponentRow(rowIndex: number, type: TComponents, rowCb: Builder.Callback<ComponentRowBuilder<TComponents>>) {
    (this.components ??= []).splice(rowIndex, 1, Builder.build(new ComponentRowBuilder(type), rowCb));

    return this;
  }

  public replaceComponentRowComponent(
    rowIndex: number,
    componentIndex: number,
    type: TComponents,
    compCb: Builder.Callback<ComponentRowBuilder.ComponentMappings[TComponents]>
  ) {
    const existingRow = (this.components ??= []).at(rowIndex) as ComponentRowBuilder<TComponents>;
    if (isNullOrUndefined(existingRow)) throw new ReferenceError('Row not found.');

    const component = existingRow.components.findIndex((_comp, idx) => idx === componentIndex);
    if (component === -1) throw new ReferenceError('Component not found.');

    return this.replaceComponentRow(rowIndex, type, (row) =>
      row.setComponents(
        ...existingRow.components.map((comp, idx) =>
          idx !== componentIndex ? comp : Builder.build(new row.Constructor() as ComponentRowBuilder.ComponentMappings[TComponents], compCb)
        )
      )
    );
  }

  public removeComponentRow(rowIndex: number) {
    void container.utilities['iterable'].extractElement((this.components ??= []), (_, index) => index === rowIndex);

    return this;
  }

  public abstract setContent(content: string): this;

  public addEmbed(embedCb: Builder.Callback<MessageEmbedBuilder>) {
    const { insertElement, fromReadonly } = container.utilities['iterable'];

    void insertElement(fromReadonly((this.embeds ??= [])), Builder.build(new MessageEmbedBuilder(), embedCb));

    return this;
  }

  public removeEmbed(embedIndex: number) {
    const { extractElement, fromReadonly } = container.utilities['iterable'];

    void extractElement(fromReadonly((this.embeds ??= [])), (_, index) => index === embedIndex);

    return this;
  }

  public addFile(fileCb: Builder.Callback<MessageAttachmentBuilder>) {
    const { insertElement, fromReadonly } = container.utilities['iterable'];

    void insertElement(fromReadonly((this.files ??= [])), Builder.build(new MessageAttachmentBuilder(), fileCb));

    return this;
  }

  public removeFile(fileIndex: number) {
    const { extractElement, fromReadonly } = container.utilities['iterable'];

    void extractElement(fromReadonly((this.files ??= [])), (_, index) => index === fileIndex);

    return this;
  }
}
