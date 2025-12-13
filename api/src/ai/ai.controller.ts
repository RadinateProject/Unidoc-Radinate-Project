import {
  Controller,
  Post,
  Body,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { z } from 'zod';
import crypto from 'crypto';
import { PrismaService } from '../prisma.service';
import { EncryptionService } from '../encryption.service';

/**
 * Incoming AI output payload
 */
const AiOutputSchema = z.object({
  study_uid: z.string(),
  model_name: z.string(),      // → finding
  score: z.number(),
  summary: z.string().optional(),
  timestamp_ai: z.string().datetime(),
});

type AiOutputInput = z.infer<typeof AiOutputSchema>;

@Controller('ingest')
export class AiController {
  private readonly logger = new Logger(AiController.name);
  private readonly indexKey?: Buffer;

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {
    // Deterministic HMAC key for indexing / uniqueness
    const b64 = process.env.FINDING_INDEX_KEY_BASE64;
    if (b64) {
      this.indexKey = Buffer.from(b64, 'base64');
    } else {
      this.logger.warn(
        'FINDING_INDEX_KEY_BASE64 not set — finding_index will be NULL',
      );
    }
  }

  /**
   * POST /ingest/ai-outputs
   */
  @Post('ai-outputs')
  async ingestAI(@Body() body: unknown) {
    // 1️⃣ Validate input
    let payload: AiOutputInput;
    try {
      payload = AiOutputSchema.parse(body);
    } catch (err) {
      this.logger.warn('Invalid AI ingest payload', err);
      throw new InternalServerErrorException('Invalid payload');
    }

    // 2️⃣ Ensure study exists
    const study = await this.prisma.study.findUnique({
      where: { study_uid: payload.study_uid },
    });

    if (!study) {
      throw new NotFoundException(
        `Study with UID ${payload.study_uid} not found`,
      );
    }

    try {
      // 3️⃣ Compute HMAC index for finding (deterministic)
      if (!this.indexKey) {
      throw new Error(
        'FINDING_INDEX_KEY_BASE64 is required but not configured',
      );
    }

      const findingIndex = crypto
  .createHmac('sha256', this.indexKey!)
  .update(payload.model_name)
  .digest('hex');


      // 4️⃣ Encrypt sensitive fields
      const findingEnc = await this.encryptionService.encode(
        payload.model_name,
      );

      const summaryEnc = payload.summary
        ? await this.encryptionService.encode(payload.summary)
        : null;

      // 5️⃣ Insert AIOutput (plaintext + encrypted during migration)
      const aiOutput = await this.prisma.aIOutput.create({
        data: {
          study_id: study.id,

          // PLAINTEXT (temporary – will be removed later)
          // finding: payload.model_name,
          // summary: payload.summary ?? null,

          // ENCRYPTED
          finding_ciphertext: findingEnc.ciphertext,
          finding_encrypted_dek: findingEnc.encryptedDEK,
          // finding_kms_key_id: findingEnc.kmsKeyId ?? null,
          finding_index: findingIndex,

          // summary_ciphertext: summaryEnc?.ciphertext ?? null,
          summary_encrypted_dek: summaryEnc?.encryptedDEK ?? null,

          confidence: payload.score,
          created_at: new Date(payload.timestamp_ai),
        },
      });

      // 6️⃣ Audit log (no sensitive payload)
      await this.prisma.auditLog.create({
        data: {
          user: 'system',
          action: 'ingest_ai_output',
          entity: 'AIOutput',
          entity_id: aiOutput.id,
        },
      });

      return {
        success: true,
        id: aiOutput.id,
      };
    } catch (err) {
      this.logger.error('Failed to ingest AI output', err);
      throw new InternalServerErrorException(
        'Failed to ingest AI output',
      );
    }
  }
}
