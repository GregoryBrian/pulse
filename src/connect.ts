import { SapphireClient } from '@sapphire/framework';
import { container } from '@sapphire/pieces';

/**
 * Connects the SapphireClient to Discord, retrying on failure.
 * @remarks This function will attempt to connect to Discord using the provided client.
 * If the connection fails, it will retry up to the specified number of times, waiting for the specified timeout between attempts.
 * @param client The SapphireClient instance to connect to Discord.
 * @param maxRetries Maximum number of retries to connect to Discord.
 * @param timeout The time to wait between retries in milliseconds.
 * @returns A promise that resolves when the client is connected to Discord.
 */
export default async function connect(client: SapphireClient, maxRetries = 5, timeout = 15_000): Promise<void> {
  let attempts = 0;

  while (true) {
    try {
      await client.login();
      break;
    } catch (err) {
      attempts++;
      void client.logger.info(err);
      await container.utilities['promise'].wait(timeout);
    }
  }

  if (attempts >= maxRetries) {
    void client.logger.info(`Unable to connect to Discord after ${attempts} attempts. Exiting`);
    void process.exit(1);
  }
}
