# System Architecture Overview

## High-Level Architecture

This is a **microservices-based multi-tenant SaaS application** designed for social media agencies to manage campaigns and generate AI-powered content ideas.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Admin     │  │   Agency    │  │   Client    │        │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│                    (apps/web - Port 3000)                    │
│  • Server Components                                         │
│  • Client Components                                         │
│  • Clerk Authentication                                      │
│  • Role-based routing                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express Backend API                        │
│                    (apps/api - Port 3001)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers │→ │   Services   │→ │ Repositories │      │
│  └─────────────┘  └──────────────┘  └──────┬───────┘      │
│                                              │               │
│  • Clerk JWT validation                     │               │
│  • Multi-tenant middleware                  │               │
│  • Business logic                           │               │
└─────────────────────────┬───────────────────┼──────────────┘
                          │                   │
                          │ HTTP              │ Prisma
                          │                   ▼
                          │          ┌──────────────────┐
                          │          │   PostgreSQL     │
                          │          │  (Port 5432)     │
                          │          │                  │
                          │          │ • Multi-tenant   │
                          │          │ • Row-level      │
                          │          │   isolation      │
                          │          └──────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               Python FastAPI AI Service                      │
│                (apps/ai-service - Port 8800)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Prompt     │  │   Context    │  │     LLM      │     │
│  │  Templates   │→ │   Builder    │→ │  Integration │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  • OpenAI API / LangChain                                   │
│  • Structured output parsing (Pydantic)                     │
│  • Token tracking                                           │
└─────────────────────────────────────────────────────────────┘
```

## Service Details

### 1. Frontend Service (Next.js)

**Technology:** Next.js 14 with App Router, TypeScript, React 18

**Responsibilities:**
- Render role-based dashboards
- Handle user interactions
- Client-side state management (TanStack Query)
- Form validation (Zod)
- UI components (Shadcn/ui)

**Key Features:**
- Server-side rendering (SSR)
- Static generation where possible
- Optimistic UI updates
- Error boundaries

**Port:** 3000

---

### 2. Backend API Service (Express)

**Technology:** Node.js, Express, TypeScript

**Architecture Pattern:** Layered (Controllers → Services → Repositories)

**Responsibilities:**
- Business logic orchestration
- Database operations (via Prisma)
- Authentication & authorization
- Tenant isolation enforcement
- API request validation
- Calling AI service

**Key Components:**

#### Controllers
- Handle HTTP requests/responses
- Input validation
- Error handling
- Response formatting

#### Services
- Business logic
- Cross-entity operations
- Transaction management
- External service calls (AI service)

#### Repositories
- Database abstraction
- CRUD operations
- Query optimization
- Automatic tenant filtering

**Port:** 3001

---

### 3. AI Service (Python FastAPI)

**Technology:** Python 3.13, FastAPI, uvicorn

**Responsibilities:**
- LLM interactions (OpenAI API)
- Prompt template management
- Context assembly
- Response parsing and validation
- Token usage tracking

**Key Components:**

#### Prompt Templates
- Versioned templates
- Jinja2 variables
- Separate for Posts vs Reels

#### Context Builder
- Fetches campaign data from Backend API
- Assembles structured prompts
- Injects brand voice and tone

#### LLM Integration
- OpenAI SDK or LangChain
- Retry logic (tenacity)
- Rate limiting
- Error handling

#### Response Parser
- Pydantic models for validation
- Structured JSON output
- Error recovery

**Port:** 8800

---

## Data Flow Examples

### Example 1: Campaign Creation

```
1. User (Agency) → Frontend: Create Campaign form
2. Frontend → Backend API: POST /api/campaigns
3. Backend validates request + tenant_id
4. Backend → Database: INSERT campaign record
5. Database → Backend: Success
6. Backend → Frontend: 201 Created
7. Frontend: Update UI, show success
```

### Example 2: AI Content Generation

```
1. Agency → Frontend: Trigger "Generate Ideas"
2. Frontend → Backend: POST /api/campaigns/:id/generate
3. Backend validates + fetches campaign data from DB
4. Backend → AI Service: POST /api/v1/generate
   {
     campaign_id: "...",
     context: { brand_tone, themes, num_posts, num_reels, ... }
   }
5. AI Service → OpenAI: Structured prompt
6. OpenAI → AI Service: Generated ideas (JSON)
7. AI Service parses & validates → Backend
8. Backend → Database: INSERT ideas with status=GENERATED
9. Backend → Frontend: 200 OK with idea IDs
10. Frontend: Redirect to review page
```

### Example 3: Client Approval

```
1. Client → Frontend: Approve idea
2. Frontend → Backend: PATCH /api/ideas/:id
   { status: "CLIENT_APPROVED" }
3. Backend: Verify client has access to this idea
4. Backend: Check status transition is valid
5. Backend → Database: UPDATE idea status
6. Database → Backend: Success
7. Backend → Frontend: 200 OK
8. Frontend: Update UI, show checkmark
```

---

## Multi-Tenancy Implementation

### Row-Level Isolation

Every tenant-scoped table has a `tenant_id` column:

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  ...
);

-- Index for performance
CREATE INDEX idx_clients_tenant_id ON clients(tenant_id);
```

### Middleware Enforcement (Express)

```typescript
// Pseudo-code
app.use(async (req, res, next) => {
  const token = req.headers.authorization;
  const user = await validateClerkToken(token);
  
  req.user = user;
  req.tenantId = user.tenantId;
  
  next();
});
```

### Prisma Client Extension

```typescript
// Automatic tenant filtering
prisma.$extends({
  query: {
    $allModels: {
      async findMany({ args, query }) {
        args.where = { ...args.where, tenant_id: req.tenantId };
        return query(args);
      },
    },
  },
});
```

---

## Communication Protocols

### Current (MVP): HTTP REST

- Simple, stateless
- Easy to debug
- Works with existing tools
- Standard HTTP status codes

### Future: Message Queue

For scaling, can add:
- **RabbitMQ** or **Redis Pub/Sub**
- Asynchronous AI generation
- Event-driven updates
- Better decoupling

---

## Security Architecture

### Authentication Flow

```
1. User → Clerk: Login
2. Clerk → Frontend: JWT token
3. Frontend → Backend: Request with JWT in header
4. Backend: Validate JWT with Clerk
5. Backend: Extract user_id, tenant_id, role
6. Backend: Process request with tenant isolation
```

### Authorization Layers

1. **Frontend:** Hide UI elements based on role
2. **Backend:** Validate role permissions on every endpoint
3. **Database:** Row-level security via tenant_id

---

## Scalability Considerations

### Horizontal Scaling

- **Frontend:** Deploy multiple Next.js instances behind load balancer
- **Backend API:** Stateless, can scale horizontally
- **AI Service:** Scale based on LLM request load
- **Database:** PostgreSQL with read replicas

### Caching Strategy

- **Frontend:** Next.js built-in caching, CDN for static assets
- **Backend:** Redis for session data, API response caching
- **Database:** Query result caching, connection pooling

### Performance Optimization

- Database indexing on `tenant_id`, foreign keys
- Lazy loading in frontend
- Pagination for list endpoints
- Background jobs for AI generation (future)

---

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────┐
│              Load Balancer                  │
└────────┬─────────────────┬──────────────────┘
         │                 │
    ┌────▼────┐       ┌────▼────┐
    │ Next.js │       │ Next.js │
    │Instance │       │Instance │
    └────┬────┘       └────┬────┘
         │                 │
    ┌────▼─────────────────▼────┐
    │      API Gateway           │
    └────┬────────────────┬──────┘
         │                │
    ┌────▼────┐      ┌────▼────┐
    │ Express │      │ FastAPI │
    │   API   │      │   AI    │
    └────┬────┘      └─────────┘
         │
    ┌────▼────┐
    │PostgreSQL│
    │ Primary  │
    │   + Read │
    │ Replicas │
    └──────────┘
```

---

## Monitoring & Observability

### Logging

- **omnilogs** (Frontend, Backend)
- **Python structlog** (AI Service)
- Centralized log aggregation (future: Loki, ELK)

### Metrics

- Request/response times
- Error rates
- LLM token usage
- Database query performance

### Tracing

- Request IDs across services
- Distributed tracing (future: OpenTelemetry)

---

**Last Updated:** February 1, 2026
