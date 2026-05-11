export type UserRole = 'superAdmin' | 'hospitalAdmin';

export type JwtPayload = {
  sub: string;
  role: UserRole;
  hospitalId?: string;
};
