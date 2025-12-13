import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { createHmac } from 'crypto';
import { EncryptionService } from '../encryption.service';

// 🔐 Deterministic index key (fail fast if missing)
const EMAIL_INDEX_KEY = (() => {
  if (!process.env.FINDING_INDEX_KEY_BASE64) {
    throw new Error('FINDING_INDEX_KEY_BASE64 is not configured');
  }
  return Buffer.from(process.env.FINDING_INDEX_KEY_BASE64, 'base64');
})();

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  // -------------------------
  // LOGIN
  // -------------------------
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const normalizedEmail = body.email.toLowerCase();

    const emailIndex = createHmac('sha256', EMAIL_INDEX_KEY)
      .update(normalizedEmail)
      .digest('hex');

    const user = await this.prisma.rBACUser.findUnique({
      where: { email_index: emailIndex },
      include: { role: true },
    });

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' },
    );

    return {
      token,
      user: {
        id: user.id,
        role: user.role.name,
      },
    };
  }

  // -------------------------
  // REGISTER
  // -------------------------
  @Post('register')
  async register(
    @Body() body: { email: string; password: string; role_id: number },
  ) {
    const normalizedEmail = body.email.toLowerCase();

    // 🔐 Encrypt email
    const emailEnc = await this.encryptionService.encode(normalizedEmail);

    // 🔎 Deterministic index
    const emailIndex = createHmac('sha256', EMAIL_INDEX_KEY)
      .update(normalizedEmail)
      .digest('hex');

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await this.prisma.rBACUser.create({
      data: {
        email_ciphertext: emailEnc.ciphertext,
        email_encrypted_dek: emailEnc.encryptedDEK,
        email_index: emailIndex,
        password: hashedPassword,
        role_id: body.role_id,
      },
      include: { role: true },
    });

    return {
      id: user.id,
      role: user.role.name,
    };
  }
}
