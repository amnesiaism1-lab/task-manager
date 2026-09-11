import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

/**
 * Background process entry point. It deliberately creates an application
 * context rather than an HTTP server; RUN_WORKERS enables outbox polling.
 */
async function bootstrap() {
  process.env.RUN_WORKERS = 'true';
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();
  console.log('Task Manager worker is running');
}

void bootstrap();
