import { Module } from '@nestjs/common';
import { MessagesModule } from './messages/messages.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [MessagesModule, TestModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
