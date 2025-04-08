import { config } from 'dotenv-cra';
import { RootPath } from './paths.js';
import { join } from 'node:path';

process.env.NODE_ENV ??= 'development';

config({ env: join(RootPath, '..', '.env') });
