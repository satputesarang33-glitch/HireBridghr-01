import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Interviews Endpoints', () => {
  it('GET /api/interviews - Requires authentication', async () => {
    const res = await request(app).get('/api/interviews');
    expect(res.status).toBe(401);
  });

  it('POST /api/interviews - Rejects unauthenticated scheduling', async () => {
    const res = await request(app).post('/api/interviews').send({});
    expect(res.status).toBe(401);
  });
});
