import { Module } from '@nestjs/common';
import { MessagesModule } from './messages/messages.module';
import { CronController } from './cron/cron.controller';

@Module({
  imports: [MessagesModule],
  controllers: [CronController],
  providers: [],
})
export class AppModule {}
