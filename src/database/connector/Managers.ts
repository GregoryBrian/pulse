import { Manager } from '../manager.js';
import { EconomyManager } from '../managers/Economy.js';
import { PlayerManager } from '../managers/Player.js';

/**
 * The Managers object is a singleton that holds all the managers for the database.
 * It is used to access the managers from anywhere in the codebase.
 * @version 1.0.0
 * @author BrianWasTaken
 */
export const DatabaseManagers = {
  /**
   * The PlayerManager instance.
   */
  Player: new PlayerManager(),
  /**
   * The EconomyManager instance.
   */
  Economy: new EconomyManager(),
}

export type DatabaseManagers = keyof typeof DatabaseManagers;
export type DatabaseManager = typeof DatabaseManagers[DatabaseManagers];
export type ReturnSchemaType<T extends DatabaseManagers> = T extends Manager<infer U> ? U : never;