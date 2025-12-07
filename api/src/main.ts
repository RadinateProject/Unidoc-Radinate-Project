// top of src/main.ts (first lines)
import { webcrypto as nodeWebCrypto } from 'crypto';

if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = nodeWebCrypto;
}

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // await app.listen(3001,'0.0.0.0');
  await app.getHttpServer().listen(3001, '0.0.0.0');
  console.log('API listening on http://localhost:3001');
}
bootstrap();
