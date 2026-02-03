import 'dotenv/config';
import * as path from 'path';
import { promises as fs } from 'fs';
import { pathToFileURL, fileURLToPath } from 'url';
import { Migrator, Migration, MigrationProvider } from 'kysely';
import { db } from './index.js';
import { logger } from '../logger/index.js';

class ESMFileMigrationProvider implements MigrationProvider {
    constructor(private migrationFolder: string) { }

    async getMigrations(): Promise<Record<string, Migration>> {
        const migrations: Record<string, Migration> = {};
        const files = await fs.readdir(this.migrationFolder);

        for (const file of files) {
            if ((!file.endsWith('.ts') && !file.endsWith('.js')) || file.endsWith('.d.ts')) {
                continue;
            }
            const fullPath = path.join(this.migrationFolder, file);
            const migrationName = file.substring(0, file.lastIndexOf('.'));
            const url = pathToFileURL(fullPath).href;
            const migration = await import(url);
            migrations[migrationName] = migration;
        }
        return migrations;
    }
}

// --- FUNCIÓN EXPORTABLE (Para Tests) ---
export async function migrateToLatest() {
    const migrator = new Migrator({
        db,
        provider: new ESMFileMigrationProvider(
            path.join(process.cwd(), 'src/shared/db/migrations')
        ),
    });

    logger.info('Running migrations...');

    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((it) => {
        if (it.status === 'Success') {
            logger.info(`Migration "${it.migrationName}" was executed successfully`);
        } else if (it.status === 'Error') {
            logger.error(`Failed to execute migration "${it.migrationName}"`);
        }
    });

    if (error) {
        logger.error('Failed to run migrations');
        logger.error(error);
        // En tests lanzamos error, en CLI salimos
        if (process.env.NODE_ENV === 'test') {
            throw error;
        } else {
            process.exit(1);
        }
    }

    logger.info('All migrations done!');
}

// --- EJECUCIÓN COMO SCRIPT (CLI) ---
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    migrateToLatest()
        .then(async () => {
            await db.destroy();
        })
        .catch(async () => {
            await db.destroy();
        });
}