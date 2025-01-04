import { Controller, Get } from '@nestjs/common';

@Controller('cron')
export class CronController {
  @Get()
  public index() {
    return '1';
  }
}
