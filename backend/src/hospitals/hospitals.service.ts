import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hospital } from '../schemas/hospital.schema';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HospitalsService {
  constructor(
    @InjectModel(Hospital.name) private readonly hospitalModel: Model<Hospital>,
    private readonly users: UsersService,
  ) {}

  private slugify(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private normalizeSubdomain(subdomain: string) {
    return subdomain.toLowerCase().trim();
  }

  async createHospital(input: {
    name: string;
    subdomain: string;
    adminEmail: string;
    adminPassword: string;
  }) {
    const name = input.name.trim();
    if (!name) throw new BadRequestException('Hospital name is required');
    const slug = this.slugify(name);
    const subdomain = this.normalizeSubdomain(input.subdomain);
    if (!subdomain) throw new BadRequestException('Subdomain is required');

    const existsSlug = await this.hospitalModel.findOne({ slug }).exec();
    if (existsSlug) throw new BadRequestException('Hospital already exists');

    const existsSub = await this.hospitalModel.findOne({ subdomain }).exec();
    if (existsSub) throw new BadRequestException('Subdomain already in use');

    const existingAdmin = await this.users.findByEmail(input.adminEmail);
    if (existingAdmin) throw new BadRequestException('Admin email already in use');

    const hospital = await new this.hospitalModel({ name, slug, subdomain }).save();

    const passwordHash = await bcrypt.hash(input.adminPassword, 10);
    await this.users.createUser({
      email: input.adminEmail,
      passwordHash,
      role: 'hospitalAdmin',
      hospitalId: String((hospital as any)._id),
    });

    return hospital;
  }

  async listHospitals() {
    const hospitals = await this.hospitalModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    if (hospitals.length === 0) return hospitals;

    const ids = hospitals.map((h) => h._id as Types.ObjectId);
    const adminEmails = await this.users.listAdminEmailsByHospitalIds(ids);

    return hospitals.map((h) => ({
      ...h,
      adminEmail: adminEmails.get(String(h._id)) ?? null,
    }));
  }

  async getHospitalById(id: string) {
    return this.hospitalModel.findById(id).exec();
  }
}
