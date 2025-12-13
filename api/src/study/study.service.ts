import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EncryptionService } from '../encryption.service';

@Injectable()
export class StudyService {
  private readonly logger = new Logger(StudyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Decrypt PHI fields if encrypted.
   * Works during migration (plaintext + encrypted coexist).
   */
  private async decryptStudy(study: any) {
    if (!study) return study;

    const decrypted = { ...study };

    try {
      // patient_id
      if (study.patient_id_ciphertext && study.patient_id_encrypted_dek) {
        decrypted.patient_id = await this.encryptionService.decode(
          study.patient_id_ciphertext,
          study.patient_id_encrypted_dek,
        );
      }

      // patient demographics bundle (optional approach)
      if (
        study.patient_demographics_ciphertext &&
        study.patient_demographics_encrypted_dek
      ) {
        const demographicsJson = await this.encryptionService.decode(
          study.patient_demographics_ciphertext,
          study.patient_demographics_encrypted_dek,
        );
        Object.assign(decrypted, JSON.parse(demographicsJson));
      }
    } catch (err) {
      this.logger.error(
        `Failed to decrypt study ${study.id}`,
        err,
      );
      throw err;
    }

    // Never expose ciphertext fields
    delete decrypted.patient_id_ciphertext;
    delete decrypted.patient_id_encrypted_dek;
    delete decrypted.patient_demographics_ciphertext;
    delete decrypted.patient_demographics_encrypted_dek;

    return decrypted;
  }

  async findAll() {
    const studies = await this.prisma.study.findMany({
      orderBy: { created_at: 'desc' },
    });

    return Promise.all(studies.map((s) => this.decryptStudy(s)));
  }

  async findById(id: number) {
    const study = await this.prisma.study.findUnique({
      where: { id },
    });
    if (!study) return null;
    return this.decryptStudy(study);
  }
}
