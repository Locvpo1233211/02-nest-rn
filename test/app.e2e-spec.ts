import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) - should require authentication', () => {
    return request(app.getHttpServer()).get('/').expect(401); // Unauthorized - cần JWT token
  });

  it('/ (GET) - should require admin role', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401); // Unauthorized - token không hợp lệ
  });
});
