import express, { Request, Response } from 'express';
import request from 'supertest';
import { z } from 'zod';
import policyMiddleware from '../../appMiddlewares/policy.middleware';

const app = express();
app.use(express.json());

const testSchema = z.object({
  name: z.string(),
  age: z.number().min(0),
});

app.post(
  '/test',
  policyMiddleware(testSchema),
  (req: Request, res: Response) => {
    res.json({ success: true });
  }
);

describe('Policy Middleware', () => {
  it('should allow valid request body', async () => {
    const response = await request(app).post('/test').send({
      name: 'John Doe',
      age: 30,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });

  it('should return an error for invalid request body', async () => {
    const response = await request(app).post('/test').send({
      name: 'John Doe',
      age: -5,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'age number must be greater than or equal to 0',
    });
  });
});
