// src/encryption/encryption.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { KmsEnvelope } from './encryption/envelopeAwskms'; // adjust path if needed
import type { EncryptedRecord } from './types'; // ensure types.ts exports EncryptedRecord

@Injectable()
export class EncryptionService implements OnModuleDestroy {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly env: KmsEnvelope;
  private readonly kmsKeyId: string;

  constructor() {
    // Prefer injecting via config service in production; simple env fallback for now
    this.kmsKeyId = process.env.AWS_KMS_KEY_ID ?? '';
    if (!this.kmsKeyId) {
      this.logger.error('AWS_KMS_KEY_ID is not set. EncryptionService will not work until set.');
    }
    this.env = new KmsEnvelope(process.env.AWS_REGION);
  }

  /**
   * Encrypt a single plaintext string and return an EncryptedRecord-like object
   */
  async encode(plaintext: string): Promise<Pick<EncryptedRecord, 'ciphertext' | 'encryptedDEK' | 'kmsKeyId' | 'algorithm' | 'createdAt'>> {
    if (!this.kmsKeyId) throw new Error('KMS key id not configured');
    const rec = await this.env.encryptField(this.kmsKeyId, plaintext);
    // Return only the fields we need to store
    return {
      ciphertext: rec.ciphertext,
      encryptedDEK: rec.encryptedDEK,
      kmsKeyId: rec.kmsKeyId,
      algorithm: rec.algorithm,
      createdAt: rec.createdAt
    };
  }

  /**
   * Decrypt from stored ciphertext + encryptedDEK
   */
  async decode(ciphertext: string, encryptedDEK: string): Promise<string> {
    return this.env.decryptField({ ciphertext, encryptedDEK });
  }

  // Optional cleanup
  onModuleDestroy() {
    // If KmsEnvelope needs cleanup in the future, do it here.
  }
}
