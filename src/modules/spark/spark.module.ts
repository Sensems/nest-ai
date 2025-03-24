import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SparkService } from './spark.service';
import { MessagesModule } from '../messages/messages.module';
import { SparkController } from './spark.controller';

@Module({
  imports: [HttpModule, MessagesModule],
  controllers: [SparkController],
  providers: [SparkService],
})
export class SparkModule {}
