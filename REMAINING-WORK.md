# Complete Project Roadmap - What's Left to Build

**Current Status:** Phase 2 Backend 100% Complete | Overall Project: 15% Complete  
**Date:** 2026-02-07

---

## 🎯 Project Overview

You're building a **B2B SaaS for Social Media Agencies** with:
- 🏢 Multi-tenant architecture (agencies = tenants)
- 👥 Role-based access (OWNER/ADMIN/TEAM/CLIENT)
- 🤖 LLM-powered content ideation
- ✅ Approval workflows (agency → client → approval)

**Tech Stack:** Next.js 14 (Frontend) | Express + TypeScript (Backend) | FastAPI + Python (AI Service) | PostgreSQL (Database)

---

## 📊 Completion Status by Phase

| Phase | Component | Status | % |
|-------|-----------|--------|-----|
| **1** | Foundation & Auth | ✅ Complete | 100% |
| **2** | Onboarding & Invites | 🟨 Backend Done, Frontend Pending | 50% |
| **3** | AI Ideation Engine | 🔴 Not Started | 0% |
| **4** | Approval Workflows | 🔴 Not Started | 0% |
| **5** | Polish & Security | 🔴 Not Started | 0% |
| **Overall** | — | 🟨 | **15%** |

---

## ✅ PHASE 1: Foundation & Setup (COMPLETE)

**What's done:**
- ✅ Turborepo monorepo setup
- ✅ Clerk authentication
- ✅ PostgreSQL database with Prisma
- ✅ Multi-tenant middleware
- ✅ Docker environment
- ✅ Base schema (Tenant, User, roles)

---

## 🟨 PHASE 2: Onboarding & Invites (50% COMPLETE)

### ✅ Backend Complete (100%)

**What's done:**
- ✅ Invite-only onboarding system
- ✅ Hashed token generation & validation (HMAC-SHA256)
- ✅ 7-day token expiration
- ✅ Email-based invitations
- ✅ Role-based access control
- ✅ TenantMember & ProjectMembership models
- ✅ 4 API endpoints (create agency, get agency, create invite, accept invite)
- ✅ Clerk auth middleware with user upsert
- ✅ Complete documentation

**Files Created/Modified:**
- 12 new backend files (repositories, services, controllers, routes)
- 3 modified files (schema, auth middleware, server)

### ⏳ Remaining Work (50%)

#### 1. Database Migration (1-2 hours)
```bash
docker-compose up -d postgres
cd packages/database && pnpm prisma migrate dev
```
- Run Prisma migration to create actual tables in PostgreSQL
- Verify schema created correctly

#### 2. Frontend Onboarding Screens (3-5 days)

**Screens to Build:**

a) **Post-Login Flow** (Next.js)
- Landing page after Clerk sign-in
- Two options: "Create Agency" or "Wait for Invite"
- TanStack Query hooks for API calls

b) **Create Agency Modal**
- Form: name + slug
- Submit → `POST /api/agencies`
- Redirect to dashboard
- Loading states & error handling

c) **Accept Invite Flow**
- Extract token from URL (`?token=...`)
- Confirm dialog: "Join as [ROLE]?"
- Submit → `POST /api/invitations/accept`
- Redirect to dashboard

d) **Agency Dashboard**
- List clients/projects (large tiles)
- Show user role + agency name
- Quick navigation

e) **Invite User Modal** (OWNER/ADMIN only)
- Email input + role selector
- Submit → `POST /api/invitations`
- Success toast
- Copy invite link to clipboard

#### 3. Email Integration (1-2 days)
- Choose provider: SendGrid or AWS SES
- Create email template with invite link
- Replace console logging in invitation.service.ts
- Test end-to-end with real email

#### 4. Integration Tests (1-2 days)
- Supertest for all 4 endpoints
- Test error cases (invalid token, expired, wrong email, etc.)
- Test multi-tenant isolation
- Test role guards

**Estimated Time:** 7-9 days

---

## 🔴 PHASE 3: AI Ideation Engine (NOT STARTED)

### Goal
Generate AI-powered content ideas (posts/reels) based on brand context and campaign details.

### Components to Build

#### 1. AI Service Scaffold (Python/FastAPI) (1 day)
- Create `apps/ai-service` structure
- FastAPI server with basic endpoints
- Configuration management
- Logging setup
- Health check endpoint

#### 2. Prompt Management System (1-2 days)
- Store prompt templates (for posts vs reels)
- Use Jinja2 for template variables
- Version control prompts
- Load from files or database

#### 3. Context Builder (1 day)
- Fetch Organization Profile from Backend API
- Fetch Campaign Plan from Backend API
- Assemble context JSON for LLM

#### 4. LLM Integration (2-3 days)
- OpenAI Python SDK setup
- Retry logic with exponential backoff
- Token counting & cost tracking
- Error handling for API failures
- Rate limiting

#### 5. Response Parser (1 day)
- Parse JSON output from LLM
- Pydantic models for validation
- Validate Posts: `{concept, caption, theme}`
- Validate Reels: `{hook, scenes, talking_points, cta, caption}`

#### 6. Generation Endpoints (1 day)

a) **Batch Generation**
```
POST /api/ai/generate
{
  "campaign_id": "camp_123",
  "num_posts": 5,
  "num_reels": 3
}
Response: [... generated ideas ...]
```

b) **Single Regeneration**
```
POST /api/ai/regenerate/{idea_id}
Response: [new generated idea]
```

#### 7. Backend Integration (1-2 days)
- Add endpoints in `apps/api` to call AI service
- Store generated ideas with status `GENERATED`
- Save token usage for cost tracking
- Error handling if AI service fails

**Estimated Time:** 8-11 days

**Deliverables:**
- `/api/ideas/generate` endpoint (POST)
- `/api/ideas/{id}/regenerate` endpoint (POST)
- Batch generation in AI service
- Ideas stored with proper status tracking

---

## 🔴 PHASE 4: Approval & Review Workflows (NOT STARTED)

### Goal
Implement multi-step approval workflow: Agency reviews → Agency approves → Client reviews → Client approves.

### Status Flow
```
GENERATED (AI created)
   ↓
AGENCY_REVIEWED (agency looked at it)
   ↓
AGENCY_APPROVED (agency approved - now visible to client)
   ↓
CLIENT_REVIEWED (client looked at it)
   ↓ (approve branch)     ↓ (revise branch)
CLIENT_APPROVED    REVISION_REQUESTED → (back to agency)
```

### Components to Build

#### 1. Agency Review Screen (2-3 days)
- List all generated ideas for a campaign
- Edit ideas inline (text changes)
- Inline rating system (1-5 stars)
- Approve/Reject buttons
- Regenerate single idea button
- Bulk approve button

#### 2. Agency Approval Endpoint (1 day)
```
PATCH /api/ideas/{id}
{
  "status": "AGENCY_APPROVED",
  "rating": 4
}
```

#### 3. Client Dashboard (2-3 days)
- List only `AGENCY_APPROVED` ideas (read-only)
- Filter by campaign
- Clean, professional layout
- Idea detail view

#### 4. Client Actions (2 days)
- Approve button → `PATCH /api/ideas/{id}` with status `CLIENT_APPROVED`
- Request revision button → `PATCH /api/ideas/{id}` with status `REVISION_REQUESTED` + comment
- Comment thread on each idea

#### 5. Comments System (1-2 days)
- Add comment endpoint: `POST /api/comments`
- Get comments endpoint: `GET /api/ideas/{id}/comments`
- Thread structure (nested or flat)
- Mentioned users notifications (future)

#### 6. Agency Revision Handling (1 day)
- Filter ideas with `REVISION_REQUESTED` status
- Show client comments/feedback
- Re-edit or regenerate idea
- Change status back to `AGENCY_APPROVED` when done

#### 7. Status Validation (1 day)
- Implement state machine for status transitions
- Validate: only OWNER/ADMIN can approve/reject
- Validate: only CLIENT role can approve on client side
- Audit trail of status changes

**Estimated Time:** 10-14 days

**Deliverables:**
- Agency review & approval UI
- Client review & approval UI
- Comment system
- Status transition endpoints
- Revision request handling

---

## 🔴 PHASE 5: Polish & Security (NOT STARTED)

### 1. Role Guards & Authorization (2-3 days)
- Route-level protection (middleware)
- Component-level visibility (React)
- API endpoint authorization checks
- Test OWNER vs ADMIN vs TEAM vs CLIENT flows

### 2. UI/UX Polish (3-4 days)
- Skeleton loaders for all data-fetching states
- Toast notifications (success, error, warning)
- Error boundaries for crash prevention
- Responsive design for mobile/tablet
- Accessibility (ARIA labels, keyboard navigation)
- Loading spinners
- Empty states

### 3. Error Handling & Logging (2-3 days)
- Centralized error handling in backend
- User-friendly error messages in frontend
- Comprehensive logging with omnilogs
- Error monitoring (Sentry optional)
- Retry logic for failed requests

### 4. Dashboard Analytics (1-2 days)
- Total ideas generated
- Approval rates
- Time to approval
- Agency performance metrics

### 5. Performance Optimization (1-2 days)
- Database query optimization
- Pagination for large lists
- Caching strategy (React Query)
- Code splitting in Next.js
- Image optimization

### 6. Security Review (2-3 days)
- Multi-tenant leak testing
- SQL injection prevention (Prisma helps)
- XSS prevention
- CSRF protection
- Rate limiting on API endpoints
- Input validation (Zod + Pydantic)

### 7. Documentation & Deployment (2-3 days)
- API documentation (Swagger)
- Deployment guide (Docker/K8s)
- Environment setup guide
- Database migration guide

**Estimated Time:** 13-18 days

---

## 📈 Complete Timeline Estimate

| Phase | Component | Duration | Total |
|-------|-----------|----------|-------|
| **1** | Foundation | (Complete) | — |
| **2** | Frontend, Email, Tests | 7-9 days | 7-9 days |
| **3** | AI Service | 8-11 days | 15-20 days |
| **4** | Workflows & Comments | 10-14 days | 25-34 days |
| **5** | Polish & Security | 13-18 days | 38-52 days |
| — | **Total Remaining** | — | **38-52 days** (~2 months) |

**Breakdown by discipline:**
- Backend: 15-20 days (AI service + workflows)
- Frontend: 25-35 days (onboarding + review screens + polish)
- Database: 2-3 days (migrations + optimization)
- DevOps/Security: 5-8 days (testing + deployment)

---

## 🔄 Dependency Chain

```
Phase 2 Frontend ← (blocked by) Database Migration
     ↓
Phase 2 Tests ← (depends on) Phase 2 Frontend Complete
     ↓
Phase 3 AI Service ← (depends on) Backend API ready (Phase 2 done)
     ↓
Phase 3 Integration ← (depends on) AI Service + Backend API
     ↓
Phase 4 Review UI ← (depends on) Phase 3 Complete
     ↓
Phase 4 Workflows ← (depends on) Phase 4 Review UI
     ↓
Phase 5 Polish ← (depends on) All previous phases
```

---

## 🎯 What's Blocking Next Steps

| Blocker | Solution | Time |
|---------|----------|------|
| Database not running | `docker-compose up -d postgres` | 5 min |
| Schema not migrated | `pnpm prisma migrate dev` | 10 min |
| Frontend not started | Build onboarding screens | 3-5 days |
| AI service not scaffolded | Create FastAPI app | 1 day |

---

## 🚀 Recommended Next Action

**Priority 1 (Today):** Database Migration
```bash
docker-compose up -d postgres
cd packages/database && pnpm prisma migrate dev
pnpm prisma studio  # Verify schema
```

**Priority 2 (This week):** Phase 2 Frontend
- Create post-login flow
- Build create agency modal
- Build accept invite flow
- Build agency dashboard

**Priority 3 (Next week):** Email Integration
- Set up SendGrid/SES
- Create email template
- Test end-to-end

**Priority 4 (Week after):** Integration Tests
- Write Supertest tests
- Test multi-tenant isolation
- Test error cases

---

## 📊 Deliverables Remaining

### By End of Phase 2
- ✅ Secure invite-only onboarding
- ✅ Email-based user joining
- ✅ Role hierarchy working
- ✅ Agency dashboard
- ✅ Integration tests

### By End of Phase 3
- ✅ AI service generating ideas
- ✅ Ideas stored with proper status
- ✅ Token usage tracking

### By End of Phase 4
- ✅ Agency review & approval workflow
- ✅ Client review & approval workflow
- ✅ Comment system
- ✅ Revision request handling

### By End of Phase 5
- ✅ Production-ready UI
- ✅ Comprehensive error handling
- ✅ Security audit passed
- ✅ Deployment documentation

---

## 🔐 Critical Requirements (All Phases)

Must enforce in **every** phase:

1. **Multi-Tenant Isolation**
   - All queries filtered by `tenant_id`
   - Test: user from tenant A cannot see tenant B data

2. **Role-Based Access**
   - OWNER: Full access
   - ADMIN: Full access + can't delete OWNER
   - TEAM: Only assigned clients/projects
   - CLIENT: Only their project

3. **Email-Based Joining**
   - No guessable IDs or public codes
   - Token-based with expiration
   - Email address must match

4. **Audit Trail**
   - Log all status changes
   - Log role changes
   - Log approval/rejection

---

## 🛠️ Current Codebase Health

**Strengths:**
- ✅ Type-safe (TypeScript + Prisma)
- ✅ Well-structured (Controllers → Services → Repositories)
- ✅ Multi-tenant ready (tenant_id filtering everywhere)
- ✅ Secure tokens (HMAC-SHA256 hashing)
- ✅ Good documentation

**Weaknesses:**
- ❌ Database not migrated yet
- ❌ Frontend not started
- ❌ AI service scaffold only
- ❌ No tests yet
- ❌ Email not integrated

---

## 📚 Files to Work On

### Immediate (Phase 2)
- Frontend: `apps/web/src/app/(agency)/` (create new routes)
- Email: `apps/api/src/services/invitation.service.ts` (add email sending)
- Tests: `apps/api/src/__tests__/` (create test files)

### Next (Phase 3)
- AI Service: `apps/ai-service/main.py`
- Backend: `apps/api/src/services/idea.service.ts` (call AI service)
- Backend: `apps/api/src/controllers/idea.controller.ts`

### Later (Phase 4)
- Frontend: `apps/web/src/app/(agency)/campaigns/`
- Frontend: `apps/web/src/app/(client)/` (client dashboard)
- Backend: `apps/api/src/services/comment.service.ts`

---

## ✅ Definition of "Done"

**Phase 2:** All onboarding complete (new users can create/join agency)  
**Phase 3:** AI can generate ideas (backend can generate 100 ideas without errors)  
**Phase 4:** Workflows functional (ideas flow through full approval chain)  
**Phase 5:** Production ready (passes security audit + all features polished)

---

## 💡 Quick Start

1. **Read docs:**
   - `PHASE2-STATUS.md` (technical details)
   - `PLAN.md` (project roadmap)
   - Session docs (detailed implementation)

2. **Run database:**
   ```bash
   docker-compose up -d postgres
   cd packages/database && pnpm prisma migrate dev
   ```

3. **Start frontend development:**
   ```bash
   cd apps/web && pnpm dev
   ```

4. **Test backend:**
   ```bash
   cd apps/api && pnpm dev
   # See PHASE2-STATUS.md for API examples
   ```

---

## 🤝 Team Coordination

**Current Focus:** Phase 2 Frontend (pick this up next)  
**Quick Wins:** Database migration (30 min)  
**High Priority:** Onboarding screens (3-5 days)  
**Bottleneck:** Email integration (needs SendGrid/SES account)

---

**Last Updated:** 2026-02-07  
**Project Phase:** Phase 2/5 (30% through)  
**Overall Status:** 🟨 On Track (Backend solid, Frontend starting)
