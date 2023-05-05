import { describe, it } from '@jest/globals';
import app from 'src/app';
import { closeMongoDb } from 'src/config/persistence/database';
import { connectMongoDb } from 'src/config/persistence/database';
import { seedNow } from 'src/config/persistence/seeder';

import request from 'supertest';

describe('Dashboard Authentication', () => {
  beforeAll(async () => {
    await connectMongoDb().then(() => {
      seedNow();
    });
  });

  afterAll(async () => {
    await closeMongoDb();
  });

  it('should seed user login successfully', async () => {
    const res = await request(app).post('/v1/en/auth/login').send({
      email: 'piftech@pif-app.com',
      password: 'Password_1',
    });

    expect(res.statusCode).toBe(200);
  });
});
