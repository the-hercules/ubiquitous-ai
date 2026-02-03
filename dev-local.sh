#!/bin/bash

# Local Development Script (No Docker for services)
# This runs all services directly on your machine for faster development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Local Development Mode                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found!${NC}"
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit .env and add your Clerk API keys${NC}"
    echo -e "${YELLOW}  Get them from: https://dashboard.clerk.com${NC}"
    exit 1
fi

# Check for Clerk keys
if ! grep -q "sk_test_" .env || grep -q "your_clerk_secret_key_here" .env; then
    echo -e "${RED}✗ Missing Clerk keys in .env${NC}"
    echo -e "${YELLOW}Please edit .env and add your Clerk keys:${NC}"
    echo "  - CLERK_SECRET_KEY=sk_test_..."
    echo "  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_..."
    echo
    echo -e "${YELLOW}Get them from: https://dashboard.clerk.com/last-active?path=api-keys${NC}"
    exit 1
fi

# Check if PostgreSQL is running
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! docker compose ps postgres | grep -q "healthy\|Up"; then
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    docker compose up -d postgres
    echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
    sleep 5
fi

# Check if migrations are needed
echo -e "${BLUE}Checking database migrations...${NC}"
if ! cd packages/database && pnpm prisma migrate status 2>&1 | grep -q "Database schema is up to date"; then
    echo -e "${YELLOW}Running database migrations...${NC}"
    pnpm prisma migrate dev
    cd ../..
else
    echo -e "${GREEN}✓ Database is up to date${NC}"
    cd ../..
fi

# Check if database has data
echo -e "${BLUE}Checking database seed data...${NC}"
TENANT_COUNT=$(docker exec postgres psql -U postgres -d ubiquitous_ai_dev -t -c "SELECT COUNT(*) FROM tenants;" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$TENANT_COUNT" -eq "0" ]; then
    echo -e "${YELLOW}Seeding database with test data...${NC}"
    cd packages/database && pnpm db:seed && cd ../..
    echo -e "${GREEN}✓ Database seeded${NC}"
else
    echo -e "${GREEN}✓ Database has data (${TENANT_COUNT} tenants)${NC}"
fi

echo
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Starting All Services...              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo

# Start all services with pnpm (web, api, logger)
echo -e "${BLUE}Starting frontend, API, and logger...${NC}"
echo -e "${YELLOW}Note: AI service not included (add to turbo.json if needed)${NC}"
echo

pnpm dev

# This script will run until you press Ctrl+C
# When you stop it, all services will stop
