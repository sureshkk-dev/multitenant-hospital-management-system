import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtRequestUser } from '../auth/current-user.decorator';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('hospitalAdmin')
export class DoctorsController {
  constructor(private readonly doctors: DoctorsService) {}

  @Get()
  async list(@CurrentUser() user: JwtRequestUser) {
    return this.doctors.list(user.hospitalId);
  }

  @Get(':id')
  async getOne(@CurrentUser() user: JwtRequestUser, @Param('id') id: string) {
    return this.doctors.getOne(user.hospitalId, id);
  }

  @Post()
  async create(
    @CurrentUser() user: JwtRequestUser,
    @Body() dto: CreateDoctorDto,
  ) {
    return this.doctors.create(user.hospitalId, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtRequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.doctors.update(user.hospitalId, id, dto);
  }
}
