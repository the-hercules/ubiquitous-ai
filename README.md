# Social Media Agency SaaS Platform

A multi-tenant SaaS application for social media agencies to streamline campaign management and AI-powered content ideation.

## 🎯 Project Status

**Current Phase:** Phase 1 - Foundation & Setup (In Progress)

### ✅ Completed Infrastructure
- [x] Turborepo monorepo setup
- [x] PostgreSQL database with Prisma ORM
- [x] Multi-tenant database schema
- [x] Authentication middleware (Clerk)
- [x] AI service scaffold (Python/FastAPI)
- [x] Docker Compose setup
- [x] Tenant isolation middleware

### 🚧 Next Steps
- [ ] Complete Clerk integration in frontend
- [ ] Initialize database and seed data
- [ ] Test end-to-end authentication flow
- [ ] Begin Phase 2: Core entities & management

## 🏗️ Architecture

### Microservices Stack
- **Frontend**: Next.js 14 + TypeScript (App Router) - `apps/web`
- **Backend API**: Express + TypeScript - `apps/api`
- **AI Service**: Python 3.13 + FastAPI - `apps/ai-service`
- **Database**: PostgreSQL + Prisma - `packages/database`
- **Auth**: Clerk (multi-tenant with organizations)

### Multi-Tenancy Model
Three user roles with strict tenant isolation:
1. **Platform Admin** - Manages agencies (tenants)
2. **Agency Staff** - Manages clients and campaigns
3. **Client** - Views approved content and provides feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker Desktop
- Python 3.13
- Clerk account ([sign up](https://clerk.com))

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your Clerk API keys

# 3. Run complete setup (starts DB, runs migrations, seeds data)
./dev.sh setup

# 4. Start all services
./dev.sh start

# 5. Open in browser
open http://localhost:3000
```

### Development Commands

```bash
./dev.sh start        # Start all services
./dev.sh stop         # Stop all services
./dev.sh logs         # View logs
./dev.sh health       # Check service health
./dev.sh db:studio    # Open database GUI
./dev.sh test         # Run tests
```

See `SETUP.md` for detailed setup instructions.

## 📁 Project Structure

```
ubiquitous-ai/
├── apps/
│   ├── web/           # Next.js frontend
│   ├── api/           # Express backend
│   └── ai-service/    # Python AI service
├── packages/
│   ├── database/      # Prisma + shared DB client
│   ├── ui/            # Shared React components
│   ├── logger/        # Logging utilities
│   └── typescript-config/
├── .copilot/          # LLM context documentation
├── PLAN.md            # Implementation roadmap
├── SETUP.md           # Detailed setup guide
└── dev.sh             # Development helper script
```

## 🎯 Core Features (Planned)

### Phase 1: Foundation (In Progress)
- ✅ Database schema with multi-tenant isolation
- ✅ Authentication & authorization
- ✅ Service scaffolding
- ⏳ Frontend Clerk integration

### Phase 2: Core Entities
- Client (brand) management
- Campaign/project creation
- Organization profiles
- Campaign plan inputs

### Phase 3: AI Ideation
- LLM integration (OpenAI)
- Prompt template management
- Post idea generation
- Detailed reel idea generation
- Single-idea regeneration

### Phase 4: Approval Workflow
- Agency review & editing
- Client approval system
- Comment system
- Status transitions

### Phase 5: Polish
- Role-based access control
- UI/UX enhancements
- Comprehensive logging
- Error handling

## 🔒 Security & Multi-Tenancy

Every database query is automatically filtered by `tenant_id` to ensure:
- No cross-tenant data leakage
- Strict tenant isolation
- Role-based access control

**Critical:** All API endpoints enforce tenant context through middleware.

## 📚 Documentation

- **`PLAN.md`** - Complete implementation roadmap
- **`SETUP.md`** - Detailed setup instructions
- **`.copilot/CONTEXT.md`** - Architecture overview for AI assistants
- **`.copilot/architecture/`** - System design documentation
- **`.copilot/conventions/`** - Coding standards

## 🛠️ Tech Stack Details

### Frontend
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Shadcn/ui components
- Clerk authentication

### Backend
- Express.js
- TypeScript
- Prisma ORM
- Clerk JWT validation
- Zod validation

### AI Service
- Python 3.13
- FastAPI
- Pydantic models
- Structlog logging
- OpenAI SDK (future)

### Infrastructure
- PostgreSQL 16
- Docker & Docker Compose
- Turborepo
- pnpm workspaces

## 🧪 Testing Strategy

- **Unit Tests**: Jest (TypeScript), pytest (Python)
- **Integration Tests**: Supertest (API)
- **E2E Tests**: Playwright (Frontend)

## 📝 Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Services
AI_SERVICE_URL=http://localhost:8800
NEXT_PUBLIC_API_URL=http://localhost:3001

# AI (future)
OPENAI_API_KEY=sk-...
```

See `.env.example` for complete list.

## 🤝 Contributing

This is an active development project. Key principles:

1. **Multi-tenancy first** - Every feature must respect tenant isolation
2. **Type safety** - TypeScript strict mode, Pydantic models
3. **Security** - Validate all inputs, log security events
4. **Testing** - Unit tests for business logic, integration tests for APIs

See `.copilot/conventions/` for coding standards.

## 📄 License

[Your License Here]

## 🆘 Support

For issues or questions:
1. Check `SETUP.md` for common problems
2. Review `.copilot/CONTEXT.md` for architecture
3. See `PLAN.md` for roadmap and current phase

---

**Current Version:** 0.1.0 (Phase 1 - Foundation)  
**Last Updated:** February 1, 2026
