# Implementation Plan - Social Media Agency SaaS

## 1. Project Overview

We are building a multi-tenant SaaS application for social media agencies to manage client campaigns and automate content ideation using LLMs. The system will streamline the workflow from campaign planning to AI-powered idea generation and client approvals.

### Core Purpose
Digitize and streamline the monthly workflow of social media agencies — from campaign planning to AI-powered idea generation and client approvals.

---

## 2. Architecture & Tech Stack

### Core Components (Microservices Architecture)

- **Frontend Service**: Next.js with TypeScript (App Router) - `apps/web`
  - Consumes APIs from the Backend Service
  - Role-based Dashboards (Platform Admin, Agency, Client)
  - Shadcn/ui + Tailwind CSS
  - TanStack Query for state management

- **Backend Service**: Node.js with TypeScript (Express) - `apps/api`
  - Core Business Logic, Database Access, Auth, Tenant Management
  - Orchestrates calls to the AI Service
  - RESTful API architecture
  - Clean layered architecture (Controllers, Services, Repositories)

- **AI Microservice**: Python (FastAPI) - `apps/ai-service`
  - Specialized wrapper for LLM interactions
  - Prompt Template Management
  - Context assembly and LLM response parsing
  - Uses OpenAI Python SDK, LangChain (optional)

- **Database**: PostgreSQL
  - Multi-tenant schema with strict `tenant_id` isolation
  - Prisma ORM for type-safe database access

- **Auth**: Clerk
  - Multi-tenant SaaS with organizations
  - Role-based access control (RBAC)

### Proposed Stack Details

- **Monorepo Manager**: Turborepo (Efficient build system for microservices)
- **Communication**: HTTP REST (MVP) or Message Queue (Future - RabbitMQ/Redis)
- **ORM**: Prisma (Shared package `packages/database`)
- **Authentication**: Clerk (Multi-tenant SaaS with organizations)
- **Logging**: 
  - Frontend/Backend: omnilogs (Unified logging)
  - AI Service: Python structured logging with Loki integration
- **AI Provider**: OpenAI API (default)
- **Python Package Manager**: uv (faster than pip)

---

## 3. Multi-Tenant Model

### Platform Admin
- Manages multiple agencies (tenants)
- Can view tenants, usage, and system-level data
- System-level configuration

### Agency (Tenant)
- Has multiple clients (brands)
- Each client can have multiple projects (monthly campaigns)
- Agency staff manage campaigns and ideas
- Can edit and approve AI-generated content

### Client (Agency's Customer)
- Has limited access
- Can only view agency-approved ideas
- Can approve or request changes with comments
- Read-only access to generated content

---

## 4. Database Schema (High-Level)

All tenant-specific tables will include a `tenant_id` column for strict isolation.

### Core Entities

- **Tenants** (Agencies)
  - id, name, slug, settings, created_at, updated_at

- **Users** (System Admin, Agency Staff, Client Users)
  - id, email, role (PLATFORM_ADMIN | AGENCY_STAFF | CLIENT), tenant_id
  - clerk_user_id, created_at, updated_at

- **Clients** (The Agency's customers - Brands)
  - id, name, tenant_id, contact_info, created_at, updated_at

- **Projects** (Monthly Campaigns)
  - id, name, client_id, tenant_id, start_date, end_date, status

- **OrganizationProfiles** (Brand Voice, Context)
  - id, client_id, tenant_id, brand_tone, industry, target_audience
  - voice_attributes, created_at, updated_at

- **CampaignPlans** (Monthly Campaign Details)
  - id, project_id, tenant_id, goals, themes, events
  - num_posts, num_reels, post_reel_split_percentage
  - meeting_notes (optional free text)

- **Ideas** (Generated Content - Posts/Reels)
  - id, campaign_plan_id, tenant_id, type (POST | REEL)
  - status (GENERATED | AGENCY_REVIEWED | AGENCY_APPROVED | CLIENT_REVIEWED | CLIENT_APPROVED | REVISION_REQUESTED)
  - content (JSON structure varies by type)
  - rating, created_at, updated_at

- **Comments** (Feedback on ideas)
  - id, idea_id, user_id, tenant_id, comment_text
  - created_at, updated_at

---

## 5. Campaign Input Structure

Agencies will input:

### Structured Fields
- Brand tone/voice
- Industry
- Target audience
- Goals
- Key themes
- Events for the month
- Number of posts
- Number of reels
- Percentage split between posts and reels

### Optional Free Text
- Meeting notes
- Special instructions

---

## 6. AI Output Requirements

### Post Ideas
- Concept
- Caption
- Suggested angle/theme

### Reel Ideas (Detailed Breakdown)
- Hook
- Scene-by-scene structure
- Key talking points or visuals
- CTA (Call to Action)
- Caption

---

## 7. Workflow

1. **Platform admin creates agencies** (or agencies self-register)

2. **Agency creates:**
   - Clients (brands)
   - Monthly projects/campaigns

3. **Agency enters:**
   - Organization profile (long-term brand info)
   - Campaign plan (monthly details)

4. **Agency triggers AI ideation:**
   - Based on structured + optional inputs

5. **System generates:**
   - Post ideas
   - Detailed reel ideas

6. **Agency can:**
   - Edit AI-generated ideas inline
   - Rate ideas
   - Approve selected ideas
   - Regenerate single ideas individually (not whole batch)

7. **Only agency-approved ideas become visible to clients**

8. **Clients can:**
   - Approve ideas
   - Request changes
   - Add comments per idea (threaded or single-level)

9. **Agency revises ideas as needed**

---

## 8. Status Flow

Ideas support the following states:

- `GENERATED` - AI has created the idea
- `AGENCY_REVIEWED` - Agency has reviewed but not yet approved
- `AGENCY_APPROVED` - Agency approved, visible to client
- `CLIENT_REVIEWED` - Client has seen the idea
- `CLIENT_APPROVED` - Client approved the idea
- `REVISION_REQUESTED` - Client requested changes

---

## 9. Implementation Phases

### Phase 1: Foundation & Setup ✅ Turborepo exists

**Current State:**
- ✅ Turborepo initialized with `apps/web` (Next.js), `apps/api` (Express)
- ✅ Docker setup in place
- ✅ Shared packages: logger, ui, typescript-config

**Phase 1 Complete Plan:**

#### 1. Database Infrastructure
- [ ] Add PostgreSQL container to `docker-compose.yml`
- [ ] Create `packages/database` workspace package
- [ ] Install and configure Prisma ORM
- [ ] Define initial schema:
  - `Tenant` table (agencies)
  - `User` table (with role: `PLATFORM_ADMIN` | `AGENCY_STAFF` | `CLIENT`)
  - `Client` table (agencies' customers - brands)
  - Foreign keys with `tenant_id` on all tenant-scoped tables
- [ ] Generate Prisma client
- [ ] Run initial migration

#### 2. Logging Package
- [ ] Replace `packages/logger` with **omnilogs** integration
- [ ] Configure for all services (web, api)

#### 3. AI Service Scaffold (Python - Minimal, no LLM logic)
- [ ] Create `apps/ai-service` folder structure (Python/FastAPI)
- [ ] Set up `pyproject.toml` with **uv** package manager
- [ ] Python 3.13 with FastAPI + uvicorn
- [ ] Basic FastAPI server with lifespan management
- [ ] Health check endpoint (`GET /health`)
- [ ] Structured logger (console-only for Phase 1)
- [ ] Request logging middleware
- [ ] Config module for environment variables
- [ ] Add to `docker-compose.yml` (Python 3.13 Docker image)
- [ ] Create `package.json` for Turbo integration

#### 4. Authentication (Clerk)
- [ ] Install Clerk in `apps/web`
- [ ] Set up Clerk provider and sign-in/sign-up pages
- [ ] Configure protected routes
- [ ] Add Clerk JWT validation in `apps/api`
- [ ] Extract user metadata (userId, tenantId, role)

#### 5. Multi-Tenant Middleware (Express API)
- [ ] Create Express middleware to:
  - Validate incoming requests have valid tenant context
  - Inject `tenant_id` into request object
  - Block cross-tenant access attempts
- [ ] Add to all API routes

#### 6. Database Seed
- [ ] Script to create initial Platform Admin user
- [ ] Test data: 1 agency tenant, 1 agency user, 1 client

**End Goal:** All 3 services running, users can authenticate, and database enforces tenant isolation.

---

### Phase 2: Core Entities & Management

- [ ] **Agency Dashboard**: Client management (CRUD)
  - Create, read, update, delete clients (brands)
  - List all clients for the agency
  
- [ ] **Agency Dashboard**: Project/Campaign management
  - Create new monthly campaigns
  - Associate campaigns with clients
  - Set campaign duration
  
- [ ] **Organization Profile**: Store structured brand data
  - Brand tone/voice
  - Industry
  - Target audience
  - Voice attributes
  
- [ ] **Campaign Input Form**: Structured inputs for AI generation
  - Goals, themes, events
  - Number of posts and reels
  - Post/reel split percentage
  - Optional meeting notes

---

### Phase 3: AI Ideation Engine

**AI Microservice Architecture (`apps/ai-service` - Python):**

- [ ] **Service Setup**: FastAPI server with REST endpoints

- [ ] **Prompt Management System**:
  - Load prompt templates (versioned, stored in files or DB)
  - Separate templates for Posts vs Reels
  - Jinja2 template variables for brand context injection

- [ ] **Context Builder**:
  - Fetch Organization Profile from Backend API
  - Fetch Campaign Plan from Backend API
  - Assemble structured context for LLM

- [ ] **LLM Integration**:
  - OpenAI Python SDK or LangChain
  - Retry logic with tenacity library
  - Rate limiting and error handling
  - Token counting and cost tracking

- [ ] **Response Parser**:
  - Parse structured JSON output from LLM
  - Pydantic models for validation
  - Post schema: `{ concept, caption, theme }`
  - Reel schema: `{ hook, scenes[], talking_points[], cta, caption }`

- [ ] **Batch Generation Endpoint**:
  - `POST /generate` - Accept campaign_id, return batch of ideas
  - Generate N posts and M reels based on campaign input
  - Return ideas to Backend API to store with status `GENERATED`

- [ ] **Single Regeneration Endpoint**:
  - `POST /regenerate/{idea_id}` - Regenerate one specific idea
  - Preserve original context but generate fresh content

---

### Phase 4: Review & Approval Workflow

- [ ] **Agency View**: Edit, Regenerate (Single), Approve ideas
  - Display all generated ideas for a campaign
  - Inline editing capability
  - Single-idea regeneration button
  - Approve/reject actions
  - Rating system

- [ ] **Client View**: Read-only access to `AGENCY_APPROVED` ideas
  - Filter to show only approved ideas
  - Clean, professional presentation

- [ ] **Client Actions**: Approve or Request Changes (with Comments)
  - Approve button
  - Request revision button with comment field
  - Comment threading on ideas

- [ ] **Status Transitions**: Implement state machine for Idea statuses
  - Define valid state transitions
  - Enforce business rules (e.g., clients can't see non-approved ideas)
  - Audit trail of status changes

---

### Phase 5: Polish & Security

- [ ] Implement comprehensive Role guards (Admin vs Agency vs Client)
  - Route-level protection
  - Component-level visibility control
  - API endpoint authorization

- [ ] UI/UX Polish (Dashboards, Loading states)
  - Skeleton loaders
  - Toast notifications
  - Error boundaries
  - Responsive design

- [ ] Error Handling & Logging
  - Centralized error handling in backend
  - User-friendly error messages in frontend
  - Comprehensive logging with omnilogs
  - Error monitoring setup (Sentry optional)

---

## 10. Multi-Tenant Safety

**Critical Requirements:**
- Every entity must be scoped by `tenant_id`
- Ensure no cross-tenant data leakage
- Middleware or service-layer tenant enforcement
- Database queries must always filter by `tenant_id`
- Prisma middleware for automatic tenant scoping

---

## 11. Non-Goals for MVP

- ❌ No image or video generation
- ❌ No social media scheduling or posting
- ❌ No billing system initially
- ❌ No analytics dashboard
- ❌ No usage quotas

**(But architecture should allow adding these later)**

---

## 12. Code Quality Expectations

- Strong separation of concerns
- Reusable services
- Clear folder structure
- Validation layer (Zod for TS, Pydantic for Python)
- Centralized error handling
- Logging throughout the stack
- Auth middleware
- Scalable design patterns
- Type safety (TypeScript + Prisma)
- API documentation (Swagger/OpenAPI for FastAPI)

---

## 13. MVP Deliverables

- ✅ Database schema (multi-tenant safe)
- ✅ Auth & role model
- ✅ API structure
- ✅ Core workflows (campaign → AI generation → approval)
- ✅ LLM integration strategy
- ✅ Frontend page layout and navigation
- ✅ Status flow implementation
- ✅ Docker-based development environment

---

## 14. Long-Term Ready Design

System should be designed so future features can be plugged in easily:

- Media generation (images/videos for posts)
- Content calendar
- Social media scheduling
- Billing and subscription management
- Analytics and reporting
- Usage quotas and rate limiting
- Webhook integrations
- Third-party app marketplace

---

## 15. Development Guidelines

### Folder Structure (Backend)
```
apps/api/src/
├── controllers/       # HTTP request handlers
├── services/          # Business logic
├── repositories/      # Database access layer
├── middleware/        # Auth, tenant isolation, logging
├── models/            # Domain models and types
├── utils/             # Helper functions
└── index.ts          # Entry point
```

### Folder Structure (Frontend)
```
apps/web/src/
├── app/              # Next.js App Router
│   ├── (admin)/     # Admin routes
│   ├── (agency)/    # Agency routes
│   ├── (client)/    # Client routes
│   └── api/         # API routes (if needed)
├── components/       # Reusable components
├── lib/             # Utilities, API clients
└── types/           # TypeScript types
```

### Folder Structure (AI Service)
```
apps/ai-service/src/
├── main.py           # FastAPI app entry
├── config/           # Configuration
├── routes/           # API routes
├── services/         # Business logic (LLM, prompts)
├── models/           # Pydantic models
├── middleware/       # Request logging
└── logger/           # Logging setup
```

---

## 16. Next Steps

1. ✅ Complete Phase 1 implementation
2. Begin Phase 2 (Core entities)
3. Integrate AI service in Phase 3
4. Build approval workflows in Phase 4
5. Polish and deploy MVP in Phase 5

---

**Last Updated:** February 1, 2026
**Status:** Planning Complete - Ready for Phase 1 Implementation
