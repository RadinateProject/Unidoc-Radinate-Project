// top of src/main.ts (first lines)
import 'reflect-metadata';
import { webcrypto as nodeWebCrypto } from 'crypto';

if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = nodeWebCrypto;
}

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // --- Debug logging so we can see the exact Origin header ---
  // (optional, remove after debugging)
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.method === 'OPTIONS') {
      console.log('[CORS PRE-FLIGHT] URL:', req.url, 'Origin:', req.headers.origin);
    }
    next();
  });

  // --- Production-safe allowlist: add every exact origin your frontend uses ---
  const allowedOrigins = [
    'http://radinate-frontend-bucket.s3-website-us-east-1.amazonaws.com', // S3 website (http)
    // 'https://your-cloudfront-domain.cloudfront.net',                       // CloudFront (https) if you use it
    'https://localhost:3000',      
    'http://localhost:3000',                                     // your production domain
    // add any other exact origins you serve from (include scheme + host + optional port)
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, some mobile clients)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        // echo back the incoming origin -> this causes Access-Control-Allow-Origin header to be set
        return callback(null, true);
      } else {
        console.warn('[CORS] Rejected Origin:', origin);
        return callback(new Error('Origin not allowed by CORS'));
      }
    },
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(process.env.PORT || 3001, '0.0.0.0');
  console.log('API listening on http://localhost:3001');
}
bootstrap();
