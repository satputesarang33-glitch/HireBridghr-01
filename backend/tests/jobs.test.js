import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Jobs API Endpoints', () => {
  it('GET /api/jobs - Should return list of public jobs', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/jobs - Should support /api/v1 prefix seamlessly', async () => {
    const res = await request(app).get('/api/v1/jobs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/jobs/:id - Non-existent job returns 404', async () => {
    const res = await request(app).get('/api/jobs/non-existent-uuid-1234');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
