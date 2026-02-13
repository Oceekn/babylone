import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot() {
    return {
      service: 'BABYLONE Backend API',
      version: '1.0.0',
      status: 'running',
    };
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}

