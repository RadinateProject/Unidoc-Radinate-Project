import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🕐 Automatic CRON: run comparison once a day
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoCompareJob() {
    this.logger.log('🕐 Starting scheduled comparison job...');

    const models = await this.prisma.comparisonResult.findMany({
      distinct: ['model_name', 'model_version'],
      select: { model_name: true, model_version: true },
    });

    if (!models.length) {
      this.logger.warn('No models found for scheduled job.');
      return;
    }

    for (const model of models) {
      if (!model.model_name || !model.model_version) continue;
      await this.runJob('comparison', model.model_name, model.model_version);
    }

    this.logger.log('✅ Scheduled comparison jobs completed.');
  }

  /**
   * Generic reusable job executor for multiple run types
   */
  async runJob(run_type: 'comparison' | 'drift' | 'fairness', model_name: string, model_version: string) {
    const manifest = await this.prisma.runManifest.create({
      data: {
        model_name,
        model_version,
        run_type,
        status: 'running',
      },
    });

    try {
      if (run_type === 'comparison') {
        await this.runComparison(model_name, model_version, manifest.id);
      } else if (run_type === 'drift') {
        await this.runDriftComputation(model_name, model_version, manifest.id);
      } else if (run_type === 'fairness') {
        await this.runFairnessComputation(model_name, model_version, manifest.id);
      }

      await this.prisma.runManifest.update({
        where: { id: manifest.id },
        data: {
          completed_at: new Date(),
          status: 'success',
        },
      });

      await this.prisma.auditLog.create({
        data: {
          action: `${run_type}_job`,
          user: 'system',
          entity: 'RunManifest',
          entity_id: manifest.id,
          timestamp: new Date(),
        },
      });

      this.logger.log(`✅ ${run_type} job finished for ${model_name} (${model_version})`);
    } catch (err) {
      this.logger.error(`❌ ${run_type} job failed for ${model_name}`, err);

      await this.prisma.runManifest.update({
        where: { id: manifest.id },
        data: {
          completed_at: new Date(),
          status: 'failed',
          summary: {
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          },
        },
      });
    }
  }

  /**
   * 🔹 Comparison Logic
   */
  private async runComparison(model_name: string, model_version: string, manifestId: number) {
    const studies = await this.prisma.study.findMany({
      include: { aiOutputs: true, groundTruths: true },
    });

    const summaries = [];
    for (const study of studies) {
      const aiFindings = new Set(study.aiOutputs.map((a) => a.finding_index));
      const gtFindings = new Set(study.groundTruths.map((g) => g.finding_index));

      const tp = [...aiFindings].filter((f) => gtFindings.has(f)).length;
      const fp = [...aiFindings].filter((f) => !gtFindings.has(f)).length;
      const fn = [...gtFindings].filter((f) => !aiFindings.has(f)).length;

      const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
      const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
      const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

      await this.prisma.comparisonResult.create({
        data: {
          study_id: study.id,
          study_uid: study.study_uid,
          model_name,
          model_version,
          precision: parseFloat(precision.toFixed(3)),
          recall: parseFloat(recall.toFixed(3)),
          f1_score: parseFloat(f1.toFixed(3)),
        },
      });

      summaries.push({ study_uid: study.study_uid, precision, recall, f1 });
    }

    await this.prisma.runManifest.update({
      where: { id: manifestId },
      data: {
        summary: {
          total_studies: summaries.length,
          avg_precision: summaries.reduce((s, i) => s + i.precision, 0) / summaries.length,
          avg_recall: summaries.reduce((s, i) => s + i.recall, 0) / summaries.length,
          avg_f1: summaries.reduce((s, i) => s + i.f1, 0) / summaries.length,
        },
      },
    });
  }

  /**
   * 🔹 Drift Logic (for future Python integration)
   */
  private async runDriftComputation(model_name: string, model_version: string, manifestId: number) {
    const driftSignals = await this.prisma.driftSignal.findMany({
      where: { model_name },
    });

    const drifted = driftSignals.filter((d) => d.status === 'drifted').length;
    const stable = driftSignals.length - drifted;

    await this.prisma.runManifest.update({
      where: { id: manifestId },
      data: {
        summary: {
          total_features: driftSignals.length,
          drifted,
          stable,
        },
      },
    });
  }

  /**
   * 🔹 Fairness Logic (for future Python integration)
   */
  private async runFairnessComputation(model_name: string, model_version: string, manifestId: number) {
    const fairness = await this.prisma.fairnessMetric.findMany({
      where: { model_name },
    });

    const avgDelta =
      fairness.reduce((sum, f) => sum + Math.abs(f.delta), 0) / fairness.length;

    await this.prisma.runManifest.update({
      where: { id: manifestId },
      data: {
        summary: {
          total_groups: fairness.length,
          avg_bias_delta: avgDelta,
        },
      },
    });
  }
}
