import 'reflect-metadata';
import helmet from 'helmet';
import express from 'express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http/all-exceptions.filter';
import { setupOpenApi } from './common/openapi/openapi.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production'
      ? ['log', 'error', 'warn']
      : ['log', 'error', 'warn', 'debug', 'verbose']
  });

  app.setGlobalPrefix('api/v1');

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
  });

  app.use(express.json({ limit: '1mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  setupOpenApi(app);

  const port = Number(process.env.PORT ?? 3001);
  Logger.log(`Starting on port ${port}`, 'Bootstrap');
  await app.listen(port);
}

void bootstrap();
