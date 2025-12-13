import { Module } from '@nestjs/common';
import { GroundController } from './ground.controller';
import { PrismaService } from '../prisma.service';
import { EncryptionService } from '../encryption.service';

@Module({
  controllers: [GroundController],
  providers: [PrismaService,EncryptionService],
})
export class GroundModule {}
