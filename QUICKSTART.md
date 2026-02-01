# Quick Start - Local Development

After experiencing Docker build issues, here's the simplified way to run everything locally.

## Prerequisites Completed ✅
- PostgreSQL database running in Docker
- Database migrated and seeded
- Clerk API keys configured

## Start Development Services

### Option 1: All Services Together (Recommended for development)

Open 3 separate terminal windows:

**Terminal 1 - API Server:**
```bash
cd apps/api
pnpm dev
```
The API will run on http://localhost:3001

**Terminal 2 - Web/Frontend:**
```bash
cd apps/web
pnpm dev
```
The web app will run on http://localhost:3000

**Terminal 3 - AI Service (Optional for Phase 1):**
```bash
cd apps/ai-service
python3 -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8800
```
The AI service will run on http://localhost:8800

### Option 2: Use Turbo (All Node services together)

```bash
# From root directory
pnpm dev
```

This will start both `web` and `api` in parallel.

## Verify Everything Works

### 1. Check API
```bash
curl http://localhost:3001/health
# Should return: {"status":"healthy","service":"api","timestamp":"..."}
```

### 2. Check Web
Open browser to: http://localhost:3000

### 3. Check Database
```bash
cd packages/database
pnpm prisma studio
```
This opens a GUI to view your database at http://localhost:5555

## Common Issues & Solutions

### Issue: "Cannot find module '@repo/logger'"
**Solution:** Build the shared packages first
```bash
pnpm build --filter=@repo/logger
```

### Issue: Port already in use
**Solution:** Find and kill the process
```bash
# Find process on port 3001 (for API)
lsof -ti:3001
# Kill it (replace PID with the number from above)
kill <PID>
```

### Issue: Database connection error
**Solution:** Ensure PostgreSQL is running
```bash
docker compose up -d postgres
docker compose ps postgres
# Should show "healthy" status
```

### Issue: Clerk authentication not working
**Solution:** Check environment variables
```bash
# API: apps/api/.env should have CLERK_SECRET_KEY
# Web: apps/web/.env.local should have NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

## Current Status

✅ **Working:**
- PostgreSQL database
- Database schema and migrations
- Seed data (demo agency, users, client)
- API server with health endpoints
- Authentication middleware

⏳ **Next Steps:**
- Integrate Clerk in Next.js frontend (add ClerkProvider)
- Create sign-in/sign-up pages
- Test authentication flow end-to-end

## Database Seed Data

Your database now has:
- **Platform Admin:** admin@ubiquitous-ai.com
- **Agency:** Demo Agency (slug: demo-agency)
- **Agency Staff:** staff@demo-agency.com
- **Client:** Acme Corporation
- **Client User:** john@acme.com

## Useful Commands

```bash
# Database operations
cd packages/database
pnpm prisma studio          # Open database GUI
pnpm prisma migrate dev     # Create new migration
pnpm db:seed               # Re-seed database

# Build packages
pnpm build                  # Build all packages
pnpm build --filter=api     # Build specific package

# Check what's running
lsof -i:3000               # Check web port
lsof -i:3001               # Check API port
lsof -i:8800               # Check AI service port
```

## Development Workflow

1. **Make changes to code**
2. **Save files** (hot reload will restart services automatically)
3. **Check browser/terminal** for errors
4. **Test in browser** at http://localhost:3000

## Next Phase Tasks

Once you verify everything runs:

1. **Add Clerk to Next.js** (Phase 1 completion)
   - Update `apps/web/src/app/layout.tsx` with ClerkProvider
   - Create sign-in pages
   - Test authentication

2. **Start Phase 2** (Core Entities)
   - Build client management UI
   - Create campaign management
   - Organization profiles

See `PLAN.md` for full roadmap.
