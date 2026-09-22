# HirebridgeHR — Frontend Web Application

A modern, high-fidelity Multi-Tenant SaaS Applicant Tracking System (ATS), Job Distribution Engine, and Candidate Career Portal built with **React 18**, **Vite**, **Tailwind CSS**, and an enterprise **Liquid Glass Design System**.

---

## Key Features

- **Full Multi-Tenant ATS**:
  - Requisition & Job Management (Draft, Approval Pipeline, Distribution)
  - Candidate Relationship Management & Pipeline Tracking (Kanban board & list views)
  - Interview Scheduling & Feedback Management
  - Advanced Analytics & Hiring Reports
  - Multi-tenant Role-Based Access Control (RBAC)
- **Candidate Career Portal**:
  - Dedicated Candidate Login & Signup
  - Job Search, Filtering, and One-Click Applications
  - Saved Jobs & Application Tracking Dashboard
  - Candidate Profile Management (Skills, Experience, Education)
- **Super-Admin Platform Operations**:
  - Organization & Workspace Management
  - Job Publication Queue & Cross-Tenant Oversight
  - Platform Audit Logging & System Telemetry
- **Public Careers & Job Pages**:
  - SEO-friendly public job details & branded company career pages
  - Liquid Glass Multi-Step Application Modal with Resume Upload
- **Liquid Glass Design System**:
  - Figma-fidelity mesh canvas & frosted glassmorphism
  - Instant Light/Dark mode toggling with adaptive typography
  - Micro-animations, responsive data tables, and skeleton loaders

---

## Tech Stack

- **Core**: React 18, Vite 6, React Router DOM v6
- **State & Data**: TanStack React Query v5, Context API
- **Styling**: Tailwind CSS v3, PostCSS, Custom Liquid Glass Engine
- **Icons & Graphics**: Lucide React, Recharts
- **Forms & Validation**: React Hook Form, Zod

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_URL=
VITE_APP_URL=http://localhost:3000
VITE_ENV=development
VITE_USE_MOCK=true
```
> **Note**: When `VITE_USE_MOCK=true` (or `VITE_API_URL` is blank), the app runs in full standalone mock mode with local storage persistence and simulated network delay. Set `VITE_USE_MOCK=false` and point `VITE_API_URL` to your backend server when ready.

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## Demo & Testing Credentials (Mock Mode)

In mock mode, you can quickly switch roles or sign in with any of the following accounts (password: `password123`):

| Role | Name | Email | Description |
| :--- | :--- | :--- | :--- |
| **Owner** | Sarah Connor | `sarah.connor@apextech.com` | Full tenant control, settings & billing |
| **Admin** | Marcus Vance | `marcus.vance@apextech.com` | Org user management & job approvals |
| **Recruiter** | Elena Rostova | `elena.rostova@apextech.com` | Job posting, candidate pipeline & interviews |
| **Hiring Manager** | David Chen | `david.chen@apextech.com` | Candidate reviews & feedback |
| **Super Admin** | Alex Mercer | `alex.mercer@hirebridge.internal` | Platform operations & publication queue |
| **Candidate** | Alex Rivera | `alex.candidate@example.com` | Candidate career portal & applications |

---

## Project Structure

```
frontend/
├── public/                 # Static assets (favicons, manifests)
├── src/
│   ├── components/         # Reusable UI library (Button, Modal, Card, etc.)
│   ├── context/            # Global context (Auth, Theme, Toast)
│   ├── hooks/              # Custom React Query & entity hooks
│   ├── layouts/            # AppLayout, AdminLayout, CandidateLayout, MarketingLayout
│   ├── pages/              # Pages categorized by domain (jobs, candidates, candidate, admin, etc.)
│   ├── routes/             # AppRoutes and route protection guards
│   ├── services/           # API client, HTTP services, and mock database
│   ├── styles/             # Modular CSS architecture (globals, liquid-glass, layout, components)
│   ├── utils/              # Helper utilities (cn, formatting)
│   ├── App.js              # Providers and application root
│   └── main.js             # Vite entrypoint
├── index.html              # Vite HTML template
├── package.json
├── tailwind.config.js
└── vite.config.js
```
