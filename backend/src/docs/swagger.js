export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'HirebridgeHR REST API',
    version: '1.0.0',
    description:
      'Enterprise-grade multi-tenant Applicant Tracking System (ATS) REST API documentation. Includes JWT authentication with refresh token rotation, RBAC, tenant isolation, and private resume management.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT access token (obtained from /api/auth/login or /api/auth/register).',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'HttpOnly cookie for token rotation.',
      },
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Request completed successfully' },
          data: { type: 'object' },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Data fetched successfully' },
          data: { type: 'array', items: { type: 'object' } },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              total: { type: 'integer', example: 45 },
              totalPages: { type: 'integer', example: 3 },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address' },
              },
            },
          },
        },
      },
      Job: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Senior Full Stack Engineer' },
          department: { type: 'string', example: 'Engineering' },
          location: { type: 'string', example: 'San Francisco, CA' },
          workplaceType: { type: 'string', enum: ['REMOTE', 'HYBRID', 'ON_SITE'] },
          employmentType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'] },
          salaryMin: { type: 'number', example: 140000 },
          salaryMax: { type: 'number', example: 185000 },
          currency: { type: 'string', example: 'USD' },
          status: { type: 'string', enum: ['DRAFT', 'PENDING_ADMIN_PUBLICATION', 'PUBLISHED', 'CLOSED'] },
          applicationsCount: { type: 'integer', example: 28 },
          description: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'Server & Database Health Check',
        responses: {
          200: { description: 'Server is healthy and connected to DB' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new recruiter / organization owner account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Sarah Connor' },
                  email: { type: 'string', example: 'sarah.connor@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                  organizationName: { type: 'string', example: 'Apex Global Tech' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Account registered successfully' },
          409: { description: 'Account with this email already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate user with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'sarah.connor@apextech.com' },
                  password: { type: 'string', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Rotate refresh token and obtain new short-lived access token',
        responses: {
          200: { description: 'Tokens rotated successfully' },
          401: { description: 'Invalid, expired, or reused refresh token' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Revoke active refresh token and clear cookie',
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get authenticated user profile and active organization context',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile retrieved' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/jobs': {
      get: {
        summary: 'List jobs with search, filtering, and pagination',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'department', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'Paginated list of jobs',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } },
          },
        },
      },
      post: {
        summary: 'Create a new job (Recruiter/Admin/Owner)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Job' },
            },
          },
        },
        responses: {
          201: { description: 'Job created' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/api/candidates': {
      get: {
        summary: 'List candidates in organization with filters and search',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Candidates list' },
        },
      },
      post: {
        summary: 'Create candidate profile',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Candidate created' },
        },
      },
    },
    '/api/applications': {
      get: {
        summary: 'List applications across jobs',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Applications list' },
        },
      },
      post: {
        summary: 'Apply for a job (Candidate or Recruiter)',
        responses: {
          201: { description: 'Application submitted successfully' },
          409: { description: 'Already applied for this position' },
        },
      },
    },
    '/api/interviews': {
      get: {
        summary: 'List scheduled interviews',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Interviews list' },
        },
      },
      post: {
        summary: 'Schedule an interview',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Interview scheduled' },
        },
      },
    },
    '/api/reports/overview': {
      get: {
        summary: 'Get organization recruitment metrics and funnel analytics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Analytics overview' },
        },
      },
    },
  },
};
