import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';

describe('AppModule real e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken = '';
  let createdExpenseId = '';
  let createdUserId = '';

  const email = `e2e_${Date.now()}@example.com`;
  const password = '123456';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');

    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (createdUserId && prisma) {
      await prisma.user.deleteMany({
        where: { id: createdUserId },
      });
    }

    if (app) {
      await app.close();
    }
  });

  it('registers and logs in a user', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email,
        password,
      })
      .expect(201);

    expect(registerRes.body?.access_token).toBeDefined();
    expect(registerRes.body?.user?.email).toBe(email);
    createdUserId = registerRes.body.user.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email,
        password,
      })
      .expect(200);

    expect(loginRes.body?.access_token).toBeDefined();
    accessToken = loginRes.body.access_token as string;
  });

  it('rejects protected route without token', async () => {
    await request(app.getHttpServer()).get('/api/budget/current').expect(401);
  });

  it('runs authenticated budget flow end-to-end', async () => {
    const createBudgetRes = await request(app.getHttpServer())
      .post('/api/budget')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        totalIncome: 5000,
        totalFixed: 1200,
        strategy: 'LINEAR',
      })
      .expect(201);

    expect(createBudgetRes.body.totalIncome).toBe(5000);
    expect(createBudgetRes.body.totalFixed).toBe(1200);
    expect(createBudgetRes.body.strategy).toBe('LINEAR');

    const currentRes = await request(app.getHttpServer())
      .get('/api/budget/current')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(currentRes.body.id).toBeDefined();

    const strategyRes = await request(app.getHttpServer())
      .put('/api/budget/strategy')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ strategy: 'AGGRESSIVE' })
      .expect(200);

    expect(strategyRes.body.strategy).toBe('AGGRESSIVE');

    await request(app.getHttpServer())
      .put('/api/budget/income')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ totalIncome: 5200 })
      .expect(200);

    await request(app.getHttpServer())
      .put('/api/budget/fixed')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ totalFixed: 1300 })
      .expect(200);
  });

  it('runs authenticated expense flow end-to-end', async () => {
    const expenseDate = new Date().toISOString().slice(0, 10);

    const createExpenseRes = await request(app.getHttpServer())
      .post('/api/expenses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: 200,
        type: 'VARIABLE',
        category: 'food',
        date: expenseDate,
      })
      .expect(201);

    createdExpenseId = createExpenseRes.body.id;
    expect(createdExpenseId).toBeDefined();

    const listRes = await request(app.getHttpServer())
      .get('/api/expenses')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.some((item: { id: string }) => item.id === createdExpenseId)).toBe(true);

    const statsRes = await request(app.getHttpServer())
      .get('/api/expenses/stats')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(statsRes.body.total).toBeGreaterThanOrEqual(200);

    await request(app.getHttpServer())
      .get(`/api/expenses/${createdExpenseId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/expenses/${createdExpenseId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/budget/adjustments')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
