import { Module } from '@nestjs/common';
import { SparkService } from './spark.service';
import { SparkController } from './spark.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SparkController],
  providers: [SparkService],
})
export class SparkModule {}
