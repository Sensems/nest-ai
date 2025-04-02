import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { swaggerConfig } from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 CORS
  app.enableCors();

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe());

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 获取 ConfigService 实例
  const configService = app.get(ConfigService);

  // 获取端口号
  const port = configService.get<number>('app.port');

  if (!port) {
    throw new Error('PORT is not defined');
  }

  // 配置 Swagger
  swaggerConfig(app);

  await app.listen(port);
}
bootstrap().catch((err) => {
  console.error(err);
});
