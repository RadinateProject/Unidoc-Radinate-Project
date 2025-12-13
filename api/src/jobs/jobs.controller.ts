import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------
  // Recent runs
  // -------------------------
  @Get('runs')
  @Roles('CMIO', 'Chief Risk Officer', 'Radiology Lead', 'Analyst', 'System')
  async getRuns() {
    const runs = await this.prisma.runManifest.findMany({
      orderBy: { started_at: 'desc' },
      take: 25,
    });

    return {
      count: runs.length,
      runs: runs.map((r) => ({
        id: r.id,
        job_id: r.job_id,
        run_type: r.run_type,
        model_name: r.model_name,
        model_version: r.model_version,
        status: r.status,
        started_at: r.started_at,
        completed_at: r.completed_at,
        summary: r.summary,
        error: (r.summary as any)?.error ?? null,
      })),
    };
  }

  // -------------------------
  // External job ingestion
  // -------------------------
  @Post('ingest-run')
  @Roles('Analyst', 'System')
  async ingestRun(
    @Body()
    body: {
      run_type: 'comparison' | 'drift' | 'fairness';
      model_name: string;
      model_version: string;
      status: 'running' | 'success' | 'failed';
      summary?: any;
    },
  ) {
    const { run_type, model_name, model_version, status, summary } = body;

    if (!run_type || !model_name || !model_version || !status) {
      return {
        success: false,
        message:
          'Missing required fields: run_type, model_name, model_version, status',
      };
    }

    const run = await this.prisma.runManifest.create({
      data: {
        run_type,
        model_name,
        model_version,
        status,
        summary: summary ?? {},
        completed_at: status !== 'running' ? new Date() : null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: `${run_type}_ingest`,
        user: 'python-script',
        entity: 'RunManifest',
        entity_id: run.id,
      },
    });

    return { success: true, run };
  }

  // -------------------------
  // Comparison job
  // -------------------------
  @Post('compare')
  @Roles('CMIO', 'Chief Risk Officer', 'Radiology Lead')
  async compareAIvsGroundTruth(
    @Body() body: { model_name: string; model_version: string },
  ) {
    const { model_name, model_version } = body;

    const studies = await this.prisma.study.findMany({
      include: {
        aiOutputs: {
          select: { finding_index: true },
        },
        groundTruths: {
          select: { finding_index: true },
        },
      },
    });

    if (!studies.length) {
      return { success: false, message: 'No studies found.' };
    }

    for (const study of studies) {
      const aiFindings = new Set(
        study.aiOutputs.map((a) => a.finding_index),
      );
      const gtFindings = new Set(
        study.groundTruths.map((g) => g.finding_index),
      );

      const truePositives = [...aiFindings].filter((f) =>
        gtFindings.has(f),
      ).length;
      const falsePositives = [...aiFindings].filter(
        (f) => !gtFindings.has(f),
      ).length;
      const falseNegatives = [...gtFindings].filter(
        (f) => !aiFindings.has(f),
      ).length;

      const precision =
        truePositives + falsePositives === 0
          ? 0
          : truePositives / (truePositives + falsePositives);

      const recall =
        truePositives + falseNegatives === 0
          ? 0
          : truePositives / (truePositives + falseNegatives);

      const f1 =
        precision + recall === 0
          ? 0
          : (2 * precision * recall) / (precision + recall);

      await this.prisma.comparisonResult.create({
        data: {
          study_id: study.id,
          study_uid: study.study_uid,
          model_name,
          model_version,
          precision: Number(precision.toFixed(3)),
          recall: Number(recall.toFixed(3)),
          f1_score: Number(f1.toFixed(3)),
        },
      });

      await this.prisma.auditLog.create({
        data: {
          action: 'compare_job',
          user: 'system',
          entity: 'ComparisonResult',
          entity_id: study.id,
        },
      });
    }

    return {
      success: true,
      message: 'Comparison job completed.',
    };
  }

  // -------------------------
  // History
  // -------------------------
  @Get('history')
  @Roles('CMIO', 'Chief Risk Officer', 'Radiology Lead', 'Analyst', 'System')
  async getAllJobs() {
    return this.prisma.comparisonResult.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  @Get('history/:jobId')
  @Roles('CMIO', 'Chief Risk Officer', 'Radiology Lead', 'Analyst', 'System')
  async getJobResults(@Param('jobId') jobId: string) {
    return this.prisma.comparisonResult.findMany({
      where: { job_id: jobId },
      orderBy: { study_uid: 'asc' },
    });
  }
}
