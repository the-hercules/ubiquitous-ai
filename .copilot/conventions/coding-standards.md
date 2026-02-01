# Coding Standards & Best Practices

## General Principles

1. **Type Safety First** - Leverage TypeScript and Pydantic to their fullest
2. **Multi-Tenancy Always** - Every query must consider `tenant_id`
3. **DRY (Don't Repeat Yourself)** - Extract reusable logic
4. **SOLID Principles** - Especially Single Responsibility
5. **Error Handling** - Always handle errors gracefully
6. **Logging** - Log important actions and errors

---

## TypeScript Standards

### Strict Mode
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Type Definitions
```typescript
// ✅ Good - Explicit types
function createCampaign(data: CreateCampaignDto): Promise<Campaign> {
  // ...
}

// ❌ Bad - Implicit any
function createCampaign(data) {
  // ...
}
```

### Interfaces vs Types
- Use **interfaces** for object shapes that may be extended
- Use **types** for unions, intersections, and primitives

```typescript
// Interfaces for domain models
interface User {
  id: string;
  email: string;
  tenantId: string;
}

// Types for unions
type UserRole = 'PLATFORM_ADMIN' | 'AGENCY_STAFF' | 'CLIENT';
```

---

## Naming Conventions

### TypeScript/JavaScript

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | camelCase | `userId`, `campaignData` |
| Functions | camelCase | `getUserById`, `validateInput` |
| Classes | PascalCase | `CampaignService`, `UserRepository` |
| Interfaces | PascalCase | `User`, `Campaign` |
| Types | PascalCase | `UserRole`, `IdeaStatus` |
| Enums | PascalCase | `IdeaStatus`, `UserRole` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_IDEAS_PER_CAMPAIGN` |
| Files | kebab-case | `campaign-service.ts`, `user-repository.ts` |

### Python

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | snake_case | `user_id`, `campaign_data` |
| Functions | snake_case | `get_user_by_id`, `validate_input` |
| Classes | PascalCase | `CampaignService`, `PromptTemplate` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_TOKENS`, `API_VERSION` |
| Files | snake_case | `campaign_service.py`, `llm_client.py` |

### Database

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | snake_case, plural | `users`, `campaigns`, `ideas` |
| Columns | snake_case | `tenant_id`, `created_at` |
| Foreign Keys | `{table}_id` | `campaign_id`, `user_id` |
| Indexes | `idx_{table}_{column}` | `idx_users_tenant_id` |

---

## Code Organization

### Backend API (Express)

```
apps/api/src/
├── controllers/          # HTTP layer
│   └── campaign.controller.ts
├── services/            # Business logic
│   └── campaign.service.ts
├── repositories/        # Data access
│   └── campaign.repository.ts
├── middleware/          # Request processing
│   ├── auth.middleware.ts
│   └── tenant.middleware.ts
├── models/             # Domain models & DTOs
│   └── campaign.model.ts
├── utils/              # Helper functions
│   └── validation.ts
└── index.ts           # Entry point
```

### Layered Architecture

```typescript
// Controller - HTTP layer
export class CampaignController {
  constructor(private campaignService: CampaignService) {}
  
  async create(req: Request, res: Response) {
    const campaign = await this.campaignService.create(req.body, req.tenantId);
    res.status(201).json(campaign);
  }
}

// Service - Business logic
export class CampaignService {
  constructor(private campaignRepo: CampaignRepository) {}
  
  async create(data: CreateCampaignDto, tenantId: string) {
    // Validation, business rules
    return this.campaignRepo.create({ ...data, tenantId });
  }
}

// Repository - Data access
export class CampaignRepository {
  async create(data: Campaign) {
    return prisma.campaign.create({ data });
  }
}
```

---

## Error Handling

### TypeScript

```typescript
// Custom error classes
export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// Service layer
async getCampaign(id: string, tenantId: string): Promise<Campaign> {
  const campaign = await this.repo.findById(id);
  
  if (!campaign) {
    throw new NotFoundError(`Campaign ${id} not found`);
  }
  
  if (campaign.tenantId !== tenantId) {
    throw new UnauthorizedError('Access denied');
  }
  
  return campaign;
}

// Controller/Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred', { error: err.message, stack: err.stack });
  
  if (err instanceof NotFoundError || err instanceof UnauthorizedError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});
```

### Python (FastAPI)

```python
# Custom exceptions
class NotFoundException(Exception):
    def __init__(self, message: str):
        self.message = message

# Exception handlers
@app.exception_handler(NotFoundException)
async def not_found_handler(request: Request, exc: NotFoundException):
    return JSONResponse(
        status_code=404,
        content={"error": exc.message}
    )

# Service usage
def get_campaign(campaign_id: str) -> Campaign:
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise NotFoundException(f"Campaign {campaign_id} not found")
    return campaign
```

---

## Validation

### Input Validation (Zod - TypeScript)

```typescript
import { z } from 'zod';

const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  clientId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type CreateCampaignDto = z.infer<typeof CreateCampaignSchema>;

// In controller
const validated = CreateCampaignSchema.parse(req.body);
```

### Output Validation (Pydantic - Python)

```python
from pydantic import BaseModel, Field

class GenerateIdeasRequest(BaseModel):
    campaign_id: str
    num_posts: int = Field(gt=0, le=100)
    num_reels: int = Field(gt=0, le=50)
    
class PostIdea(BaseModel):
    concept: str
    caption: str
    theme: str

# FastAPI auto-validates
@app.post("/generate")
async def generate_ideas(request: GenerateIdeasRequest) -> List[PostIdea]:
    # Request is already validated
    pass
```

---

## Logging Best Practices

### TypeScript (omnilogs)

```typescript
import { logger } from '@repo/logger';

// Structured logging
logger.info('Campaign created', {
  campaignId: campaign.id,
  tenantId: tenant.id,
  userId: user.id,
});

logger.error('Failed to generate ideas', {
  error: err.message,
  campaignId: campaign.id,
  stack: err.stack,
});
```

### Python (structlog)

```python
from logger import logger

logger.info("campaign_created", 
    campaign_id=campaign.id, 
    tenant_id=tenant.id
)

logger.error("generation_failed", 
    error=str(e), 
    campaign_id=campaign.id
)
```

---

## Testing Standards

### Unit Tests

```typescript
describe('CampaignService', () => {
  let service: CampaignService;
  let mockRepo: jest.Mocked<CampaignRepository>;
  
  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
    } as any;
    service = new CampaignService(mockRepo);
  });
  
  it('should create campaign with tenant isolation', async () => {
    const data = { name: 'Test Campaign', clientId: 'client-1' };
    const tenantId = 'tenant-1';
    
    await service.create(data, tenantId);
    
    expect(mockRepo.create).toHaveBeenCalledWith({
      ...data,
      tenantId,
    });
  });
});
```

---

## Comments

### When to Comment

✅ **DO comment:**
- Complex business logic
- Non-obvious workarounds
- Why a decision was made (not what the code does)
- Public API functions (JSDoc/docstrings)

❌ **DON'T comment:**
- Obvious code
- What the code does (use descriptive names instead)
- Commented-out code (delete it)

### Good Comments

```typescript
// ✅ Explains WHY
// We fetch the full campaign here instead of just the ID because
// the AI service needs the organization profile data which is
// eagerly loaded with the campaign for performance
const campaign = await this.repo.findByIdWithProfile(id);

// ✅ Documents public API
/**
 * Generates content ideas for a campaign using AI
 * @param campaignId - The campaign to generate ideas for
 * @param options - Generation options (num_posts, num_reels)
 * @returns Array of generated ideas with status GENERATED
 * @throws NotFoundError if campaign doesn't exist
 */
async generateIdeas(campaignId: string, options: GenerateOptions): Promise<Idea[]>
```

---

## Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Examples

```
feat(api): add campaign generation endpoint

Implement POST /api/campaigns/:id/generate endpoint that
triggers AI content generation for a specific campaign.

Closes #123
```

```
fix(tenant): prevent cross-tenant data access in campaign queries

Added missing tenant_id filter in CampaignRepository.findById
to prevent users from accessing campaigns outside their tenant.
```

---

**Last Updated:** February 1, 2026
