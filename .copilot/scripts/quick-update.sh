#!/bin/bash

# Quick Update Script - Update only recently changed files
# Faster than full discovery, runs on git changes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COPILOT_DIR="$REPO_ROOT/.copilot"

echo "⚡ Quick update based on recent changes..."
cd "$REPO_ROOT"

# Get list of changed files since last commit
CHANGED_FILES=$(git diff --name-only HEAD~1 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
    echo "No recent changes detected. Run full-discovery.sh for complete update."
    exit 0
fi

echo "Changed files:"
echo "$CHANGED_FILES"
echo ""

# Check if database schema changed
if echo "$CHANGED_FILES" | grep -q "prisma/schema.prisma"; then
    echo "📊 Database schema changed - updating schema docs..."
    {
        echo "# Database Schema (Auto-generated)"
        echo ""
        echo "Generated: $(date)"
        echo ""
        echo "\`\`\`prisma"
        cat packages/database/prisma/schema.prisma 2>/dev/null || echo "Schema file not found"
        echo "\`\`\`"
    } > "$COPILOT_DIR/discovery/output/database-schema.md"
fi

# Check if API routes changed
if echo "$CHANGED_FILES" | grep -q "apps/api/src"; then
    echo "🔗 API code changed - updating API routes..."
    grep -r -n "router\.\(get\|post\|put\|patch\|delete\)" apps/api/src 2>/dev/null > "$COPILOT_DIR/discovery/output/api-routes-temp.txt" || true
fi

# Check if React components changed
if echo "$CHANGED_FILES" | grep -q "apps/web/src"; then
    echo "⚛️  Frontend code changed - updating component list..."
    find apps/web/src -name "*.tsx" -o -name "*.jsx" > "$COPILOT_DIR/discovery/output/components-temp.txt" 2>/dev/null || true
fi

# Update changelog
echo "📝 Updating changelog..."
{
    echo ""
    echo "## Update: $(date)"
    echo ""
    echo "Changed files:"
    echo "$CHANGED_FILES" | sed 's/^/- /'
    echo ""
} >> "$COPILOT_DIR/changelog.md"

echo ""
echo "✅ Quick update complete!"
echo "Run full-discovery.sh for comprehensive regeneration."
