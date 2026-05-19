import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('healthz')
export class HealthController {
  @Get()
  @Public()
  getHealth() {
    return { status: 'ok' as const };
  }
}
