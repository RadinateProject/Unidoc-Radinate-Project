/*
  Warnings:

  - You are about to drop the column `finding` on the `AIOutput` table. All the data in the column will be lost.
  - You are about to drop the column `finding_kms_key_id` on the `AIOutput` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `AIOutput` table. All the data in the column will be lost.
  - You are about to drop the column `finding` on the `GroundTruth` table. All the data in the column will be lost.
  - You are about to drop the column `finding_kms_key_id` on the `GroundTruth` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `RBACUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[study_id,finding_index]` on the table `AIOutput` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[study_id,finding_index]` on the table `GroundTruth` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email_index]` on the table `RBACUser` will be added. If there are existing duplicate values, this will fail.
  - Made the column `finding_ciphertext` on table `AIOutput` required. This step will fail if there are existing NULL values in that column.
  - Made the column `finding_encrypted_dek` on table `AIOutput` required. This step will fail if there are existing NULL values in that column.
  - Made the column `finding_index` on table `AIOutput` required. This step will fail if there are existing NULL values in that column.
  - Made the column `finding_ciphertext` on table `GroundTruth` required. This step will fail if there are existing NULL values in that column.
  - Made the column `finding_encrypted_dek` on table `GroundTruth` required. This step will fail if there are existing NULL values in that column.
  - Made the column `finding_index` on table `GroundTruth` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email_ciphertext` on table `RBACUser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email_encrypted_dek` on table `RBACUser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email_index` on table `RBACUser` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "AIOutput_study_id_finding_key";

-- DropIndex
DROP INDEX "GroundTruth_study_id_finding_key";

-- DropIndex
DROP INDEX "RBACUser_email_key";

-- AlterTable
ALTER TABLE "AIOutput" DROP COLUMN "finding",
DROP COLUMN "finding_kms_key_id",
DROP COLUMN "summary",
ALTER COLUMN "finding_ciphertext" SET NOT NULL,
ALTER COLUMN "finding_encrypted_dek" SET NOT NULL,
ALTER COLUMN "finding_index" SET NOT NULL;

-- AlterTable
ALTER TABLE "GroundTruth" DROP COLUMN "finding",
DROP COLUMN "finding_kms_key_id",
ALTER COLUMN "finding_ciphertext" SET NOT NULL,
ALTER COLUMN "finding_encrypted_dek" SET NOT NULL,
ALTER COLUMN "finding_index" SET NOT NULL;

-- AlterTable
ALTER TABLE "RBACUser" DROP COLUMN "email",
ALTER COLUMN "email_ciphertext" SET NOT NULL,
ALTER COLUMN "email_encrypted_dek" SET NOT NULL,
ALTER COLUMN "email_index" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AIOutput_study_id_finding_index_key" ON "AIOutput"("study_id", "finding_index");

-- CreateIndex
CREATE UNIQUE INDEX "GroundTruth_study_id_finding_index_key" ON "GroundTruth"("study_id", "finding_index");

-- CreateIndex
CREATE UNIQUE INDEX "RBACUser_email_index_key" ON "RBACUser"("email_index");
