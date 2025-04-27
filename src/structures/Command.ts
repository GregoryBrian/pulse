import { Args, Command } from '@sapphire/framework';
import { AsyncQueue } from '@sapphire/async-queue';
import type { ChatInputCommandInteraction } from 'discord.js';
import { PlayerManager } from '../database/managers/Player.js';
import { CreateFunctionType } from '../types/index.js';

export enum QueuedCommandType {
  GLOBAL = 'global',
  USER = 'user',
  CATEGORY = 'category',
  NONE = 'none' // No queue needed
}

export interface QueuedCommandOptions extends Command.Options {
  /**
   * The queue type for this command.
   */
  queueType: QueuedCommandType;
  /**
   * Whether this command is priority, or shall skip the queue.
   * * Use `0` to skip the whole queue.
   * * Use `1` gets queued.
   */
  queuePriorityLevel: number;
}

export interface QueuedCommandRunContext {
  interaction: ChatInputCommandInteraction;
  responder: any;
  db: CreateFunctionType<[], ReturnType<PlayerManager['fetch']>>;
}

export abstract class QueuedCommand extends Command<Args, QueuedCommandOptions> {
  private static globalQueue = new AsyncQueue();
  private static userQueues = new Map<string, AsyncQueue>();
  private static categoryQueues = new Map<string, AsyncQueue>();

  protected queueType: QueuedCommandType = QueuedCommandType.NONE;
  protected categoryName?: string;
  protected priorityLevel: number = 1; // Higher number executes first; 0 skips queue
  protected static QUEUE_LIMIT = 2; // Max 2 commands waiting

  constructor(context: Command.LoaderContext, options: QueuedCommandOptions) {
    super(context, options);
  }

  private getQueue(interaction: ChatInputCommandInteraction): AsyncQueue | null {
    switch (this.queueType) {
      case QueuedCommandType.GLOBAL:
        return QueuedCommand.globalQueue;
      case QueuedCommandType.USER:
        if (!QueuedCommand.userQueues.has(interaction.user.id)) {
          QueuedCommand.userQueues.set(interaction.user.id, new AsyncQueue());
        }
        return QueuedCommand.userQueues.get(interaction.user.id)!;
      case QueuedCommandType.CATEGORY:
        if (!this.categoryName) return null;
        if (!QueuedCommand.categoryQueues.has(this.categoryName)) {
          QueuedCommand.categoryQueues.set(this.categoryName, new AsyncQueue());
        }
        return QueuedCommand.categoryQueues.get(this.categoryName)!;
      case QueuedCommandType.NONE:
      default:
        return null;
    }
  }

  public buildRunContext(interaction: ChatInputCommandInteraction): QueuedCommandRunContext {
    return {
      interaction,
      responder: null,
      db: () => this.container.db.managers.Player.fetch(interaction.user.id)
    };
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const queue = this.getQueue(interaction);

    if (!queue || this.priorityLevel === 0) {
      // No queue needed OR high-priority commands bypass queue
      return this.run(this.buildRunContext(interaction));
    }

    if (queue.remaining > QueuedCommand.QUEUE_LIMIT) {
      // Too many commands waiting; reject execution
      return interaction.reply({
        content: '🚫 Too many commands in queue! Try again later.',
        ephemeral: true
      });
    }

    await queue.wait(); // Wait in queue

    try {
      await this.run(this.buildRunContext(interaction));
    } finally {
      queue.shift(); // Release queue spot
    }
  }

  protected abstract run(interaction: QueuedCommandRunContext): Promise<void>;
}

export declare namespace QueuedCommand {
  type Options = QueuedCommandOptions;
  type RunContext = QueuedCommandRunContext;
}
