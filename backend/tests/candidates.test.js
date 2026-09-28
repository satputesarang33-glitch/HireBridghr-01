import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Candidate Endpoints', () => {
  it('GET /api/candidates - Requires authentication', async () => {
    const res = await request(app).get('/api/candidates');
    expect(res.status).toBe(401);
  });

  it('GET /api/candidates/me - Candidate portal profile requires token', async () => {
    const res = await request(app).get('/api/candidates/me');
    expect(res.status).toBe(401);
  });
});
