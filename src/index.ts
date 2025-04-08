import '@sapphire/plugin-utilities-store/register';
import './utilities/env-loader.js';

import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import { PiecesPath } from './utilities/paths.js';
import { DatabaseConnector } from './database/connector/Connector.js';
import connect from './connect.js';

const pulse = new SapphireClient({
  intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  baseUserDirectory: PiecesPath
});

// Load the database connector
await new DatabaseConnector(process.env.DB_URI).connect();

// Load the client
await connect(pulse);
