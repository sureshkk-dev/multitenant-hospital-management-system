import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from './auth.types';
import { Hospital } from '../schemas/hospital.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectModel(Hospital.name) private readonly hospitalModel: Model<Hospital>,
  ) {}

  async ensureDefaultSuperAdmin() {
    const count = await this.users.countSuperAdmins();
    if (count > 0) return;

    const email = this.config.get<string>('SUPERADMIN_EMAIL');
    const password = this.config.get<string>('SUPERADMIN_PASSWORD');
    if (!email || !password) return;

    const existing = await this.users.findByEmail(email);
    if (existing) return;

    const passwordHash = await bcrypt.hash(password, 10);
    await this.users.createUser({
      email,
      passwordHash,
      role: 'superAdmin',
    });
  }

  async login(email: string, password: string, tenantSubdomain?: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');

    const baseDomain =
      this.config.get<string>('TENANT_BASE_DOMAIN')?.toLowerCase().trim() ||
      'hospital.com';
    const allowApexHospitalLogin =
      this.config.get<string>('ALLOW_APEX_HOSPITAL_LOGIN') === 'true';

    if (user.role === 'superAdmin') {
      if (tenantSubdomain) {
        throw new UnauthorizedException(
          `Super admin must sign in on the central site (no tenant subdomain), e.g. https://${baseDomain}`,
        );
      }
    }

    let hospitalSubdomain: string | undefined;

    if (user.role === 'hospitalAdmin') {
      if (!user.hospitalId) {
        throw new UnauthorizedException('Hospital admin is missing hospitalId');
      }
      const hospital = await this.hospitalModel.findById(user.hospitalId).exec();
      if (!hospital) {
        throw new UnauthorizedException('Hospital not found for this account');
      }
      hospitalSubdomain = hospital.subdomain;

      if (tenantSubdomain && tenantSubdomain !== hospital.subdomain) {
        throw new UnauthorizedException(
          `Wrong tenant. Use https://${hospital.subdomain}.${baseDomain} (same URL you use in the browser).`,
        );
      }
      if (!tenantSubdomain && !allowApexHospitalLogin) {
        throw new UnauthorizedException(
          `Hospital admins must sign in at https://${hospital.subdomain}.${baseDomain} (add "${hospital.subdomain}.${baseDomain}" to /etc/hosts pointing to 127.0.0.1 for local dev).`,
        );
      }
    }

    const payload: JwtPayload = {
      sub: String(user._id),
      role: user.role,
      hospitalId: user.hospitalId ? String(user.hospitalId) : undefined,
    };

    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId ? String(user.hospitalId) : undefined,
        hospitalSubdomain,
      },
    };
  }

  async createSuperAdmin(input: { email: string; password: string }) {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new ConflictException('Email already exists');
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.users.createUser({
      email: input.email,
      passwordHash,
      role: 'superAdmin',
    });
    return {
      id: String(user._id),
      email: user.email,
      role: user.role,
    };
  }
}
