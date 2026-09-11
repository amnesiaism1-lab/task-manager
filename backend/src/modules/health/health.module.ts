import { Controller, Get } from '@nestjs/common';
import { Module } from '@nestjs/common';

@Controller('health')
class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok', service: 'task-manager-api' };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
