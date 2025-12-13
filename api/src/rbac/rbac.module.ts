import { Module } from '@nestjs/common';
import { RBACController } from './rbac.controller';
import { PrismaService } from '../prisma.service';
import { EncryptionService } from '../encryption.service';

@Module({
  controllers: [RBACController],
  providers: [PrismaService,EncryptionService],
})
export class RBACModule {}
