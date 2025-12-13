// src/types.ts
export interface EncryptedRecord {
  id?: string;
  ciphertext: string;    // base64 package: iv || tag || ciphertext
  encryptedDEK: string;  // base64 of KMS-wrapped DEK
  kmsKeyId?: string;     // CMK id or ARN (useful for audit/rotation)
  algorithm?: string;    // e.g. 'AES-256-GCM'
  createdAt?: string;
}
