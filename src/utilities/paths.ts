import { getRootData } from '@sapphire/pieces';
import { join } from 'node:path';

/**
 * Represents the root path.
 * Equivalent to `process.cwd()`.
 */
export const RootPath = getRootData().root;

/**
 * Represents the source path.
 */
export const SourcePath = join(RootPath);

/**
 * Represents the pieces path.
 */
export const PiecesPath = join(RootPath, 'pieces');
