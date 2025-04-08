import { EconomyManager } from '../managers/Economy.js';
import { PlayerManager } from '../managers/Player.js';

/**
 * The Managers class is a singleton that holds all the managers for the database.
 * It is used to access the managers from anywhere in the codebase.
 * @version 1.0.0
 * @author BrianWasTaken
 */
export class DatabaseManagers {
	/**
	 * The PlayerManager instance.
	 */
	public readonly player = new PlayerManager();

	/**
	 * The EconomyManager instance.
	 */
	public readonly economy = new EconomyManager();
}
