import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  /** Browser hostname tenant: "city" for city.hospital.com; omit on apex (super admin). */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return String(value).toLowerCase().trim();
  })
  @IsString()
  @Matches(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i, {
    message:
      'tenantSubdomain must be 1-63 chars, letters/numbers/hyphen, and cannot start/end with hyphen',
  })
  tenantSubdomain?: string;
}

