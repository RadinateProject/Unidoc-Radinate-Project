import {
  Controller,
  Post,
  Body,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { z } from 'zod';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma.service';
import { EncryptionService } from '../encryption.service';

/**
 * Incoming Ground Truth payload
 */
const GroundTruthSchema = z.object({
  study_uid: z.string(),
  gt_source: z.string().min(1), // finding
  gt_label: z.boolean(),
  gt_confidence: z.number().min(0).max(1),
  timestamp_gt: z.string().datetime(),
});

type GroundTruthInput = z.infer<typeof GroundTruthSchema>;

// 🔐 Deterministic index key (fail fast)
const FINDING_INDEX_KEY = (() => {
  if (!process.env.FINDING_INDEX_KEY_BASE64) {
    throw new Error('FINDING_INDEX_KEY_BASE64 is not configured');
  }
  return Buffer.from(process.env.FINDING_INDEX_KEY_BASE64, 'base64');
})();

@Controller('ingest')
export class GroundController {
  private readonly logger = new Logger(GroundController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * POST /ingest/ground-truth
   */
  @Post('ground-truth')
  async ingestGroundTruth(@Body() body: unknown) {
    // 1️⃣ Validate payload
    let payload: GroundTruthInput;
    try {
      payload = GroundTruthSchema.parse(body);
    } catch (err) {
      this.logger.warn('Invalid ground truth payload', err);
      throw new InternalServerErrorException('Invalid payload');
    }

    // 2️⃣ Find study
    const study = await this.prisma.study.findUnique({
      where: { study_uid: payload.study_uid },
    });

    if (!study) {
      throw new NotFoundException(
        `Study with UID ${payload.study_uid} not found`,
      );
    }

    try {
      const normalizedFinding = payload.gt_source;

      // 3️⃣ Deterministic HMAC index
      const findingIndex = createHmac('sha256', FINDING_INDEX_KEY)
        .update(normalizedFinding)
        .digest('hex');

      // 4️⃣ Duplicate check (via index)
      const existing = await this.prisma.groundTruth.findUnique({
        where: {
          study_id_finding: {
            study_id: study.id,
            finding_index: findingIndex,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Ground truth for study ${payload.study_uid} and source already exists`,
        );
      }

      // 5️⃣ Encrypt finding
      const findingEnc =
        await this.encryptionService.encode(normalizedFinding);

      // 6️⃣ Insert GroundTruth (encrypted only)
      const groundTruth = await this.prisma.groundTruth.create({
        data: {
          study_id: study.id,

          finding_ciphertext: findingEnc.ciphertext,
          finding_encrypted_dek: findingEnc.encryptedDEK,
          // finding_kms_key_id: findingEnc.kmsKeyId ?? null,
          finding_index: findingIndex,

          pneumothorax_flag: payload.gt_label ? 1 : 0,
          created_at: new Date(payload.timestamp_gt),
        },
      });

      // 7️⃣ Audit log
      await this.prisma.auditLog.create({
        data: {
          user: 'system',
          action: 'ingest_ground_truth',
          entity: 'GroundTruth',
          entity_id: groundTruth.id,
        },
      });

      return {
        success: true,
        id: groundTruth.id,
      };
    } catch (err) {
      if (err instanceof ConflictException) throw err;

      this.logger.error('Failed to ingest ground truth', err);
      throw new InternalServerErrorException(
        'Failed to ingest ground truth',
      );
    }
  }
}
