import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { jwtLib } from '../src/lib/jwt.js';

describe('Multi-Tenant Isolation Security Tests', () => {
  // Synthesize tokens for Org A and Org B
  const orgAToken = jwtLib.signAccessToken({
    id: 'user-org-a',
    email: 'recruiter.a@organization-a.com',
    role: 'RECRUITER',
    organizationId: 'org-a-1111',
  });

  const orgBToken = jwtLib.signAccessToken({
    id: 'user-org-b',
    email: 'recruiter.b@organization-b.com',
    role: 'RECRUITER',
    organizationId: 'org-b-2222',
  });

  it('Blocked: Unauthenticated user cannot access protected tenant jobs', async () => {
    const res = await request(app).post('/api/jobs').send({
      title: 'Hacked Job Title',
      description: 'Attempting unauthenticated creation',
    });

    expect(res.status).toBe(401);
  });

  it('Blocked: User cannot spoof tenant by merely passing an arbitrary X-Organization-Id', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${orgAToken}`)
      .set('X-Organization-Id', 'org-b-2222') // Org A recruiter trying to inject into Org B
      .send({
        title: 'Cross Tenant Injection Test',
        description: 'Should be rejected or scoped to trusted membership',
      });

    // Server either scopes to trusted DB membership or rejects unauthorized
    if (res.status === 201) {
      // If created, ensure it didn't leak into Org B
      expect(res.body.data.organizationId).not.toBe('org-b-2222');
    } else {
      expect([400, 401, 403, 404, 500]).toContain(res.status);
    }
  });

  it('Blocked: Unauthorized candidate cannot schedule an interview', async () => {
    const candidateToken = jwtLib.signAccessToken({
      id: 'usr-cand-1',
      email: 'candidate@example.com',
      role: 'CANDIDATE',
      organizationId: null,
    });

    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        applicationId: 'app-fake',
        scheduledDate: new Date().toISOString(),
      });

    // CANDIDATE does not have permission to schedule interviews
    expect([401, 403, 404]).toContain(res.status);
  });
});
