import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MarketingLayout } from '../layouts/MarketingLayout.js';
import { AuthLayout } from '../layouts/AuthLayout.js';
import { AppLayout } from '../layouts/AppLayout.js';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { CandidateLayout } from '../layouts/CandidateLayout.js';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute.js';
import { RoleProtectedRoute } from './RoleProtectedRoute.js';
import { CandidateProtectedRoute } from './CandidateProtectedRoute.js';

// Marketing Pages
import { HomePage } from '../pages/marketing/HomePage.js';
import { FeaturesPage } from '../pages/marketing/FeaturesPage.js';
import { PricingPage } from '../pages/marketing/PricingPage.js';
import { AboutPage } from '../pages/marketing/AboutPage.js';
import { ContactPage } from '../pages/marketing/ContactPage.js';

// Auth Pages
import { SignInPage } from '../pages/auth/SignInPage.js';
import { SignUpPage } from '../pages/auth/SignUpPage.js';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.js';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage.js';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage.js';

// Candidate Auth & Portal Pages
import { CandidateLoginPage } from '../pages/candidate/CandidateLoginPage.js';
import { CandidateSignUpPage } from '../pages/candidate/CandidateSignUpPage.js';
import { CandidateForgotPasswordPage } from '../pages/candidate/CandidateForgotPasswordPage.js';
import { CandidateResetPasswordPage } from '../pages/candidate/CandidateResetPasswordPage.js';
import { CandidateDashboardPage } from '../pages/candidate/CandidateDashboardPage.js';
import { CandidateJobsPage } from '../pages/candidate/CandidateJobsPage.js';
import { CandidateJobDetailsPage } from '../pages/candidate/CandidateJobDetailsPage.js';
import { CandidateSavedJobsPage } from '../pages/candidate/CandidateSavedJobsPage.js';
import { CandidateApplicationsPage } from '../pages/candidate/CandidateApplicationsPage.js';
import { CandidateProfilePage } from '../pages/candidate/CandidateProfilePage.js';
import { CandidateNotificationsPage } from '../pages/candidate/CandidateNotificationsPage.js';
import { CandidateSettingsPage } from '../pages/candidate/CandidateSettingsPage.js';

// Onboarding
import { OnboardingPage } from '../pages/onboarding/OnboardingPage.js';

// Customer ATS Pages
import { DashboardPage } from '../pages/dashboard/DashboardPage.js';
import { JobListPage } from '../pages/jobs/JobListPage.js';
import { CreateJobPage } from '../pages/jobs/CreateJobPage.js';
import { JobDetailsPage } from '../pages/jobs/JobDetailsPage.js';
import { EditJobPage } from '../pages/jobs/EditJobPage.js';
import { CandidateListPage } from '../pages/candidates/CandidateListPage.js';
import { CandidateDetailsPage } from '../pages/candidates/CandidateDetailsPage.js';
import { ApplicationsListPage } from '../pages/applications/ApplicationsListPage.js';
import { PipelinePage } from '../pages/applications/PipelinePage.js';
import { InterviewsListPage } from '../pages/interviews/InterviewsListPage.js';
import { NotificationsPage } from '../pages/notifications/NotificationsPage.js';
import { ReportsPage } from '../pages/reports/ReportsPage.js';
import { SettingsPage } from '../pages/settings/SettingsPage.js';

// Super Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage.js';
import { PublicationQueuePage } from '../pages/admin/PublicationQueuePage.js';
import { AdminOrgsPage } from '../pages/admin/AdminOrgsPage.js';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage.js';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage.js';

// Public Applicant Pages
import { PublicJobPage } from '../pages/public/PublicJobPage.js';
import { CompanyCareersPage } from '../pages/public/CompanyCareersPage.js';

// 404
import { NotFoundPage } from '../pages/NotFoundPage.js';

export function AppRoutes() {
  return (
    <Routes>
      {/* Marketing Website Routes */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/solutions" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<FeaturesPage />} />
        <Route path="/job-distribution" element={<FeaturesPage />} />
        <Route path="/ai-recruiting" element={<FeaturesPage />} />
        <Route path="/security" element={<FeaturesPage />} />
        <Route path="/privacy" element={<FeaturesPage />} />
        <Route path="/terms" element={<FeaturesPage />} />
      </Route>

      {/* Public Applicant Job Routes */}
      <Route path="/jobs/:slug" element={<PublicJobPage />} />
      <Route path="/careers/:companySlug" element={<CompanyCareersPage />} />

      {/* Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Candidate Authentication Routes */}
        <Route path="/candidate/login" element={<CandidateLoginPage />} />
        <Route path="/candidate/signup" element={<CandidateSignUpPage />} />
        <Route path="/candidate/forgot-password" element={<CandidateForgotPasswordPage />} />
        <Route path="/candidate/reset-password" element={<CandidateResetPasswordPage />} />
      </Route>

      {/* Onboarding Wizard */}
      <Route
        path="/onboarding/*"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Authenticated Customer ATS Application */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Jobs */}
        <Route path="/jobs" element={<JobListPage />} />
        <Route path="/jobs/new" element={<CreateJobPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/jobs/:id/edit" element={<EditJobPage />} />
        <Route path="/jobs/:id/applications" element={<JobDetailsPage />} />
        <Route path="/jobs/:id/distribution" element={<JobDetailsPage />} />

        {/* Candidates */}
        <Route path="/candidates" element={<CandidateListPage />} />
        <Route path="/candidates/:id" element={<CandidateDetailsPage />} />

        {/* Applications & Pipeline */}
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route path="/applications/pipeline" element={<PipelinePage />} />
        <Route path="/applications/:id" element={<CandidateDetailsPage />} />

        {/* Interviews */}
        <Route path="/interviews" element={<InterviewsListPage />} />
        <Route path="/interviews/:id" element={<InterviewsListPage />} />

        {/* Reports & Notifications */}
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/*" element={<SettingsPage />} />
      </Route>

      {/* Super-Admin Platform Operations */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['OWNER', 'ADMIN', 'SUPER_ADMIN']}>
              <AdminLayout />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="organizations" element={<AdminOrgsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="job-publications" element={<PublicationQueuePage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Candidate Career Portal Application */}
      <Route
        path="/candidate"
        element={
          <CandidateProtectedRoute>
            <CandidateLayout />
          </CandidateProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboardPage />} />
        <Route path="jobs" element={<CandidateJobsPage />} />
        <Route path="jobs/:jobId" element={<CandidateJobDetailsPage />} />
        <Route path="saved-jobs" element={<CandidateSavedJobsPage />} />
        <Route path="applications" element={<CandidateApplicationsPage />} />
        <Route path="applications/:id" element={<CandidateApplicationsPage />} />
        <Route path="profile" element={<CandidateProfilePage />} />
        <Route path="notifications" element={<CandidateNotificationsPage />} />
        <Route path="settings" element={<CandidateSettingsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
