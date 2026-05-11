import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Patient } from '../schemas/patient.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private readonly patientModel: Model<Patient>,
  ) {}

  private hospitalIdFilter(hospitalId: string) {
    return { hospitalId: new Types.ObjectId(hospitalId) };
  }

  private requireHospitalId(hospitalId?: string): string {
    if (!hospitalId) {
      throw new ForbiddenException('Hospital context is required');
    }
    return hospitalId;
  }

  private parseId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    return new Types.ObjectId(id);
  }

  async list(hospitalId?: string) {
    const hid = this.requireHospitalId(hospitalId);
    return this.patientModel
      .find(this.hospitalIdFilter(hid))
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
  }

  async getOne(hospitalId: string | undefined, id: string) {
    const hid = this.requireHospitalId(hospitalId);
    const doc = await this.patientModel
      .findOne({ _id: this.parseId(id), ...this.hospitalIdFilter(hid) })
      .lean()
      .exec();
    if (!doc) throw new NotFoundException('Patient not found');
    return doc;
  }

  async create(hospitalId: string | undefined, dto: CreatePatientDto) {
    const hid = this.requireHospitalId(hospitalId);
    const doc = new this.patientModel({
      hospitalId: new Types.ObjectId(hid),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email?.trim() || undefined,
      phone: dto.phone?.trim() || undefined,
      dateOfBirth: dto.dateOfBirth?.trim() || undefined,
      active: dto.active ?? true,
    });
    return doc.save();
  }

  async update(
    hospitalId: string | undefined,
    id: string,
    dto: UpdatePatientDto,
  ) {
    const hid = this.requireHospitalId(hospitalId);
    const doc = await this.patientModel
      .findOne({ _id: this.parseId(id), ...this.hospitalIdFilter(hid) })
      .exec();
    if (!doc) throw new NotFoundException('Patient not found');

    if (dto.firstName !== undefined) doc.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) doc.lastName = dto.lastName.trim();
    if (dto.email !== undefined) doc.email = dto.email?.trim() || undefined;
    if (dto.phone !== undefined) doc.phone = dto.phone?.trim() || undefined;
    if (dto.dateOfBirth !== undefined) {
      doc.dateOfBirth = dto.dateOfBirth?.trim() || undefined;
    }
    if (dto.active !== undefined) doc.active = dto.active;

    return doc.save();
  }
}
