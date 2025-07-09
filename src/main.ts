import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { RoleGuard } from './guards/role.guard';
import * as cookieParser from 'cookie-parser';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { LoggingInterceptor } from './interceptor/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.setGlobalPrefix('api/v1', { exclude: [''] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Sử dụng cookie parser
  app.use(cookieParser());

  // Đăng ký RoleGuard như global guard
  const roleGuard = app.get(RoleGuard);
  app.useGlobalGuards(roleGuard);

  await app.listen(port);
}
bootstrap();
