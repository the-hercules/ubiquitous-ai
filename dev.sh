#!/bin/bash

# Development Helper Script
# Quick commands for common development tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Social Media Agency SaaS - Dev Helper║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo

# Check if command is provided
if [ $# -eq 0 ]; then
    echo "Usage: ./dev.sh [command]"
    echo
    echo "Available commands:"
    echo "  install      - Install all dependencies"
    echo "  setup        - Complete initial setup"
    echo "  start        - Start all services with Docker (production-like)"
    echo "  stop         - Stop all services"
    echo "  logs         - View service logs"
    echo "  db:migrate   - Run database migrations"
    echo "  db:seed      - Seed database with test data"
    echo "  db:studio    - Open Prisma Studio"
    echo "  db:reset     - Reset database (destructive!)"
    echo "  test         - Run all tests"
    echo "  lint         - Lint all code"
    echo "  clean        - Clean all build artifacts"
    echo "  health       - Check all services health"
    echo
    echo "💡 For local development (faster):"
    echo "   ./dev-local.sh - Run services locally without Docker"
    exit 0
fi

COMMAND=$1

case $COMMAND in
    install)
        echo -e "${YELLOW}Installing dependencies...${NC}"
        pnpm install
        echo -e "${GREEN}✓ Dependencies installed${NC}"
        ;;
    
    setup)
        echo -e "${YELLOW}Running initial setup...${NC}"
        
        # Check if .env exists
        if [ ! -f .env ]; then
            echo -e "${YELLOW}Creating .env from .env.example...${NC}"
            cp .env.example .env
            echo -e "${RED}⚠ Please edit .env and add your Clerk API keys${NC}"
        fi
        
        # Install dependencies
        echo -e "${YELLOW}Installing dependencies...${NC}"
        pnpm install
        
        # Start PostgreSQL
        echo -e "${YELLOW}Starting PostgreSQL...${NC}"
        docker compose up -d postgres
        sleep 5
        
        # Run migrations
        echo -e "${YELLOW}Running database migrations...${NC}"
        cd packages/database && pnpm prisma migrate dev && cd ../..
        
        # Seed database
        echo -e "${YELLOW}Seeding database...${NC}"
        cd packages/database && pnpm db:seed && cd ../..
        
        echo -e "${GREEN}✓ Setup complete!${NC}"
        echo -e "${YELLOW}Next steps:${NC}"
        echo "  1. Edit .env and add your Clerk API keys"
        echo "  2. Run: ./dev.sh start"
        echo "  3. Open http://localhost:3000"
        ;;
    
    start)
        echo -e "${YELLOW}Starting all services with Docker...${NC}"
        echo -e "${YELLOW}Note: This rebuilds images if code changed${NC}"
        docker compose up -d --build
        echo -e "${GREEN}✓ Services started${NC}"
        echo
        echo "Services running at:"
        echo "  Frontend:  http://localhost:3000"
        echo "  API:       http://localhost:3001"
        echo "  AI Service: http://localhost:8800"
        echo
        echo "View logs: ./dev.sh logs"
        echo "Check health: ./dev.sh health"
        ;;
    
    stop)
        echo -e "${YELLOW}Stopping all services...${NC}"
        docker compose down
        echo -e "${GREEN}✓ Services stopped${NC}"
        ;;
    
    logs)
        docker compose logs -f
        ;;
    
    db:migrate)
        echo -e "${YELLOW}Running database migrations...${NC}"
        cd packages/database
        pnpm prisma migrate dev
        cd ../..
        echo -e "${GREEN}✓ Migrations complete${NC}"
        ;;
    
    db:seed)
        echo -e "${YELLOW}Seeding database...${NC}"
        cd packages/database
        pnpm db:seed
        cd ../..
        echo -e "${GREEN}✓ Database seeded${NC}"
        ;;
    
    db:studio)
        echo -e "${YELLOW}Opening Prisma Studio...${NC}"
        cd packages/database
        pnpm prisma studio
        cd ../..
        ;;
    
    db:reset)
        echo -e "${RED}⚠ WARNING: This will delete all data!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo -e "${YELLOW}Resetting database...${NC}"
            cd packages/database
            pnpm prisma migrate reset --force
            cd ../..
            echo -e "${GREEN}✓ Database reset${NC}"
        else
            echo "Cancelled"
        fi
        ;;
    
    test)
        echo -e "${YELLOW}Running tests...${NC}"
        pnpm test
        echo -e "${GREEN}✓ Tests complete${NC}"
        ;;
    
    lint)
        echo -e "${YELLOW}Linting code...${NC}"
        pnpm lint
        echo -e "${GREEN}✓ Linting complete${NC}"
        ;;
    
    clean)
        echo -e "${YELLOW}Cleaning build artifacts...${NC}"
        find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
        find . -name "dist" -type d -prune -exec rm -rf '{}' +
        find . -name ".next" -type d -prune -exec rm -rf '{}' +
        find . -name ".turbo" -type d -prune -exec rm -rf '{}' +
        echo -e "${GREEN}✓ Clean complete${NC}"
        ;;
    
    health)
        echo -e "${YELLOW}Checking service health...${NC}"
        echo
        
        # Check API
        if curl -s http://localhost:3001/health > /dev/null; then
            echo -e "${GREEN}✓ API (port 3001): Healthy${NC}"
        else
            echo -e "${RED}✗ API (port 3001): Unhealthy${NC}"
        fi
        
        # Check AI Service
        if curl -s http://localhost:8800/health > /dev/null; then
            echo -e "${GREEN}✓ AI Service (port 8800): Healthy${NC}"
        else
            echo -e "${RED}✗ AI Service (port 8800): Unhealthy${NC}"
        fi
        
        # Check Frontend
        if curl -s http://localhost:3000 > /dev/null; then
            echo -e "${GREEN}✓ Frontend (port 3000): Healthy${NC}"
        else
            echo -e "${RED}✗ Frontend (port 3000): Unhealthy${NC}"
        fi
        
        # Check PostgreSQL
        if docker compose ps postgres | grep -q "healthy"; then
            echo -e "${GREEN}✓ PostgreSQL: Healthy${NC}"
        else
            echo -e "${RED}✗ PostgreSQL: Unhealthy${NC}"
        fi
        ;;
    
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo "Run './dev.sh' without arguments to see available commands"
        exit 1
        ;;
esac
