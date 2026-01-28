import 'dotenv/config';
import { buildApp } from './app.js';
import { logger } from './shared/logger/index.js';
import { db } from './shared/db/index.js';
import { sql } from 'kysely';

async function start() {
  let app;

  try {
    logger.info('Starting Commerce Core...');

    // 1. Healthcheck de Base de Datos (Smoke Test)
    // Antes de levantar el puerto HTTP, verificamos que la DB responda.
    // Si la DB está caída, el pod de Kubernetes/Docker debe fallar el arranque.
    logger.info('Connecting to Database...');
    await sql`SELECT 1`.execute(db);
    logger.info('Database connected successfully!');

    // 2. Construir la Aplicación
    // Aquí se cargan los plugins, la config y las rutas.
    app = await buildApp();

    // 3. Iniciar el Servidor HTTP
    // '0.0.0.0' es CRÍTICO en Docker. Si usas 'localhost', nadie fuera del contenedor podrá entrar.
    const port = app.config.PORT;
    const host = '0.0.0.0';

    await app.listen({ port, host });

    // Usamos app.log aquí porque ya tiene el contexto de Fastify
    app.log.info(`Server listening on http://${host}:${port}`);

    // 4. Configurar Graceful Shutdown
    // Si Docker te dice "apágate" (SIGTERM), cerramos todo limpio.
    setupGracefulShutdown(app);

  } catch (err) {
    logger.error(err, 'Fatal Error starting server');
    process.exit(1);
  }
}

function setupGracefulShutdown(app: Awaited<ReturnType<typeof buildApp>>) {
  const signals = ['SIGINT', 'SIGTERM'];

  for (const signal of signals) {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      try {
        // A. Dejar de recibir nuevas peticiones HTTP
        if (app) await app.close();
        logger.info('HTTP Server closed');

        // B. Cerrar conexiones a Base de Datos
        await db.destroy();
        logger.info('Database connections closed');

        logger.info('Goodbye!');
        process.exit(0);
      } catch (err) {
        logger.error(err, 'Error during shutdown');
        process.exit(1);
      }
    });
  }
}

start();