# Docker Build Guide

## Prerequisites

Before building Docker images, ensure you have your environment variables set up.

### Required Environment Variables

Create a `.env` file in the root directory with:

```bash
# REQUIRED for Docker builds
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Optional (have defaults)
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ubiquitous_ai_dev
```

## Why Clerk Keys Are Required

The Next.js build process (during Docker build) requires `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` because:

1. **Build-time Rendering**: Next.js pre-renders pages at build time
2. **Clerk Provider**: The ClerkProvider component needs the key during build
3. **Static Generation**: Even error pages (like `/_not-found`) need Clerk context

**Without the key**, you'll see this error:
```
Error: @clerk/clerk-react: Missing publishableKey
```

## Building Individual Services

### Build Web (Frontend)
```bash
docker compose build web
```

**Build Arguments Used:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From .env
- `NEXT_PUBLIC_API_URL` - From .env (defaults to http://localhost:3001)

### Build API (Backend)
```bash
docker compose build api
```

### Build AI Service
```bash
docker compose build ai-service
```

## Building All Services

```bash
# Build all services
docker compose build

# Build and start all services
docker compose up --build
```

## Troubleshooting

### Error: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"

**Problem**: The Dockerfile can't find the Clerk publishable key

**Solution**: 
1. Check your `.env` file exists in the root directory
2. Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
3. The value should start with `pk_test_` or `pk_live_`

```bash
# Verify your .env file
cat .env | grep NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

### Error: "Lockfile was successfully patched"

**Warning (Safe to ignore)**: Next.js auto-patches lockfiles for missing dependencies

**Optional Fix**: Remove `apps/web/package-lock.json` if it exists:
```bash
rm apps/web/package-lock.json
```

### Error: "Cannot find module '@repo/logger'"

**Problem**: Shared packages not built

**Solution**: Build shared packages first (or use turbo prune which handles this):
```bash
pnpm build --filter=@repo/logger
```

## Production Deployment

For production builds, use:

```bash
# Set production Clerk keys in .env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_key

# Build with production settings
docker compose -f docker-compose.prod.yml build

# Or for specific service
docker build \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  -f apps/web/Dockerfile \
  -t your-web-image:latest \
  .
```

## Architecture Note

The Docker setup uses multi-stage builds:

1. **prepare** - Prunes monorepo to only needed files
2. **builder** - Installs dependencies and builds
3. **runner** - Minimal production image with only runtime files

This results in smaller final images and faster deployments.

## Local Development vs Docker

**For local development**, we recommend:
```bash
pnpm dev  # Faster, hot reload, easier debugging
```

**For production-like testing**, use Docker:
```bash
docker compose up  # Tests full container setup
```
