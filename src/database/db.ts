import type { If } from 'discord.js';
import mongoose, { type ConnectOptions } from 'mongoose';
import { container } from '@sapphire/framework';
import { UpdateSchemaFunction } from './schema.js';
import { PlayerSchema } from './schemas/Player.js';
import { EconomyManager } from './managers/Economy.js';
import { PlayerManager } from './managers/Player.js';

/**
 * Represents a database connector.
 * @template IsConnected The type of the connection state.
 */
export class Database<IsConnected extends boolean = boolean> {
  public readonly economy = new EconomyManager();
  public readonly players = new PlayerManager();

  /**
   * The default options for the connection.
   * @param connectionURI The connection URI.
   * @param options Options for the connection.
   */
  public constructor(
    public connectionURI: string,
    public options?: ConnectOptions
  ) {
    container.db = this;
  }

  /**
   * The connection to the database.
   */
  public get connection() {
    return mongoose.connections.at(0) ?? null;
  }

  /**
   * Connects to the database.
   * @returns nothing.
   */
  public async connect(): Promise<void> {
    return void (await mongoose.connect(
      this.connectionURI,
      this.options ?? {
        auth: {
          username: process.env.DB_AUTH_USERNAME,
          password: process.env.DB_AUTH_PASSWORD
        },
        dbName: process.env.DB_NAME
      }
    ));
  }

  /**
   * Disconnects the database connection.
   * @returns `true` if the connection is established, `false` otherwise.
   */
  public async disconnect(): Promise<void> {
    return this.connection?.close() ?? Promise.resolve();
  }

  /**
   * Checks if the connection is established.
   * @returns `true` if the connection is established, `false` otherwise.
   */
  public isConnected(): If<IsConnected, true, false>;
  public isConnected(): boolean {
    return this.connection?.readyState === mongoose.ConnectionStates.connected;
  }

  /**
   * Gets the player from the database.
   * @param playerId The id of the player.
   * @returns A player schema.
   */
  public getPlayer(playerId: string) {
    return this.players.fetch(playerId);
  }

  /**
   * Updates a player on the database.
   * @param playerId The id of the player.
   * @param fn The function to call to update the player.
   * @returns The updated player schema.
   */
  public updatePlayer(playerId: string, fn: UpdateSchemaFunction<PlayerSchema>) {
    return this.players.update(playerId, fn);
  }
}

declare module '@sapphire/framework' {
  interface Container {
    /**
     * The database connector.
     */
    db: Database;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_NAME: string;
      DB_AUTH_PASSWORD: string;
      DB_AUTH_USERNAME: string;
      DB_URI: string;
    }
  }
}
