import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { RoleGuard } from './guards/role.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  app.setGlobalPrefix('api/v1', { exclude: [''] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Đăng ký RoleGuard như global guard
  const roleGuard = app.get(RoleGuard);
  app.useGlobalGuards(roleGuard);

  await app.listen(port);
}
bootstrap();
