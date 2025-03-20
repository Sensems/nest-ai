import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SparkModule } from './modules/spark/spark.module';
import appConfig from './config/app.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV}`, // 如 .env.development
        '.env', // 默认 .env
      ],
    }),
    SparkModule,
  ],
})
export class AppModule {}
