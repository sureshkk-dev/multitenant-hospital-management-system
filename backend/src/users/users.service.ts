import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import type { UserRole } from '../auth/auth.types';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async countSuperAdmins() {
    return this.userModel.countDocuments({ role: 'superAdmin' }).exec();
  }

  /**
   * One comma-separated string per hospitalId (sorted), for hospitalAdmin users only.
   */
  async listAdminEmailsByHospitalIds(
    hospitalIds: Types.ObjectId[],
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    if (hospitalIds.length === 0) return result;

    const rows = await this.userModel
      .find({
        role: 'hospitalAdmin',
        hospitalId: { $in: hospitalIds },
      })
      .select('email hospitalId')
      .lean()
      .exec();

    const byHospital = new Map<string, string[]>();
    for (const row of rows) {
      if (!row.hospitalId) continue;
      const hid = String(row.hospitalId);
      const list = byHospital.get(hid) ?? [];
      list.push(row.email);
      byHospital.set(hid, list);
    }
    for (const [hid, emails] of byHospital) {
      result.set(hid, [...new Set(emails)].sort().join(', '));
    }
    return result;
  }

  async createUser(input: {
    email: string;
    passwordHash: string;
    role: UserRole;
    hospitalId?: string;
  }) {
    const doc = new this.userModel({
      email: input.email.toLowerCase().trim(),
      passwordHash: input.passwordHash,
      role: input.role,
      hospitalId: input.hospitalId ? new Types.ObjectId(input.hospitalId) : undefined,
    });
    return doc.save();
  }
}
