import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuthService } from './auth/auth.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly auth: AuthService) {}

  async onModuleInit() {
    await this.auth.ensureDefaultSuperAdmin();
  }

  getHello(): string {
    return 'OK';
  }
}
