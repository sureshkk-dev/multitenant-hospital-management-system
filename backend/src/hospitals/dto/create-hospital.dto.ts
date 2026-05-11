import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class CreateHospitalDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i, {
    message:
      'subdomain must be 1-63 chars, letters/numbers/hyphen, and cannot start/end with hyphen',
  })
  subdomain!: string;

  @IsEmail()
  adminEmail!: string;

  @IsString()
  @MinLength(8)
  adminPassword!: string;
}

