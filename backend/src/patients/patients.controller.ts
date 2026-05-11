import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtRequestUser } from '../auth/current-user.decorator';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('hospitalAdmin')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Get()
  async list(@CurrentUser() user: JwtRequestUser) {
    return this.patients.list(user.hospitalId);
  }

  @Get(':id')
  async getOne(
    @CurrentUser() user: JwtRequestUser,
    @Param('id') id: string,
  ) {
    return this.patients.getOne(user.hospitalId, id);
  }

  @Post()
  async create(
    @CurrentUser() user: JwtRequestUser,
    @Body() dto: CreatePatientDto,
  ) {
    return this.patients.create(user.hospitalId, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtRequestUser,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patients.update(user.hospitalId, id, dto);
  }
}
