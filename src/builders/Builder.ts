import { container } from '@sapphire/framework';
import { type Ctor, isFunction, isNullish, isNullOrUndefined } from '@sapphire/utilities';
import type { Attachment, BitFieldResolvable, InteractionUpdateOptions, MessageEditAttachmentData, MessageFlagsString, PollData } from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  type InteractionEditReplyOptions,
  type InteractionReplyOptions,
  StringSelectMenuBuilder,
  type RestOrArray,
  StringSelectMenuOptionBuilder,
  type BaseMessageOptions,
  EmbedBuilder,
  type MessageMentionOptions,
  ComponentType,
  AttachmentBuilder,
  type MessageCreateOptions,
  type ReplyOptions,
  type StickerResolvable,
  type MessageEditOptions
} from 'discord.js';
import { Mixin } from 'ts-mixer';
import { CreateFunctionType } from '../types/index.js';

/**
 * The base class for all builders.
 */
export abstract class Builder {
  /**
   * Applies the callback function to this builder.
   * @param cb The callback function.
   * @returns This builder.
   */
  public apply(cb: Builder.Callback<this>) {
    return Builder.build(this, cb);
  }

  /**
   * Applies the async callback function to this builder.
   * @param cb The callback function.
   * @returns This builder.
   */
  public applyAsync(cb: Builder.Callback<this, Promise<this>>) {
    return Builder.build(this, cb);
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
      const build = (builder: T | Builder.Callback<T>) => (isFunction(builder) ? Builder.build(new ctor(...args), builder) : builder);

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

export class ComponentRowBuilder<T extends ComponentRowBuilder.ComponentTypes> extends Mixin(Builder, ActionRowBuilder) {
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
export class ButtonComponentBuilder extends Mixin(Builder, ButtonBuilder) {}

/**
 * Represents the builder for string select menus.
 * @extends Builder The project's universal builder class.
 * @extends StringSelectMenuBuilder The discord.js builder to inherit methods from.
 */
export class StringSelectMenuComponentBuilder extends Mixin(Builder, StringSelectMenuBuilder) {
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
export class MessageEmbedBuilder extends Mixin(Builder, EmbedBuilder) {}

/**
 * Represents the builder for message attachments.
 * @extends Builder The project's universal builder class.
 * @extends EmbedBulder The discord.js builder to inherit methods from.
 */
export class MessageAttachmentBuilder extends Mixin(Builder, AttachmentBuilder) {}

abstract class BaseMessageBuilder<TComponents extends ComponentRowBuilder.ComponentTypes = ComponentRowBuilder.ComponentTypes>
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

export class MessageBuilder<TComponents extends ComponentRowBuilder.ComponentTypes = ComponentRowBuilder.ComponentTypes>
  extends BaseMessageBuilder<TComponents>
  implements MessageCreateOptions
{
  public override content?: MessageCreateOptions['content'];
  public reply?: MessageCreateOptions['reply'];
  public tts?: MessageCreateOptions['tts'];
  public nonce?: MessageCreateOptions['nonce'];
  public stickers?: MessageCreateOptions['stickers'];
  public flags?: MessageCreateOptions['flags'];

  public override setContent(content: string | null): this {
    if (isNullish(content)) {
      delete this.content;
    } else {
      this.content = content;
    }

    return this;
  }

  public setReply(options: ReplyOptions | null) {
    if (isNullish(options)) {
      delete this.reply;
    } else {
      this.reply = options;
    }

    return this;
  }

  public setTTS(tts: boolean | null) {
    if (isNullish(tts)) {
      delete this.tts;
    } else {
      this.tts = tts;
    }

    return this;
  }

  public setNonce(nonce: string | number | null) {
    if (isNullish(nonce)) {
      delete this.nonce;
    } else {
      this.nonce = nonce;
    }

    return this;
  }

  public setStickers(stickers: StickerResolvable[]) {
    this.stickers ??= [] = stickers;
    return this;
  }

  public setFlags(flags: Exclude<MessageCreateOptions['flags'], undefined> | null) {
    if (isNullish(flags)) {
      delete this.flags;
    } else {
      this.flags = flags;
    }

    return this;
  }
}

export class EditMessageBuilder<TComponents extends ComponentRowBuilder.ComponentTypes = ComponentRowBuilder.ComponentTypes>
  extends BaseMessageBuilder<TComponents>
  implements MessageEditOptions
{
  public override content?: string | null;
  public flags?: MessageEditOptions['flags'];

  public override setContent(content: string | null): this {
    this.content = content;
    return this;
  }

  public setFlags(flags: Exclude<MessageEditOptions['flags'], undefined> | null) {
    if (isNullish(flags)) {
      delete this.flags;
    } else {
      this.flags = flags;
    }

    return this;
  }
}

abstract class BaseInteractionMessageBuilder<
  TComponents extends ComponentRowBuilder.ComponentTypes = ComponentRowBuilder.ComponentTypes,
  Flags extends MessageFlagsString = MessageFlagsString
> extends BaseMessageBuilder<TComponents> {
  public flags?: BitFieldResolvable<Flags, number>;

  public setFlags(flags: Exclude<BitFieldResolvable<Flags, number>, undefined> | null) {
    if (isNullish(flags)) {
      delete this.flags;
    } else {
      this.flags = flags;
    }

    return this;
  }
}

export abstract class InteractionMessageBuilder<
    TComponents extends ComponentRowBuilder.ComponentTypes = ComponentRowBuilder.ComponentTypes,
    Flags extends Extract<MessageFlagsString, 'Ephemeral' | 'SuppressEmbeds' | 'SuppressNotifications'> = Extract<
      MessageFlagsString,
      'Ephemeral' | 'SuppressEmbeds' | 'SuppressNotifications'
    >
  >
  extends BaseInteractionMessageBuilder<TComponents, Flags>
  implements Omit<InteractionReplyOptions, 'flags'>, Omit<InteractionEditReplyOptions, 'flags'>
{
  public withResponse?: boolean;
  public threadId?: string;
  public attachments?: readonly (Attachment | MessageEditAttachmentData)[];
  public poll?: PollData;
  public override content?: string;
  public tts?: InteractionReplyOptions['tts'];
  public message?: InteractionEditReplyOptions['message'];

  public setWithResponse(withResponse: boolean): this {
    this.withResponse = withResponse;
    return this;
  }

  public override setContent(content: string): this {
    this.content = content;
    return this;
  }

  public setMessage(message: string): this {
    this.message = message;
    return this;
  }
}

export class UpdateInteractionMessageBuilder<TComponents extends ComponentRowBuilder.ComponentTypes = ComponentRowBuilder.ComponentTypes>
  extends BaseInteractionMessageBuilder<TComponents, 'SuppressEmbeds'>
  implements InteractionUpdateOptions
{
  public override content?: string | null;
  public fetchReply?: boolean;

  public override setContent(content: string): this {
    this.content = content;
    return this;
  }

  public setFetchReply(fetchReply: boolean): this {
    this.fetchReply = fetchReply;
    return this;
  }
}

export class ReplyInteractionMessageBuilder {}
