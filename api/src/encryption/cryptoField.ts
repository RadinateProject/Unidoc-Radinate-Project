// cryptoField.ts
import crypto from 'crypto';

export const ALGO = 'aes-256-gcm';
export const IV_LENGTH = 12; // bytes
export const TAG_LENGTH = 16; // bytes
export const KEY_LENGTH = 32; // 256 bits

export interface EncryptedPayload {
  /** base64 packaged blob: iv || authTag || ciphertext */
  blob: string;
  iv: string;  // base64
  tag: string; // base64
}

/**
 * Encrypt plaintext with a 32-byte key (AES-256-GCM).
 * @param plaintext UTF-8 string
 * @param key Buffer (32 bytes)
 */
export function encryptWithKey(plaintext: string, key: Buffer): EncryptedPayload {
  if (!Buffer.isBuffer(key) || key.length !== KEY_LENGTH) {
    throw new Error(`Invalid key: expected Buffer of length ${KEY_LENGTH}`);
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: TAG_LENGTH });
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // packaged: iv || authTag || ciphertext
  const packaged = Buffer.concat([iv, authTag, ciphertext]);
  return {
    blob: packaged.toString('base64'),
    iv: iv.toString('base64'),
    tag: authTag.toString('base64')
  };
}

/**
 * Decrypt a packaged blob produced by encryptWithKey.
 * @param blobB64 base64 packaged blob
 * @param key Buffer (32 bytes)
 */
export function decryptWithKey(blobB64: string, key: Buffer): string {
  if (!Buffer.isBuffer(key) || key.length !== KEY_LENGTH) {
    throw new Error(`Invalid key: expected Buffer of length ${KEY_LENGTH}`);
  }
  const data = Buffer.from(blobB64, 'base64');
  if (data.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid data: too short to contain IV and auth tag');
  }
  const iv = data.slice(0, IV_LENGTH);
  const authTag = data.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = data.slice(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGO, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(authTag);
  const plaintextBuf = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintextBuf.toString('utf8');
}
