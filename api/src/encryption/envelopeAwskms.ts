// envelopeAwsKms.ts
import { KMSClient, GenerateDataKeyCommand, DecryptCommand } from '@aws-sdk/client-kms';
import { encryptWithKey, decryptWithKey } from './cryptoField';

export interface EncryptedRecord {
  ciphertext: string;    // base64 packaged blob (iv||tag||ciphertext)
  encryptedDEK: string;  // base64 of KMS-wrapped data key
  kmsKeyId?: string;     // the KMS CMK id/arn used to wrap the DEK
  algorithm?: string;    // e.g., "AES-256-GCM"
  keyVersion?: string;   // optional
  createdAt?: string;
}

export class KmsEnvelope {
  private kms: KMSClient;

  constructor(region?: string) {
    this.kms = new KMSClient({ region });
  }

  /**
   * Generate a data key (plaintext + encrypted). Caller MUST zero plaintextKey immediately after use.
   * @param kmsKeyId CMK KeyId or ARN
   */
  async generateDataKey(kmsKeyId: string): Promise<{ plaintextKey: Buffer; encryptedKeyB64: string; keyId?: string }> {
    const cmd = new GenerateDataKeyCommand({ KeyId: kmsKeyId, KeySpec: 'AES_256' });
    const res = await this.kms.send(cmd);
    if (!res.Plaintext || !res.CiphertextBlob) {
      throw new Error('KMS did not return data key');
    }
    const plaintextKey = Buffer.from(res.Plaintext); // Buffer view of Uint8Array
    const encryptedKeyB64 = Buffer.from(res.CiphertextBlob).toString('base64');
    return { plaintextKey, encryptedKeyB64, keyId: res.KeyId };
  }

  /**
   * Decrypt an encrypted DEK (base64). Caller MUST zero returned plaintextKey after use.
   * @param encryptedKeyB64 base64 of KMS-wrapped DEK
   */
  async decryptDataKey(encryptedKeyB64: string): Promise<Buffer> {
    const ciphertextBlob = Buffer.from(encryptedKeyB64, 'base64');
    const cmd = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
    const res = await this.kms.send(cmd);
    if (!res.Plaintext) {
      throw new Error('KMS decrypt did not return plaintext key');
    }
    return Buffer.from(res.Plaintext);
  }

  /**
   * Encrypt a plaintext value and return an EncryptedRecord suitable for DB storage.
   * This uses generateDataKey under the hood and wipes the plaintext key in the finally block.
   */
  async encryptField(kmsKeyId: string, plaintext: string): Promise<EncryptedRecord> {
    const { plaintextKey, encryptedKeyB64, keyId } = await this.generateDataKey(kmsKeyId);
    try {
      const { blob } = encryptWithKey(plaintext, plaintextKey);
      const rec: EncryptedRecord = {
        ciphertext: blob,
        encryptedDEK: encryptedKeyB64,
        kmsKeyId: keyId ?? kmsKeyId,
        algorithm: 'AES-256-GCM',
        createdAt: new Date().toISOString()
      };
      return rec;
    } finally {
      // wipe plaintext key from memory
      plaintextKey.fill(0);
    }
  }

  /**
   * Decrypt an EncryptedRecord and return plaintext string.
   * Wipes plaintext key from memory after use.
   */
  async decryptField(record: Pick<EncryptedRecord, 'ciphertext' | 'encryptedDEK'>): Promise<string> {
    const plaintextKey = await this.decryptDataKey(record.encryptedDEK);
    try {
      const plain = decryptWithKey(record.ciphertext, plaintextKey);
      return plain;
    } finally {
      plaintextKey.fill(0);
    }
  }
}
