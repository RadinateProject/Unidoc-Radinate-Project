import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { PrismaService } from '../prisma.service';
import { EncryptionService } from '../encryption.service';

@Module({
  controllers: [AiController],
  providers: [PrismaService,EncryptionService],
})
export class AiModule {}
