import type { If } from 'discord.js';
import mongoose, { type ConnectOptions } from 'mongoose';
import { DatabaseManagers } from './Managers.js';
import { container } from '@sapphire/framework';

/**
 * Represents a database connector.
 * @template IsConnected The type of the connection state.
 */
export class DatabaseConnector<IsConnected extends boolean = boolean> {
  /**
   * The database managers.
   */
  public readonly managers = new DatabaseManagers();

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
}

declare module '@sapphire/framework' {
  interface Container {
    /**
     * The database connector.
     */
    db: DatabaseConnector;
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
