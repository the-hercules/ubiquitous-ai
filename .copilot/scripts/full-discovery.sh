#!/bin/bash

# Full Discovery Script - Regenerate all auto-generated documentation
# This script scans the codebase and updates the .copilot documentation

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COPILOT_DIR="$REPO_ROOT/.copilot"

echo "🔍 Starting full discovery..."
echo "Repository: $REPO_ROOT"
echo ""

# Navigate to repo root
cd "$REPO_ROOT"

# Create discovery output directory
mkdir -p "$COPILOT_DIR/discovery/output"

# --- 1. Discover Project Structure ---
echo "📁 Discovering project structure..."
{
    echo "# Project Structure (Auto-generated)"
    echo ""
    echo "Generated: $(date)"
    echo ""
    echo "\`\`\`"
    tree -L 3 -I 'node_modules|.next|dist|build|.git|__pycache__|.venv' . || find . -maxdepth 3 -type d ! -path '*/node_modules/*' ! -path '*/.next/*' ! -path '*/dist/*' ! -path '*/.git/*' ! -path '*/__pycache__/*' ! -path '*/.venv/*' | head -100
    echo "\`\`\`"
} > "$COPILOT_DIR/discovery/output/project-structure.md"

# --- 2. Discover API Routes ---
echo "🔗 Discovering API routes..."
{
    echo "# API Routes (Auto-generated)"
    echo ""
    echo "Generated: $(date)"
    echo ""
    echo "## Backend API (apps/api)"
    echo ""
    
    if [ -d "apps/api/src" ]; then
        echo "### Route Files:"
        find apps/api/src -name "*.ts" -o -name "*.js" | grep -E "(route|controller)" || echo "No route files found yet"
        echo ""
        
        echo "### Endpoints (detected from code):"
        # Search for Express route definitions
        grep -r -n "router\.\(get\|post\|put\|patch\|delete\)" apps/api/src 2>/dev/null | head -50 || echo "No endpoints defined yet"
    else
        echo "API source not found - Phase 1 in progress"
    fi
    
    echo ""
    echo "## AI Service (apps/ai-service)"
    echo ""
    
    if [ -d "apps/ai-service/src" ]; then
        echo "### Route Files:"
        find apps/ai-service/src -name "*.py" | grep -E "(route|api)" || echo "No route files found yet"
        echo ""
        
        echo "### Endpoints (detected from code):"
        # Search for FastAPI route definitions
        grep -r -n "@app\.\(get\|post\|put\|patch\|delete\)" apps/ai-service/src 2>/dev/null | head -50 || echo "No endpoints defined yet"
    else
        echo "AI service not created yet - Phase 1 in progress"
    fi
} > "$COPILOT_DIR/discovery/output/api-routes.md"

# --- 3. Discover Database Schema ---
echo "💾 Discovering database schema..."
{
    echo "# Database Schema (Auto-generated)"
    echo ""
    echo "Generated: $(date)"
    echo ""
    
    if [ -f "packages/database/prisma/schema.prisma" ]; then
        echo "## Prisma Schema"
        echo ""
        echo "\`\`\`prisma"
        cat packages/database/prisma/schema.prisma
        echo "\`\`\`"
    else
        echo "Database schema not created yet - Phase 1 in progress"
        echo ""
        echo "Expected location: \`packages/database/prisma/schema.prisma\`"
    fi
} > "$COPILOT_DIR/discovery/output/database-schema.md"

# --- 4. Discover React Components ---
echo "⚛️  Discovering React components..."
{
    echo "# React Components (Auto-generated)"
    echo ""
    echo "Generated: $(date)"
    echo ""
    
    if [ -d "apps/web/src" ]; then
        echo "## Component Files"
        echo ""
        find apps/web/src -name "*.tsx" -o -name "*.jsx" | head -100
        echo ""
        
        echo "## Component Exports (sample)"
        echo ""
        # Find exported components
        grep -r "^export \(default \)\?function\|^export const.*=.*React" apps/web/src 2>/dev/null | head -30 || echo "No components found yet"
    else
        echo "Frontend source not found"
    fi
} > "$COPILOT_DIR/discovery/output/components.md"

# --- 5. Discover Environment Variables ---
echo "🔐 Discovering environment variables..."
{
    echo "# Environment Variables (Auto-generated)"
    echo ""
    echo "Generated: $(date)"
    echo ""
    
    echo "## Backend API"
    if [ -f "apps/api/.env.example" ]; then
        echo "\`\`\`"
        cat apps/api/.env.example
        echo "\`\`\`"
    else
        echo "No .env.example found"
    fi
    
    echo ""
    echo "## Frontend"
    if [ -f "apps/web/.env.example" ]; then
        echo "\`\`\`"
        cat apps/web/.env.example
        echo "\`\`\`"
    else
        echo "No .env.example found"
    fi
    
    echo ""
    echo "## AI Service"
    if [ -f "apps/ai-service/.env.example" ]; then
        echo "\`\`\`"
        cat apps/ai-service/.env.example
        echo "\`\`\`"
    else
        echo "No .env.example found"
    fi
} > "$COPILOT_DIR/discovery/output/environment-variables.md"

# --- 6. Discover Dependencies ---
echo "📦 Discovering dependencies..."
{
    echo "# Dependencies (Auto-generated)"
    echo ""
    echo "Generated: $(date)"
    echo ""
    
    echo "## Root Package"
    if [ -f "package.json" ]; then
        echo "\`\`\`json"
        cat package.json | jq '.dependencies, .devDependencies' 2>/dev/null || cat package.json
        echo "\`\`\`"
    fi
    
    echo ""
    echo "## Backend API"
    if [ -f "apps/api/package.json" ]; then
        echo "\`\`\`json"
        cat apps/api/package.json | jq '.dependencies' 2>/dev/null || cat apps/api/package.json
        echo "\`\`\`"
    fi
    
    echo ""
    echo "## Frontend"
    if [ -f "apps/web/package.json" ]; then
        echo "\`\`\`json"
        cat apps/web/package.json | jq '.dependencies' 2>/dev/null || cat apps/web/package.json
        echo "\`\`\`"
    fi
    
    echo ""
    echo "## AI Service (Python)"
    if [ -f "apps/ai-service/pyproject.toml" ]; then
        echo "\`\`\`toml"
        cat apps/ai-service/pyproject.toml
        echo "\`\`\`"
    fi
} > "$COPILOT_DIR/discovery/output/dependencies.md"

# --- 7. Update Changelog ---
echo "📝 Updating changelog..."
{
    echo "# Repository Changelog"
    echo ""
    echo "Last discovery run: $(date)"
    echo ""
    echo "## Recent Changes"
    echo ""
    git log --oneline --max-count=20 2>/dev/null || echo "Git history not available"
} >> "$COPILOT_DIR/changelog.md"

# --- Summary ---
echo ""
echo "✅ Discovery complete!"
echo ""
echo "Generated files in: $COPILOT_DIR/discovery/output/"
ls -lh "$COPILOT_DIR/discovery/output/"
echo ""
echo "📖 Review the generated documentation and commit changes."
