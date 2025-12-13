import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EncryptionService } from '../encryption.service';
import { createHmac } from 'crypto';

// 🔐 Deterministic index key
const EMAIL_INDEX_KEY = (() => {
  if (!process.env.FINDING_INDEX_KEY_BASE64) {
    throw new Error('FINDING_INDEX_KEY_BASE64 is not configured');
  }
  return Buffer.from(process.env.FINDING_INDEX_KEY_BASE64, 'base64');
})();

@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RBACController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  // -------------------------
  // List all users (CMIO only)
  // -------------------------
  @Get('users')
  @Roles('CMIO')
  async getUsers() {
    const users = await this.prisma.rBACUser.findMany({
      include: { role: true },
    });

    // ⚠️ Do NOT return email (encrypted PHI)
    return {
      count: users.length,
      users: users.map((u) => ({
        id: u.id,
        role: { name:u.role.name },
        created_at: u.created_at
      })),
    };
  }

  // -------------------------
  // Create new user (CMIO only)
  // -------------------------
  @Post('users')
  @Roles('CMIO')
  async createUser(
    @Body() body: { email: string; role_id: number; password?: string },
  ) {
    const normalizedEmail = body.email.toLowerCase();

    // 🔎 Deterministic email index
    const emailIndex = createHmac('sha256', EMAIL_INDEX_KEY)
      .update(normalizedEmail)
      .digest('hex');

    // ❗ Prevent duplicates
    const existing = await this.prisma.rBACUser.findUnique({
      where: { email_index: emailIndex },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // 🔐 Encrypt email
    const emailEnc =
      await this.encryptionService.encode(normalizedEmail);

    const user = await this.prisma.rBACUser.create({
      data: {
        email_ciphertext: emailEnc.ciphertext,
        email_encrypted_dek: emailEnc.encryptedDEK,
        email_index: emailIndex,
        role_id: body.role_id,
        password: body.password ?? 'changeme123', // or enforce reset
      },
      include: { role: true },
    });

    return {
      success: true,
      user: {
        id: user.id,
        role: user.role.name,
      },
    };
  }

  // -------------------------
  // List all roles (CMIO only)
  // -------------------------
  @Get('roles')
  @Roles('CMIO')
  async getRoles() {
    const roles = await this.prisma.rBACRole.findMany({
      include: {
        permissions: true,
        users: true,
      },
    });

    return {
      count: roles.length,
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        permissions: r.permissions,
        user_count: r.users.length,
      })),
    };
  }

  // -------------------------
  // Create new role (CMIO only)
  // -------------------------
  @Post('roles')
  @Roles('CMIO')
  async createRole(@Body() body: { name: string }) {
    const existing = await this.prisma.rBACRole.findUnique({
      where: { name: body.name },
    });

    if (existing) {
      return {
        success: false,
        message: `Role '${body.name}' already exists.`,
        role: existing,
      };
    }

    const role = await this.prisma.rBACRole.create({
      data: { name: body.name },
    });

    return { success: true, role };
  }

  // -------------------------
  // Add permission to role
  // -------------------------
  @Post('roles/:id/permissions')
  @Roles('CMIO')
  async addPermission(
    @Param('id') id: string,
    @Body() body: { action: string },
  ) {
    const permission = await this.prisma.rBACPermission.create({
      data: {
        role_id: Number(id),
        action: body.action,
      },
    });

    return { success: true, permission };
  }
}
