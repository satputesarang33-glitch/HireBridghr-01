import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting HirebridgeHR database seed...');

  const defaultPasswordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
  });

  // 1. Create Default Organizations
  const org1 = await prisma.organization.upsert({
    where: { slug: 'apex-global-tech' },
    update: {},
    create: {
      name: 'Apex Global Tech',
      slug: 'apex-global-tech',
      type: 'COMPANY',
      industry: 'Enterprise Software & Cloud',
      size: '250-500',
      website: 'https://apextech.example.com',
      country: 'United States',
      city: 'San Francisco, CA',
      timeZone: 'America/Los_Angeles',
      status: 'ACTIVE',
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { slug: 'quantum-staffing' },
    update: {},
    create: {
      name: 'Quantum Staffing Solutions',
      slug: 'quantum-staffing',
      type: 'STAFFING',
      industry: 'IT & Financial Services Staffing',
      size: '50-100',
      website: 'https://quantumstaffing.example.com',
      country: 'United Kingdom',
      city: 'London',
      timeZone: 'Europe/London',
      status: 'ACTIVE',
    },
  });

  // 2. Create Users
  const userOwner = await prisma.user.upsert({
    where: { email: 'sarah.connor@apextech.com' },
    update: {},
    create: {
      email: 'sarah.connor@apextech.com',
      name: 'Sarah Connor',
      firstName: 'Sarah',
      lastName: 'Connor',
      passwordHash: defaultPasswordHash,
      role: 'OWNER',
      jobTitle: 'Head of Talent Acquisition',
      phone: '+1 (415) 890-1234',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const userAdmin = await prisma.user.upsert({
    where: { email: 'marcus.vance@apextech.com' },
    update: {},
    create: {
      email: 'marcus.vance@apextech.com',
      name: 'Marcus Vance',
      firstName: 'Marcus',
      lastName: 'Vance',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      jobTitle: 'Senior HR Business Partner',
      phone: '+1 (415) 765-4321',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const userRecruiter = await prisma.user.upsert({
    where: { email: 'elena.rostova@apextech.com' },
    update: {},
    create: {
      email: 'elena.rostova@apextech.com',
      name: 'Elena Rostova',
      firstName: 'Elena',
      lastName: 'Rostova',
      passwordHash: defaultPasswordHash,
      role: 'RECRUITER',
      jobTitle: 'Lead Technical Recruiter',
      phone: '+1 (415) 321-9876',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const userHiringManager = await prisma.user.upsert({
    where: { email: 'david.chen@apextech.com' },
    update: {},
    create: {
      email: 'david.chen@apextech.com',
      name: 'David Chen',
      firstName: 'David',
      lastName: 'Chen',
      passwordHash: defaultPasswordHash,
      role: 'HIRING_MANAGER',
      jobTitle: 'VP of Engineering',
      phone: '+1 (415) 654-7890',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const userSuperAdmin = await prisma.user.upsert({
    where: { email: 'alex.mercer@hirebridge.internal' },
    update: {},
    create: {
      email: 'alex.mercer@hirebridge.internal',
      name: 'Alex Mercer',
      firstName: 'Alex',
      lastName: 'Mercer',
      passwordHash: defaultPasswordHash,
      role: 'SUPER_ADMIN',
      jobTitle: 'Platform Master Admin',
      phone: '+1 (800) 555-0199',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const userCandidate = await prisma.user.upsert({
    where: { email: 'alex.candidate@example.com' },
    update: {},
    create: {
      email: 'alex.candidate@example.com',
      name: 'Alex Rivera',
      firstName: 'Alex',
      lastName: 'Rivera',
      passwordHash: defaultPasswordHash,
      role: 'CANDIDATE',
      jobTitle: 'Senior Full Stack & Mobile Engineer',
      location: 'San Francisco, CA',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      skills: ['React.js', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker'],
      experienceYears: 6,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  // 3. Create Organization Memberships
  await prisma.organizationMembership.upsert({
    where: {
      userId_organizationId: {
        userId: userOwner.id,
        organizationId: org1.id,
      },
    },
    update: { role: 'OWNER' },
    create: {
      userId: userOwner.id,
      organizationId: org1.id,
      role: 'OWNER',
    },
  });

  await prisma.organizationMembership.upsert({
    where: {
      userId_organizationId: {
        userId: userAdmin.id,
        organizationId: org1.id,
      },
    },
    update: { role: 'ADMIN' },
    create: {
      userId: userAdmin.id,
      organizationId: org1.id,
      role: 'ADMIN',
    },
  });

  await prisma.organizationMembership.upsert({
    where: {
      userId_organizationId: {
        userId: userRecruiter.id,
        organizationId: org1.id,
      },
    },
    update: { role: 'RECRUITER' },
    create: {
      userId: userRecruiter.id,
      organizationId: org1.id,
      role: 'RECRUITER',
    },
  });

  await prisma.organizationMembership.upsert({
    where: {
      userId_organizationId: {
        userId: userHiringManager.id,
        organizationId: org1.id,
      },
    },
    update: { role: 'HIRING_MANAGER' },
    create: {
      userId: userHiringManager.id,
      organizationId: org1.id,
      role: 'HIRING_MANAGER',
    },
  });

  // 4. Create Jobs
  const job1 = await prisma.job.create({
    data: {
      organizationId: org1.id,
      slug: 'senior-full-stack-engineer',
      title: 'Senior Full Stack Engineer',
      client: 'FinTech Cloud Division',
      department: 'Engineering',
      location: 'San Francisco, CA',
      workplaceType: 'HYBRID',
      employmentType: 'FULL_TIME',
      experienceMin: 5,
      experienceMax: 8,
      experienceLevel: 'Senior',
      salaryMin: 140000,
      salaryMax: 185000,
      currency: 'USD',
      skills: ['React.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
      description: 'Apex Global Tech is seeking an experienced Senior Full Stack Engineer...',
      status: 'PUBLISHED',
      recruiterId: userRecruiter.id,
      recruiterName: userRecruiter.name,
      contactPerson: userRecruiter.name,
      candidateEmail: 'careers@apextech.example.com',
      isPublic: true,
      publishedAt: new Date(),
      distributions: {
        create: [
          {
            platform: 'MANUAL',
            status: 'PUBLISHED',
            externalJobId: 'HB-PUB-99182',
            publishedAt: new Date(),
          },
        ],
      },
    },
  });

  // 5. Create Candidate & Application
  const candidate1 = await prisma.candidate.create({
    data: {
      organizationId: org1.id,
      userId: userCandidate.id,
      name: userCandidate.name,
      firstName: 'Alex',
      lastName: 'Rivera',
      email: userCandidate.email,
      phone: userCandidate.phone,
      location: 'San Francisco, CA',
      currentTitle: 'Senior Full Stack & Mobile Engineer',
      skills: ['React.js', 'Node.js', 'PostgreSQL', 'AWS'],
      experienceYears: 6,
      rating: 5.0,
      status: 'ACTIVE',
      source: 'Direct Application',
      tags: ['Top Talent', 'Full Stack', 'Immediate Joiner'],
      assignedRecruiterId: userRecruiter.id,
      assignedRecruiterName: userRecruiter.name,
      notes: {
        create: [
          {
            authorId: userRecruiter.id,
            authorName: userRecruiter.name,
            content: 'Exceptional portfolio and clean system design acumen.',
            rating: 5.0,
          },
        ],
      },
    },
  });

  await prisma.application.create({
    data: {
      organizationId: org1.id,
      jobId: job1.id,
      candidateId: candidate1.id,
      candidateName: candidate1.name,
      candidateEmail: candidate1.email,
      candidatePhone: candidate1.phone,
      jobTitle: job1.title,
      company: org1.name,
      stage: 'INTERVIEW',
      status: 'INTERVIEW',
      source: 'Website',
      activities: {
        create: [
          {
            actorId: userRecruiter.id,
            actorName: userRecruiter.name,
            type: 'STAGE_CHANGE',
            title: 'Moved to Interview Stage',
            previousStage: 'APPLIED',
            newStage: 'INTERVIEW',
          },
        ],
      },
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
