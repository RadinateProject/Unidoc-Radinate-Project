import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.prisma.rBACUser.findUnique({
      where: { email: body.email },
      include: { role: true },
    });
  const safeBody = { email: body.email, password: body.password };
    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
 
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role.name,
      },
      process.env.JWT_SECRET || 'RadinateSecret',
      { expiresIn: '1d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        // description: user.role.description,
      },
    };
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string; role_id: number }) {
    const hashed = await bcrypt.hash(body.password, 10);
    const user = await this.prisma.rBACUser.create({
      data: {
        email: body.email,
        password: hashed,
        role_id: body.role_id,
      },
      include: { role: true },
    });
    return { id: user.id, email: user.email, role: user.role.name };
  }
}
