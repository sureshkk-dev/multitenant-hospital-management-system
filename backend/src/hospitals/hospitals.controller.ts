import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateHospitalDto } from './dto/create-hospital.dto';

@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitals: HospitalsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superAdmin')
  @Get()
  async list() {
    return this.hospitals.listHospitals();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superAdmin')
  @Post()
  async create(@Body() dto: CreateHospitalDto) {
    return this.hospitals.createHospital({
      name: dto.name,
      subdomain: dto.subdomain,
      adminEmail: dto.adminEmail,
      adminPassword: dto.adminPassword,
    });
  }
}
