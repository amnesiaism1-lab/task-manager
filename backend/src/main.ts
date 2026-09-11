import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from './app.module';

const server = express();
let isInitialized = false;

async function bootstrapServer() {
  if (!isInitialized) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    const configService = app.get(ConfigService);
    const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    // Security
    app.use(helmet());
    app.use(cookieParser());

    // CORS
    app.enableCors({
      origin: (origin: any, callback: any) => {
        if (!origin || origin.includes('vercel.app') || origin === frontendUrl || origin.includes('localhost')) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api');

    // Validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    // Swagger
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Task Manager API')
      .setDescription('Jira-like Task Manager — API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
    isInitialized = true;
  }
  return server;
}

// Handler for Vercel Serverless Function
export default async function handler(req: any, res: any) {
  try {
    const expressApp = await bootstrapServer();
    // Prevent Express bodyParser from hanging if Vercel already read/parsed req.body
    if (req.body && typeof req.body === 'object') {
      req._body = true;
    }
    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? req.url : `/${req.url}`}`;
    }
    return expressApp(req, res);
  } catch (err: any) {
    console.error('Unhandled Vercel serverless error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      statusCode: 500,
      message: 'Internal Server Error',
      error: err?.message || String(err),
    }));
  }
}

// Standalone execution (local dev / container only)
if (!process.env.VERCEL && !process.env.NOW_REGION) {
  bootstrapServer().then(() => {
    const port = process.env.PORT || process.env.APP_PORT || 3001;
    server.listen(port, () => {
      console.log(`🚀 Task Manager API running on port ${port}`);
      console.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
    });
  }).catch((err) => {
    console.error('Failed to start standalone server:', err);
  });
}
