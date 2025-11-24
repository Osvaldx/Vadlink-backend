/* eslint-disable @typescript-eslint/no-unsafe-call */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'debug', 'log', 'verbose'] });

  app.use((req: Request, res: Response, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://vadlink-frontend.vercel.app");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
  
    next();
  });

  // habilitamos los cors
  app.enableCors({
    origin: ['https://vadlink-frontend.vercel.app', 'http://localhost:4200'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // configuramos de cookies
  app.use(cookieParser());

  // Configuración para evitar recibir cosas que no queremos por body.
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true, // convierte los tipos automaticamente
      transformOptions: {
        enableImplicitConversion: true // permite pasar de "0" a 0 automaticamente
      }
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
