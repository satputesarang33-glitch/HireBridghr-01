import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Applications Endpoints', () => {
  it('GET /api/applications - Requires authentication', async () => {
    const res = await request(app).get('/api/applications');
    expect(res.status).toBe(401);
  });

  it('POST /api/applications - Rejects empty application request', async () => {
    const res = await request(app).post('/api/applications').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
