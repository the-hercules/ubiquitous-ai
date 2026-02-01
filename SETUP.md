# Phase 1 Setup - Getting Started

This guide will help you complete the Phase 1 setup and get all services running.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop
- Python 3.13 (for AI service local development)
- Clerk account (for authentication)

## What Has Been Set Up

### ✅ Infrastructure Completed

1. **Database Package** (`packages/database`)
   - Prisma ORM with PostgreSQL
   - Complete multi-tenant schema
   - Seed script with test data

2. **AI Service** (`apps/ai-service`)
   - Python 3.13 + FastAPI
   - Structured logging with structlog
   - Health check endpoint
   - Request logging middleware

3. **Backend API** (`apps/api`)
   - Express + TypeScript
   - Clerk authentication middleware
   - Tenant isolation middleware
   - Error handling

4. **Docker Compose**
   - PostgreSQL with health checks
   - All services configured
   - Network and volumes set up

## Steps to Complete Setup

### 1. Install Dependencies

```bash
# Install all Node.js dependencies
pnpm install

# Install AI service Python dependencies
cd apps/ai-service
uv pip install --system -e .
# Or with pip: pip install -e .
```

### 2. Set Up Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Get your API keys from the dashboard
4. Copy environment variables:

```bash
# Root directory
cp .env.example .env

# Edit .env and add your Clerk keys:
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Also update:
- `apps/api/.env`
- `apps/web/.env.local` (create this file)

### 3. Start Docker Services

```bash
# Start Docker Desktop first, then:
docker compose up -d

# Verify services are running:
docker compose ps
```

You should see:
- `postgres` - Running and healthy
- `web` - Running (Next.js)
- `api` - Running (Express)
- `ai-service` - Running (FastAPI)

### 4. Initialize Database

```bash
# Navigate to database package
cd packages/database

# Create initial migration
pnpm prisma migrate dev --name init

# Run seed script
pnpm db:seed
```

This creates:
- Platform admin user: `admin@ubiquitous-ai.com`
- Demo agency: `demo-agency`
- Agency staff: `staff@demo-agency.com`
- Test client: Acme Corporation
- Client user: `john@acme.com`

### 5. Verify Services

#### Check AI Service
```bash
curl http://localhost:8800/health
# Should return: {"status":"healthy","service":"ai-service","version":"0.1.0"}
```

#### Check Backend API
```bash
curl http://localhost:3001/health
# Should return: {"status":"healthy","service":"api","timestamp":"..."}
```

#### Check Frontend
```bash
# Open browser to: http://localhost:3000
```

### 6. Configure Clerk in Next.js

Create `apps/web/src/app/layout.tsx` (if not exists):

```typescript
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

Create sign-in page at `apps/web/src/app/sign-in/[[...sign-in]]/page.tsx`:

```typescript
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

## Development Workflow

### Start All Services

```bash
# Option 1: Docker Compose (recommended)
docker compose up

# Option 2: Local development with hot reload
# Terminal 1 - API
cd apps/api && pnpm dev

# Terminal 2 - Web
cd apps/web && pnpm dev

# Terminal 3 - AI Service
cd apps/ai-service && pnpm dev

# Terminal 4 - PostgreSQL (if not using Docker)
# Use your local PostgreSQL or start just the DB:
docker compose up postgres
```

### Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Service**: http://localhost:8800
- **PostgreSQL**: localhost:5432

### Useful Commands

```bash
# Database commands
cd packages/database
pnpm prisma studio          # Open database GUI
pnpm prisma migrate dev     # Create new migration
pnpm db:seed               # Re-seed database
pnpm db:generate           # Regenerate Prisma client

# API commands
cd apps/api
pnpm dev                   # Start with hot reload
pnpm build                 # Build for production
pnpm test                  # Run tests

# Frontend commands
cd apps/web
pnpm dev                   # Start Next.js dev server
pnpm build                 # Build for production

# AI Service commands
cd apps/ai-service
pnpm dev                   # Start FastAPI with hot reload
python -m pytest           # Run tests
ruff check src/            # Lint code
```

## Environment Variables Reference

### Root `.env`
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ubiquitous_ai_dev
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
AI_SERVICE_URL=http://localhost:8800
NEXT_PUBLIC_API_URL=http://localhost:3001
OPENAI_API_KEY=sk-...
```

### `apps/api/.env`
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ubiquitous_ai_dev
CLERK_SECRET_KEY=sk_test_...
AI_SERVICE_URL=http://localhost:8800
PORT=3001
NODE_ENV=development
```

### `apps/web/.env.local`
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### `apps/ai-service/.env`
```
PORT=8800
OPENAI_API_KEY=sk-...
LOG_LEVEL=info
```

## Testing Authentication

1. Start all services
2. Navigate to http://localhost:3000
3. Sign in with Clerk (create a test account)
4. Test the protected API endpoint:

```bash
# Get your Clerk session token from browser DevTools
# Then test the API:
curl http://localhost:3001/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Should return your user ID and tenant ID.

## Troubleshooting

### PostgreSQL Connection Error
- Ensure Docker is running
- Check `docker compose ps` shows postgres as healthy
- Verify DATABASE_URL in .env files

### Clerk Authentication Failing
- Verify Clerk API keys are correct
- Check environment variables are loaded
- Ensure NEXT_PUBLIC_ prefix for frontend keys

### AI Service Won't Start
- Check Python 3.13 is installed
- Install dependencies: `uv pip install --system -e .`
- Check port 8800 is not in use

### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # or :3001, :8800

# Kill process
kill -9 <PID>
```

## Next Steps (Phase 2)

Once Phase 1 is complete and verified:

1. Create agency dashboard UI
2. Implement client management (CRUD)
3. Build campaign creation flows
4. Add organization profile management

See `PLAN.md` for full roadmap.

## Support

For issues or questions:
1. Check `.copilot/CONTEXT.md` for architecture overview
2. Review `PLAN.md` for implementation details
3. Check `.copilot/conventions/` for coding standards
