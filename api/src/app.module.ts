import { Module } from '@nestjs/common';
import { AiModule } from './ai/ai.module';
import { GroundModule } from './ground/ground.module';
import { StudyModule } from './study/study.module';
import { PrismaService } from './prisma.service';
import { EncryptionService } from './encryption.service';
import { JobsModule } from './jobs/jobs.module';
import { DriftModule } from './drift/drift.module';
import { FairnessModule } from './fairness/fairness.module';
import { AlertsModule } from './alerts/alerts.module';
import { ExportsModule } from './exports/exports.module';
import { ModelsModule } from './models/models.module';
import { MetricsModule } from './metrics/metrics.module';
import { RBACModule } from './rbac/rbac.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
// import { APP_GUARD } from '@nestjs/core';
// import { JwtAuthGuard } from './auth/jwt-auth.guard';
// import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    ScheduleModule.forRoot(),
     AiModule, 
     GroundModule, 
     StudyModule, 
     JobsModule, 
     DriftModule,
    FairnessModule,
    RBACModule,
    ExportsModule,
    ModelsModule,
    MetricsModule,
    AlertsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [PrismaService,
    EncryptionService,
    //If you want all controllers to require JWT by default,
    //     {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule {}
