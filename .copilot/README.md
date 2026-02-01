# .copilot - LLM Context System

This directory contains comprehensive documentation and context about the repository to help LLMs (Language Learning Models) understand and work with the codebase effectively.

## Purpose

The `.copilot` folder serves as a central knowledge base that:
- Provides structured context for AI assistants
- Documents architecture, features, and conventions
- Maintains up-to-date information through automated discovery scripts
- Enables consistent understanding across different LLM interactions

## Structure

```
.copilot/
├── README.md                 # This file - explains the system
├── CONTEXT.md               # Quick reference for LLMs (start here!)
├── architecture/            # System design and architecture docs
├── features/                # Feature-specific documentation
├── conventions/             # Coding standards and conventions
├── discovery/               # Auto-discovery scripts and templates
├── scripts/                 # Utility scripts for maintenance
└── changelog.md            # Track major repository changes
```

## Quick Start for LLMs

**When working with this repository, start by reading:**
1. `CONTEXT.md` - High-level overview and quick reference
2. `architecture/overview.md` - System architecture
3. Relevant files in `features/` based on the task

## For Humans: Maintaining This System

### Running Discovery Scripts

Update the context automatically:

```bash
# Full discovery - regenerate all auto-generated docs
cd .copilot/scripts
./full-discovery.sh

# Quick update - only changed files
./quick-update.sh

# Discover specific area
./discover-routes.sh apps/api
./discover-components.sh apps/web
```

### When to Update

Run discovery scripts when:
- New features are added
- Architecture changes
- API endpoints are modified
- Database schema changes
- New conventions are established

### Manual Updates

Some files should be manually maintained:
- `conventions/` - Update when team decides on new standards
- `features/` - Update when feature behavior changes
- `architecture/` - Update for architectural decisions

## File Descriptions

### Core Files

- **CONTEXT.md** - Comprehensive quick reference for LLMs
- **changelog.md** - Major changes to track evolution

### Architecture Docs

- `architecture/overview.md` - System architecture and tech stack
- `architecture/database-schema.md` - Database design and relationships
- `architecture/api-contracts.md` - API endpoint documentation
- `architecture/multi-tenancy.md` - Multi-tenant implementation details

### Feature Docs

- `features/authentication.md` - Auth system (Clerk integration)
- `features/campaign-management.md` - Campaign CRUD operations
- `features/ai-generation.md` - AI ideation system
- `features/approval-workflow.md` - Status transitions and approvals

### Convention Docs

- `conventions/coding-standards.md` - Code style and best practices
- `conventions/folder-structure.md` - Project organization
- `conventions/naming-conventions.md` - Naming rules
- `conventions/commit-messages.md` - Git commit standards

### Discovery Scripts

- `discovery/discover.sh` - Main discovery orchestrator
- `discovery/update-context.sh` - Update CONTEXT.md
- `scripts/full-discovery.sh` - Complete regeneration
- `scripts/quick-update.sh` - Incremental update

## Best Practices

1. **Keep it Current**: Run discovery scripts after major changes
2. **Be Granular**: Document features in detail with examples
3. **Cross-Reference**: Link between related documents
4. **Version Control**: Commit `.copilot` changes with code changes
5. **Review Regularly**: Monthly review to ensure accuracy

## Integration with Development Workflow

### Git Hooks (Optional)

Set up automatic updates:

```bash
# Add to .git/hooks/post-commit
#!/bin/bash
cd .copilot/scripts
./quick-update.sh
```

### CI/CD Integration

Add to your pipeline:

```yaml
- name: Update LLM Context
  run: |
    cd .copilot/scripts
    ./full-discovery.sh
    git diff --exit-code || echo "Context updated"
```

## Contributing

When adding new features:
1. Document in appropriate `features/` file
2. Update `CONTEXT.md` if it affects high-level understanding
3. Run discovery scripts to capture code-level changes
4. Update `changelog.md` with notable changes

## Notes

- This system is designed for **developer productivity** and **AI assistance**
- Not a replacement for user-facing documentation
- Focus on technical details and implementation specifics
- Keep explanations clear but technical

---

**Last Updated:** February 1, 2026
**Maintainer:** Development Team
