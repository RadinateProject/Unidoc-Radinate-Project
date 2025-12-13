-- AlterTable
ALTER TABLE "AIOutput" ADD COLUMN     "finding_ciphertext" TEXT,
ADD COLUMN     "finding_encrypted_dek" TEXT,
ADD COLUMN     "finding_index" TEXT,
ADD COLUMN     "finding_kms_key_id" TEXT,
ADD COLUMN     "summary_ciphertext" TEXT,
ADD COLUMN     "summary_encrypted_dek" TEXT;

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "payload_ciphertext" TEXT,
ADD COLUMN     "payload_encrypted_dek" TEXT;

-- AlterTable
ALTER TABLE "GroundTruth" ADD COLUMN     "finding_ciphertext" TEXT,
ADD COLUMN     "finding_encrypted_dek" TEXT,
ADD COLUMN     "finding_index" TEXT,
ADD COLUMN     "finding_kms_key_id" TEXT;

-- AlterTable
ALTER TABLE "RBACUser" ADD COLUMN     "email_ciphertext" TEXT,
ADD COLUMN     "email_encrypted_dek" TEXT,
ADD COLUMN     "email_index" TEXT,
ALTER COLUMN "password" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Study" ADD COLUMN     "patient_demographics_ciphertext" TEXT,
ADD COLUMN     "patient_demographics_encrypted_dek" TEXT,
ADD COLUMN     "patient_id_ciphertext" TEXT,
ADD COLUMN     "patient_id_encrypted_dek" TEXT,
ADD COLUMN     "patient_id_index" TEXT,
ADD COLUMN     "patient_id_kms_key_id" TEXT;
