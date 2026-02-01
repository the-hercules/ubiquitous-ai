# GitHub Copilot Instructions

## 📚 Repository Context System

**IMPORTANT:** This repository has a comprehensive LLM context system. Before working on any task, you MUST:

1. **Read `.copilot/CONTEXT.md`** - This is your starting point for understanding the entire codebase
2. **Check `.copilot/architecture/`** - For system design and architecture details
3. **Review `.copilot/conventions/`** - For coding standards and best practices
4. **Consult `PLAN.md`** - For implementation roadmap and current phase

## Project Overview

**Name:** Social Media Agency SaaS Platform  
**Type:** Multi-tenant SaaS Application  
**Purpose:** Streamline campaign management and AI-powered content ideation for social media agencies

### Tech Stack
- **Frontend:** Next.js 14 + TypeScript (App Router)
- **Backend:** Express + TypeScript  
- **AI Service:** Python 3.13 + FastAPI
- **Database:** PostgreSQL + Prisma
- **Auth:** Clerk (multi-tenant)
- **Monorepo:** Turborepo + pnpm

## Critical Rules - ALWAYS Follow

### 1. Multi-Tenancy is Mandatory
- **EVERY database query MUST filter by `tenant_id`**
- Never allow cross-tenant data access
- Always validate tenant context in middleware
- Test tenant isolation for every feature

```typescript
// ✅ CORRECT - Always filter by tenant
const campaigns = await prisma.campaign.findMany({
  where: {
    tenant_id: req.tenantId,
    // ... other filters
  }
});

// ❌ WRONG - Missing tenant filter
const campaigns = await prisma.campaign.findMany({
  where: {
    status: 'active'
  }
});
```

### 2. Type Safety First
- Use TypeScript strict mode
- Define Pydantic models for Python
- Never use `any` type unless absolutely necessary
- Validate all inputs (Zod for TS, Pydantic for Python)

### 3. Security Best Practices
- Always validate Clerk JWT tokens
- Implement role-based access control (RBAC)
- Sanitize all user inputs
- Log security-relevant events

### 4. Error Handling
- Use custom error classes
- Centralized error handling middleware
- Log errors with context (tenant_id, user_id, action)
- Return user-friendly error messages

### 5. Logging Standards
- Use structured logging (omnilogs for TS, structlog for Python)
- Include context: tenant_id, user_id, action, timestamps
- Log all important state changes
- Never log sensitive data (passwords, tokens)

## Architecture Principles

### Layered Architecture (Backend)
```
Controllers → Services → Repositories → Database
```

- **Controllers:** HTTP request/response handling
- **Services:** Business logic and orchestration
- **Repositories:** Database access layer
- **No business logic in controllers or repositories**

### Service Communication
- **Frontend → Backend API:** REST API
- **Backend API → AI Service:** REST API
- **Backend API → Database:** Prisma ORM
- Future: Message queue for async operations

## Naming Conventions

### TypeScript
- Variables/Functions: `camelCase`
- Classes/Interfaces: `PascalCase`
- Files: `kebab-case.ts`
- Constants: `SCREAMING_SNAKE_CASE`

### Python
- Variables/Functions: `snake_case`
- Classes: `PascalCase`
- Files: `snake_case.py`
- Constants: `SCREAMING_SNAKE_CASE`

### Database
- Tables: `snake_case` (plural)
- Columns: `snake_case`
- Foreign keys: `{table}_id`

## Common Task Patterns

### Adding a New API Endpoint

1. **Define the model/DTO** (with Zod or Pydantic)
2. **Create repository method** (with tenant isolation)
3. **Create service method** (business logic)
4. **Create controller method** (HTTP handling)
5. **Add route** (with auth middleware)
6. **Write tests** (unit + integration)
7. **Update `.copilot/` docs** (run discovery scripts)

Example:
```typescript
// 1. Model/DTO
const CreateIdeaSchema = z.object({
  campaignId: z.string().uuid(),
  type: z.enum(['POST', 'REEL']),
  content: z.record(z.any()),
});

// 2. Repository
class IdeaRepository {
  async create(data: Idea) {
    return prisma.idea.create({ data });
  }
}

// 3. Service
class IdeaService {
  async create(data: CreateIdeaDto, tenantId: string) {
    // Validate campaign belongs to tenant
    const campaign = await this.campaignRepo.findById(data.campaignId);
    if (campaign.tenantId !== tenantId) {
      throw new UnauthorizedError('Access denied');
    }
    
    return this.ideaRepo.create({ ...data, tenantId, status: 'GENERATED' });
  }
}

// 4. Controller
class IdeaController {
  async create(req: Request, res: Response) {
    const validated = CreateIdeaSchema.parse(req.body);
    const idea = await this.ideaService.create(validated, req.tenantId);
    res.status(201).json(idea);
  }
}

// 5. Route
router.post('/ideas', authMiddleware, tenantMiddleware, ideaController.create);
```

### Adding a New Database Entity

1. **Define Prisma model** (with `tenant_id` if scoped)
2. **Create migration** (`pnpm prisma migrate dev`)
3. **Generate Prisma client**
4. **Create TypeScript types**
5. **Update repository/service layers**
6. **Run discovery script** to update docs

### Adding a New React Component

1. **Create component file** in appropriate directory
2. **Use TypeScript for props**
3. **Follow Shadcn/ui patterns**
4. **Add proper error boundaries**
5. **Consider loading states**

## File Organization

### Backend API Structure
```
apps/api/src/
├── controllers/     # HTTP handlers
├── services/        # Business logic
├── repositories/    # Database access
├── middleware/      # Auth, tenant, logging
├── models/          # Types, DTOs, schemas
├── utils/           # Helper functions
└── index.ts
```

### Frontend Structure
```
apps/web/src/
├── app/             # Next.js App Router
│   ├── (admin)/    # Admin routes
│   ├── (agency)/   # Agency routes
│   └── (client)/   # Client routes
├── components/      # Reusable components
├── lib/            # Utilities, API clients
└── types/          # TypeScript types
```

### AI Service Structure
```
apps/ai-service/src/
├── main.py          # FastAPI app
├── config/          # Configuration
├── routes/          # API routes
├── services/        # LLM logic
├── models/          # Pydantic models
└── logger/          # Logging setup
```

## Status Flow Reference

Ideas have the following status transitions:

```
GENERATED 
  ↓
AGENCY_REVIEWED
  ↓
AGENCY_APPROVED (now visible to client)
  ↓
CLIENT_REVIEWED
  ↓ (approve)        ↓ (request changes)
CLIENT_APPROVED     REVISION_REQUESTED
                      ↓
                  (back to agency)
```

**Rules:**
- Only agency-approved ideas are visible to clients
- Clients cannot edit ideas, only comment
- Status transitions must be validated

## AI Service Guidelines

When working with the AI service:

1. **Prompt templates** should be versioned and stored
2. **Context assembly** must fetch all relevant campaign/brand data
3. **Structured output** using Pydantic models
4. **Token counting** for cost tracking
5. **Retry logic** with exponential backoff
6. **Error handling** for API failures

Example prompt structure:
```python
PROMPT_TEMPLATE = """
You are a social media content strategist.

Brand Context:
- Name: {brand_name}
- Industry: {industry}
- Tone: {brand_tone}
- Target Audience: {target_audience}

Campaign Details:
- Goals: {goals}
- Themes: {themes}
- Events: {events}

Generate {num_posts} Instagram post ideas.

Output as JSON array with this structure:
[
  {
    "concept": "...",
    "caption": "...",
    "theme": "..."
  }
]
"""
```

## Testing Requirements

### Unit Tests
- Test business logic in services
- Mock external dependencies
- Test edge cases and error handling
- Test tenant isolation

### Integration Tests
- Test API endpoints end-to-end
- Test with real database (test instance)
- Test authentication flows
- Test multi-tenant scenarios

### What to Test
- ✅ Tenant isolation (critical!)
- ✅ Authorization (role-based access)
- ✅ Input validation
- ✅ Business logic edge cases
- ✅ Error handling

## Current Phase: Phase 1 - Foundation & Setup

### In Progress:
- [ ] Database setup (PostgreSQL + Prisma)
- [ ] AI service scaffold (Python/FastAPI)
- [ ] Authentication (Clerk integration)
- [ ] Multi-tenant middleware
- [ ] Database seed script

### What You Can Work On:
- Setting up Prisma schema
- Creating authentication middleware
- Scaffolding AI service structure
- Creating base repository/service classes
- Setting up logging infrastructure

### What to Defer:
- Business logic (campaigns, ideas) - Phase 2
- AI generation logic - Phase 3
- Approval workflows - Phase 4
- UI polish - Phase 5

## Documentation Maintenance

After making significant changes:

```bash
# Quick update (changed files only)
cd .copilot/scripts
./quick-update.sh

# Full regeneration
./full-discovery.sh

# Commit the updated docs
git add .copilot/
git commit -m "docs: update LLM context"
```

## Quick Reference Links

- **Implementation Plan:** `PLAN.md`
- **Architecture:** `.copilot/architecture/overview.md`
- **Coding Standards:** `.copilot/conventions/coding-standards.md`
- **Current State:** `.copilot/discovery/output/`
- **Changelog:** `.copilot/changelog.md`

## Example Questions to Ask Yourself

Before implementing any feature:

1. ✅ Does this require tenant isolation?
2. ✅ What role(s) can access this?
3. ✅ What error cases should I handle?
4. ✅ Should this be logged?
5. ✅ What validations are needed?
6. ✅ Does this need tests?
7. ✅ Which layer does this belong in (controller/service/repository)?

## Common Pitfalls to Avoid

❌ **Don't:**
- Skip tenant isolation checks
- Use `any` type excessively
- Put business logic in controllers
- Forget error handling
- Hardcode configuration
- Commit secrets to git
- Skip input validation
- Make breaking changes without migration plan

✅ **Do:**
- Always filter by `tenant_id`
- Use strong typing
- Follow layered architecture
- Handle errors gracefully
- Use environment variables
- Use `.env.example` files
- Validate all inputs
- Plan backwards-compatible changes

## Getting Help

When stuck:
1. Read `.copilot/CONTEXT.md` for overview
2. Check `.copilot/architecture/` for design patterns
3. Review `PLAN.md` for roadmap context
4. Look at existing similar code
5. Check conventions in `.copilot/conventions/`

## Final Reminders

- **Security first:** Multi-tenancy and auth are critical
- **Type safety:** Use TypeScript and Pydantic properly
- **Keep docs updated:** Run discovery scripts after changes
- **Follow the plan:** Check current phase in `PLAN.md`
- **Test tenant isolation:** This is the most important feature

---

**Last Updated:** February 1, 2026  
**Current Phase:** Phase 1 - Foundation & Setup  
**Repository:** ubiquitous-ai
