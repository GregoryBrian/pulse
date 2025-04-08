import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { Client } from 'discord.js';

/**
 * Represents the listener for {@link Events.ClientReady}.
 */
@ApplyOptions<Listener.Options>({
	name: Events.ClientReady,
	once: true
})
export class ClientReady extends Listener<typeof Events.ClientReady> {
	public override run(client: Client<true>) {
		client.logger.info(`Client ${client.user.id} now ready as ${client.user.tag}.`);
		client.logger.info(`Loaded ${client.stores.reduce((p, c) => p + c.size, 0).toLocaleString()} pieces.`);
	}
}

/**
 * Represents the listener for {@link Events.Debug}.
 */
@ApplyOptions<Listener.Options>({
	name: Events.Debug
})
export class ClientDebug extends Listener<typeof Events.Debug> {
	public override run = this.container.client.logger.info.bind(this.container.client.logger);
}
