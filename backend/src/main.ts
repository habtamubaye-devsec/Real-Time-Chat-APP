import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import express from 'express';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'appollo-request-preflight',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.use(cookieParser());

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce((accumulator, error) => {
          accumulator[error.property] = Object.values(
            error.constraints ?? {},
          ).join(', ');
          return accumulator;
        }, {});

        return new BadRequestException({ errors: formattedErrors });
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
