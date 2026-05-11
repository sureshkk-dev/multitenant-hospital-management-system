import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type JwtRequestUser = {
  userId: string;
  role: string;
  hospitalId?: string;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtRequestUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as JwtRequestUser;
  },
);
