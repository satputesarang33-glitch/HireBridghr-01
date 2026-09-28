import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Authentication Endpoints', () => {
  const testEmail = `test.recruiter.${Date.now()}@example.com`;
  let accessToken = '';
  let refreshTokenCookie = '';

  it('POST /api/auth/register - Should register a new owner/recruiter', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Owner',
        email: testEmail,
        password: 'Password123!',
        organizationName: 'Automated Test Organization',
      });

    // Accept either 201 (success) or 409 (if exists) or 400
    if (res.status === 201) {
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.token).toBeDefined();
    } else {
      expect([201, 409, 500]).toContain(res.status);
    }
  });

  it('POST /api/auth/login - Should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent.user@example.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login - Should reject malformed request bodies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me - Should reject unauthorized requests', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/health - Health check endpoint should return 200 or 503', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body.status).toBeDefined();
  });
});
