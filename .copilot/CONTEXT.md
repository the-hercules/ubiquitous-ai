# Repository Context - Quick Reference for LLMs

> **Start here!** This file provides a comprehensive overview for AI assistants working with this codebase.

## Project Identity

**Name:** Social Media Agency SaaS Platform  
**Repository:** ubiquitous-ai  
**Type:** Multi-tenant SaaS Application  
**Purpose:** Streamline social media campaign management and AI-powered content ideation for agencies

## Tech Stack at a Glance

| Layer | Technology | Location |
|-------|-----------|----------|
| Frontend | Next.js 14 + TypeScript | `apps/web` |
| Backend API | Express + TypeScript | `apps/api` |
| AI Service | Python 3.13 + FastAPI | `apps/ai-service` |
| Database | PostgreSQL + Prisma | `packages/database` |
| Auth | Clerk | Integrated in web/api |
| Monorepo | Turborepo + pnpm | Root |
| Logging | omnilogs (TS), structlog (Python) | All services |

## Architecture Pattern

**Microservices Architecture** with 3 main services:

1. **Frontend (apps/web)** - User interface, role-based dashboards
2. **Backend API (apps/api)** - Business logic, database access, tenant management
3. **AI Service (apps/ai-service)** - LLM integration, prompt management

Communication: HTTP REST (MVP), designed for future message queue integration.

## Multi-Tenancy Model

**Three User Roles:**

1. **Platform Admin** - Manages agencies, system-level access
2. **Agency Staff** - Manages clients, campaigns, reviews AI content
3. **Client** - Views approved content, provides feedback

**Tenant Isolation:** Every database table includes `tenant_id` for strict data isolation.

## Core Entities

```
Tenant (Agency)
  ├── Users (Agency Staff)
  ├── Clients (Brands)
  │   ├── OrganizationProfile (Brand voice/context)
  │   └── Projects (Monthly Campaigns)
  │       └── CampaignPlans
  │           └── Ideas (Posts/Reels)
  │               └── Comments (Feedback)
```

## Key Workflows

### 1. Campaign Creation
Agency → Create Client → Create Project → Create Campaign Plan → Input brand context & campaign details

### 2. AI Content Generation
Campaign Plan → AI Service → Generate N posts + M reels → Store with status `GENERATED`

### 3. Agency Review
Agency views ideas → Edit inline → Rate → Approve → Status: `AGENCY_APPROVED`

### 4. Client Approval
Client views approved ideas → Approve OR Request changes with comments

### 5. Regeneration
Agency can regenerate individual ideas (not batch) while preserving context

## Status Flow for Ideas

```
GENERATED → AGENCY_REVIEWED → AGENCY_APPROVED → CLIENT_REVIEWED → CLIENT_APPROVED
                                    ↓
                              REVISION_REQUESTED (Client feedback)
```

## AI Output Structures

### Post Idea
```json
{
  "concept": "Brief description of post concept",
  "caption": "Full caption text",
  "theme": "Theme or angle"
}
```

### Reel Idea
```json
{
  "hook": "Opening hook text",
  "scenes": ["Scene 1 description", "Scene 2 description"],
  "talking_points": ["Key point 1", "Key point 2"],
  "cta": "Call to action",
  "caption": "Caption for the reel"
}
```

## Project Structure

```
ubiquitous-ai/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # Express backend
│   └── ai-service/       # Python FastAPI (Phase 1: scaffold only)
├── packages/
│   ├── database/         # Prisma schema + client
│   ├── ui/               # Shared React components
│   ├── logger/           # omnilogs integration
│   └── typescript-config/
├── PLAN.md               # Implementation roadmap
├── docker-compose.yml    # Local dev environment
└── .copilot/            # This documentation system
```

## Current Implementation Status

**Phase 1: Foundation & Setup** (In Progress)
- ✅ Turborepo initialized
- ⏳ Database setup (PostgreSQL + Prisma)
- ⏳ AI service scaffold (Python/FastAPI)
- ⏳ Authentication (Clerk)
- ⏳ Multi-tenant middleware
- ⏳ Database seed script

See `PLAN.md` for complete roadmap.

## Important Files

| File | Purpose |
|------|---------|
| `PLAN.md` | Complete implementation plan and roadmap |
| `docker-compose.yml` | Local development environment |
| `turbo.json` | Turborepo task configuration |
| `apps/api/src/server.ts` | Backend entry point |
| `apps/web/src/app/page.tsx` | Frontend entry point |
| `packages/database/prisma/schema.prisma` | Database schema (to be created) |

## Development Commands

```bash
# Install dependencies
pnpm install

# Start all services in dev mode
pnpm dev

# Build all services
pnpm build

# Run tests
pnpm test

# Format code
pnpm format

# Lint
pnpm lint

# Database migrations (Phase 1+)
cd packages/database
pnpm prisma migrate dev
```

## Environment Variables

### Backend (apps/api)
```
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=...
AI_SERVICE_URL=http://localhost:8800
```

### Frontend (apps/web)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### AI Service (apps/ai-service)
```
OPENAI_API_KEY=...
PORT=8800
AI_API_VERSION=v1
```

## Key Design Decisions

1. **Multi-tenancy:** Row-level `tenant_id` isolation (not schema-per-tenant)
2. **Auth:** Clerk for managed authentication (not custom JWT)
3. **AI Service:** Python/FastAPI (better ML ecosystem) instead of Node.js
4. **Database:** Prisma ORM for type safety and migrations
5. **Communication:** REST API (simple, scalable to message queue later)

## Security Considerations

- **Tenant Isolation:** Every query must filter by `tenant_id`
- **Role-Based Access:** Frontend + Backend enforce role permissions
- **JWT Validation:** All API requests validate Clerk tokens
- **No Cross-Tenant Access:** Middleware blocks unauthorized access

## Non-Goals (MVP)

- ❌ Image/video generation
- ❌ Social media posting/scheduling
- ❌ Billing system
- ❌ Analytics dashboard
- ❌ Usage quotas

*(Architecture designed to add these later)*

## Code Conventions

- **TypeScript:** Strict mode enabled
- **Naming:** camelCase (TS), snake_case (Python, DB)
- **Components:** PascalCase React components
- **Files:** kebab-case for file names
- **Commits:** Conventional Commits format

See `conventions/` folder for detailed standards.

## Testing Strategy

- **Unit Tests:** Jest (TS), pytest (Python)
- **Integration Tests:** Supertest (API)
- **E2E Tests:** Playwright (Frontend)

## Related Documentation

- `architecture/overview.md` - Detailed architecture
- `architecture/database-schema.md` - Database design
- `features/authentication.md` - Auth implementation
- `features/ai-generation.md` - AI service details

## Quick Tips for LLMs

1. **Always consider multi-tenancy** - Filter by `tenant_id`
2. **Check user role** - Different roles have different permissions
3. **Follow status flow** - Ideas have specific state transitions
4. **Type safety** - Use TypeScript types and Pydantic models
5. **Error handling** - Centralized error handling in all services

## Getting Help

- Read `PLAN.md` for overall project roadmap
- Check `architecture/` for system design questions
- Review `features/` for specific feature implementations
- See `conventions/` for code style questions

---

**Last Updated:** February 1, 2026  
**Current Phase:** Phase 1 - Foundation & Setup  
**Status:** Planning Complete, Implementation Starting
