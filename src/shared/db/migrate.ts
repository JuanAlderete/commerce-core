import 'dotenv/config';
import * as path from 'path';
import { promises as fs } from 'fs';
import { pathToFileURL } from 'url';
import { Migrator, Migration, MigrationProvider } from 'kysely';
import { db } from './index.js';
import { logger } from '../logger/index.js';

// --- CLASE CUSTOM PARA SOLUCIONAR WINDOWS + ESM ---
class ESMFileMigrationProvider implements MigrationProvider {
    constructor(private migrationFolder: string) { }

    async getMigrations(): Promise<Record<string, Migration>> {
        const migrations: Record<string, Migration> = {};

        // 1. Leemos los archivos usando fs normal (funciona bien con rutas de Windows)
        const files = await fs.readdir(this.migrationFolder);

        for (const file of files) {
            // Filtramos solo archivos .ts o .js y evitamos los .d.ts de definición
            if ((!file.endsWith('.ts') && !file.endsWith('.js')) || file.endsWith('.d.ts')) {
                continue;
            }

            const fullPath = path.join(this.migrationFolder, file);
            const migrationName = file.substring(0, file.lastIndexOf('.'));

            // pathToFileURL se encarga de formatearla correctamente para el OS actual.
            const url = pathToFileURL(fullPath).href;

            const migration = await import(url);

            // Asignamos la migración cargada al objeto
            migrations[migrationName] = migration;
        }

        return migrations;
    }
}

// --- SCRIPT DE EJECUCIÓN ---
async function migrateToLatest() {
    const migrator = new Migrator({
        db,
        // Usamos nuestro proveedor custom
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
        process.exit(1);
    }

    await db.destroy();
    logger.info('All migrations done!');
}

migrateToLatest();