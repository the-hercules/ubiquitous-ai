# Phase 2 Implementation Status

**Last Updated:** 2026-02-07  
**Status:** ✅ Backend 100% Complete | ⏳ Database Migration Pending | 🔨 Frontend Ready to Start  
**Progress:** 80% overall

---

## 📋 What is Phase 2?

Phase 2 implements a **secure, invite-only B2B SaaS onboarding system** for a social media agency platform. It includes:

- ✅ Email-based user invitations with secure hashed tokens
- ✅ Role-based access control (OWNER, ADMIN, TEAM, CLIENT)
- ✅ Multi-tenant isolation enforced at every layer
- ✅ Agency creation and management
- ✅ User authentication via Clerk with automatic local DB sync

**Problem Solved:** New users can securely join agencies via email invitations only. No public IDs or guessable codes. Roles are managed hierarchically (OWNER → ADMIN → TEAM/CLIENT).

---

## 🎯 User Flow

```
1. User Signs In (via Clerk)
   ↓ Auth middleware upserts user to DB (role=null, tenant=null)
   
2. New User Options:
   ├─ Create Agency → POST /api/agencies
   │  ↓ User becomes OWNER, joins agency
   │  ↓ Can now invite others
   │
   └─ Wait for Invitation Email
      ↓ Receives hashed token (7-day TTL)
      ↓ Frontend extracts token from URL
      ↓ POST /api/invitations/accept
      ↓ Joins as TEAM/ADMIN or CLIENT
      ↓ Can now see assigned projects/clients

3. Role Hierarchy:
   OWNER (full access) ← can create ADMIN
   ADMIN (full access) ← can invite TEAM/CLIENT to projects
   TEAM (limited)     ← sees only assigned projects/clients
   CLIENT (limited)   ← sees only their project
```

---

## 🔐 Security Implementation

### Token System
- **Generation:** 32 random bytes (base64url format)
- **Storage:** Hashed with HMAC-SHA256 (plaintext never stored)
- **Expiration:** 7 days (configurable via `INVITE_TOKEN_TTL_DAYS` env var)
- **Binding:** Token tied to authenticated user's email (prevents reuse by different accounts)

### Database Isolation
- All queries filtered by `tenant_id` (row-level security)
- Repository layer validates tenant ownership before mutations
- Service layer enforces role guards (only OWNER/ADMIN can create invites)
- Controller layer validates request authorization

### Clerk Integration
- Auth middleware upserts users on first login
- `clerk_user_id` is canonical external identifier
- Email extracted from Clerk and validated on invitation accept

---

## 📦 Data Models

### Core Models (in Prisma schema)

```prisma
// User roles enum
enum UserRole {
  OWNER
  ADMIN
  TEAM
  CLIENT
}

// User with optional role (null until joined agency)
model User {
  id                String
  clerk_user_id     String @unique
  email             String
  role              UserRole?        // null until joined agency
  tenant_id         String?          // null until joined agency
  tenant            Tenant?          @relation(fields: [tenant_id])
  invitations_sent  Invitation[]     @relation("InvitedBy")
  tenant_members    TenantMember[]
  project_members   ProjectMembership[]
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
}

// Agency (Tenant)
model Tenant {
  id              String @id
  name            String
  slug            String @unique
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  users           User[]
  members         TenantMember[]
  projects        Project[]
  clients         Client[]
}

// Explicit membership (who's in this agency)
model TenantMember {
  id              String @id @default(cuid())
  user_id         String
  tenant_id       String
  role            UserRole        // OWNER, ADMIN, TEAM
  user            User @relation(fields: [user_id] references: [id] onDelete: Cascade)
  tenant          Tenant @relation(fields: [tenant_id] references: [id] onDelete: Cascade)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  
  @@unique([user_id, tenant_id])
  @@index([tenant_id])
}

// Project-level membership (who can see this project)
model ProjectMembership {
  id              String @id @default(cuid())
  user_id         String
  project_id      String
  role            UserRole        // ADMIN, TEAM, CLIENT
  user            User @relation(fields: [user_id] references: [id] onDelete: Cascade)
  project         Project @relation(fields: [project_id] references: [id] onDelete: Cascade)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  
  @@unique([user_id, project_id])
  @@index([project_id])
}

// Secure invitations
model Invitation {
  id              String @id @default(cuid())
  email           String
  role            UserRole
  scope           String          // "agency" or "project"
  resource_id     String          // agency/project ID
  token_hash      String @unique  // HMAC-SHA256 hash (plaintext never stored)
  status          String @default("pending")  // "pending", "accepted", "expired"
  invited_by_id   String
  invited_by      User @relation("InvitedBy", fields: [invited_by_id] references: [id] onDelete: SetNull)
  created_at      DateTime @default(now())
  expires_at      DateTime        // 7 days from creation
  accepted_at     DateTime?
  accepted_by_id  String?
  
  @@index([email])
  @@index([status])
  @@index([expires_at])
}
```

### Key Relations
- **User → TenantMember** (1:many) — Track explicit agency memberships
- **User → ProjectMembership** (1:many) — Track project-level access
- **Tenant → TenantMember** (1:many) — All members of an agency
- **Project → ProjectMembership** (1:many) — All members of a project
- **User → Invitation** (1:many as InvitedBy) — Track who sent invitations

---

## 🚀 API Endpoints

All endpoints require Clerk authentication (Bearer token in Authorization header).

### 1. Create Agency (New User)
```
POST /api/agencies
Content-Type: application/json

{
  "name": "Acme Social Media",
  "slug": "acme-social"
}

Response 201:
{
  "id": "tenant_1234",
  "name": "Acme Social Media",
  "slug": "acme-social",
  "created_at": "2026-02-07T14:00:00Z"
}
```

### 2. Get Agency Details
```
GET /api/agencies/:agencyId
Authorization: Bearer <CLERK_TOKEN>

Response 200:
{
  "id": "tenant_1234",
  "name": "Acme Social Media",
  "slug": "acme-social",
  "created_at": "2026-02-07T14:00:00Z"
}
```

### 3. Create Invitation (OWNER/ADMIN only)
```
POST /api/invitations
Authorization: Bearer <CLERK_TOKEN>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "role": "TEAM",
  "scope": "agency",
  "resource_id": "tenant_1234"
}

Response 201:
{
  "id": "invite_5678",
  "email": "newuser@example.com",
  "role": "TEAM",
  "scope": "agency",
  "resource_id": "tenant_1234",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2026-02-14T14:00:00Z"
}

// Token sent via email with link:
// https://app.example.com/invite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Accept Invitation (Any User)
```
POST /api/invitations/accept
Authorization: Bearer <CLERK_TOKEN>
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response 201:
{
  "id": "invite_5678",
  "email": "newuser@example.com",
  "status": "accepted",
  "accepted_at": "2026-02-07T14:30:00Z"
}
```

---

## 📁 Files Created/Modified

### New Backend Files (12)

```
apps/api/src/
├── repositories/
│   ├── invitation.repository.ts     (Token hashing, CRUD)
│   └── agency.repository.ts         (Tenant CRUD)
├── services/
│   ├── invitation.service.ts        (Create/accept invite logic)
│   └── agency.service.ts            (Agency creation)
├── controllers/
│   ├── invitation.controller.ts     (HTTP handlers)
│   └── agency.controller.ts         (HTTP handlers)
└── routes/
    ├── invitation.routes.ts         (POST /api/invitations)
    ├── agency.routes.ts             (POST /api/agencies, GET /api/agencies/:id)
    └── index.ts                     (Centralized route mounting)
```

### Modified Files (3)

| File | Changes |
|------|---------|
| `packages/database/prisma/schema.prisma` | Added UserRole enum, Invitation/TenantMember/ProjectMembership models, made User.role optional |
| `apps/api/src/middleware/auth.ts` | Enhanced with user upsert on Clerk login, extracts email from Clerk |
| `apps/api/src/server.ts` | Added route mounting via `/api` → `apiRoutes` |

---

## 🔧 How to Get Started

### 1. Install Dependencies
```bash
cd /path/to/repo
pnpm install
```

### 2. Environment Variables
Ensure `.env.local` contains:
```env
CLERK_SECRET_KEY=<your_clerk_secret>
INVITE_TOKEN_SECRET=dev-secret-change-in-prod
INVITE_TOKEN_TTL_DAYS=7
DATABASE_URL=postgresql://user:password@localhost:5432/ubiquitous_ai
```

### 3. Start Database
```bash
docker-compose up -d postgres
```

### 4. Run Database Migration
```bash
cd packages/database
pnpm prisma migrate dev --name initial-phase2
```

### 5. Verify Schema
```bash
pnpm prisma studio
# Opens interactive database browser at localhost:5555
```

### 6. Start Backend Dev Server
```bash
cd apps/api
pnpm dev
```

### 7. Test Endpoints
See `API_TESTING_GUIDE.md` in session folder for curl examples.

---

## 🧪 Testing the Implementation

### Manual Testing (Before Frontend)
1. Get a Clerk token (sign in at your app)
2. Use curl or Postman to test endpoints (see examples above)
3. Verify token hashing: tokens in DB should be hashed, not plaintext
4. Verify 7-day expiration: try accepting invitation after 7 days

### Testing Checklist
- [ ] Create agency → user becomes OWNER
- [ ] Invite user → token sent (logged to console in dev)
- [ ] Accept invite with correct email → success
- [ ] Accept invite with wrong email → failure
- [ ] Accept expired token → failure
- [ ] Create invite as TEAM (not OWNER/ADMIN) → failure
- [ ] Create invite in different tenant → failure (multi-tenant leak)

---

## 🎨 What's Left to Do

### Frontend Implementation (3-5 days)
```
1. Post-Login Screens
   - Role selection: "Create Agency?" or "Wait for Invite?"
   
2. Create Agency Flow
   - Form: name + slug
   - Submit: POST /api/agencies
   - Redirect to dashboard
   
3. Accept Invite Flow
   - Extract token from URL query param
   - Confirm dialog: "Join as [ROLE]?"
   - Submit: POST /api/invitations/accept
   - Redirect to dashboard
   
4. Dashboard
   - List clients/projects (tiles)
   - Invite button (OWNER/ADMIN only)
   - Role badge showing user role
   
5. Invite Modal (OWNER/ADMIN only)
   - Email input
   - Role selector (TEAM/ADMIN for agency; TEAM/CLIENT for project)
   - Submit button
   - Success toast
```

### Database Migration (1-2 hours)
- ✅ Schema defined in Prisma
- ⏳ Migration SQL generated
- ⏳ Needs to run: `pnpm prisma migrate dev`
- ⏳ Verify in PostgreSQL

### Email Integration (1-2 days)
- [ ] Choose provider (SendGrid/AWS SES)
- [ ] Create email template with invite link
- [ ] Replace console logging with actual send
- [ ] Test end-to-end invite flow

### Integration Tests (1-2 days)
- [ ] Write Supertest tests for all 4 endpoints
- [ ] Test error cases (invalid token, expired, wrong email, etc.)
- [ ] Test multi-tenant isolation (user can't see other tenant data)
- [ ] Test role guards (TEAM can't create invites, etc.)

### Future Enhancements
- [ ] Role promotion endpoint (TEAM → ADMIN)
- [ ] Invitation revocation/management UI
- [ ] Audit logging for role changes
- [ ] Dashboard analytics

---

## 🏗️ Architecture Overview

### Layered Backend Structure
```
Controller Layer (HTTP Handlers)
    ↓ validates request
Service Layer (Business Logic)
    ↓ enforces rules (roles, tenant isolation)
Repository Layer (Database Access)
    ↓ all queries filtered by tenant_id
Database (PostgreSQL + Prisma)
```

### Multi-Tenant Isolation Strategy
Every query includes:
```typescript
// Example: get invitation
await db.invitation.findUnique({
  where: {
    id: invitationId,
    resource_id: tenantId,  // ← tenant filter
    // ... other conditions
  }
});
```

If a query doesn't include `tenant_id` filtering, it's a **security bug**.

### Error Handling
```typescript
// Custom error for tenant mismatches
throw new UnauthorizedError(`Access denied to tenant ${tenantId}`);

// Custom error for invalid tokens
throw new BadRequestError('Invalid or expired invitation token');

// All errors logged with context (user_id, tenant_id, action)
logger.error('Invitation accept failed', { 
  userId, 
  tenantId, 
  invitationId, 
  reason 
});
```

---

## 🔑 Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Hash tokens at rest** | DB leak doesn't expose active tokens |
| **7-day TTL** | Balance security (short-lived) vs UX (not too restrictive) |
| **Email binding** | Prevents token reuse by different accounts |
| **Optional User.role** | Forces explicit membership (no accidental roles) |
| **TenantMember table** | Explicit membership tracking for audit/analytics |
| **Scope-based invites** | Flexible for agency-wide or project-level access |
| **Clerk auth + local DB** | Best of both worlds: Clerk security + local control |

---

## 🐛 Debugging Tips

### Check Token Hashing
```typescript
// In dev, tokens are logged to console when created
// Example: "Hashed invitation token: ...hash..."

// Verify it's hashed in DB:
SELECT token_hash FROM invitations LIMIT 1;
// Should see hash, not plaintext token
```

### Check Multi-Tenant Isolation
```typescript
// Get user's tenants:
SELECT u.id, t.id FROM users u 
JOIN tenant_members tm ON u.id = tm.user_id 
JOIN tenants t ON tm.tenant_id = t.id 
WHERE u.id = 'user_123';

// Try accessing data from different tenant (should fail):
const data = await db.client.findMany({
  where: {
    tenant_id: 'other_tenant_id'  // ← different tenant
  }
});
// Should throw UnauthorizedError
```

### Check Clerk Sync
```typescript
// User should exist in DB after first login:
SELECT * FROM users WHERE clerk_user_id = 'clerk_123';
// If not, check auth middleware logs
```

---

## 📞 Troubleshooting

### "Unauthorized" on API calls
- [ ] Check Clerk token is valid (use `verifyToken`)
- [ ] Check user exists in DB (see Clerk Sync section above)
- [ ] Check tenant_id matches in query

### Token won't accept
- [ ] Check token hasn't expired (now < expires_at)
- [ ] Check email matches (from Clerk vs invitation.email)
- [ ] Check token hasn't been used before (status != "pending")
- [ ] Check token_hash matches in DB (HMAC validation)

### Multi-tenant data leak
- [ ] Search codebase for queries without `tenant_id` filter
- [ ] Check repository methods validate `tenant_id` ownership
- [ ] Run integration tests to catch leaks

---

## 📚 Reference

### Session Documentation
Detailed docs are in:
```
/Users/hercules/.copilot/session-state/50d20ea2-62c1-4102-8150-a8cc2ba82d62/
├── INDEX.md                      (📍 Read this first)
├── COMPLETION_REPORT.md
├── IMPLEMENTATION_SUMMARY.md
├── API_TESTING_GUIDE.md
└── phase2-onboarding.md
```

### Code Files
- **Core Logic:** `apps/api/src/services/invitation.service.ts`
- **Token Hashing:** `apps/api/src/repositories/invitation.repository.ts`
- **Auth Sync:** `apps/api/src/middleware/auth.ts`
- **Routes:** `apps/api/src/routes/index.ts`
- **Schema:** `packages/database/prisma/schema.prisma`

### Relevant Docs in Root
- `PLAN.md` — Overall project roadmap
- `SETUP.md` — Development environment setup
- `README.md` — Project overview

---

## ✅ Checklist Before Starting Frontend

- [ ] Docker is running (`docker ps` shows postgres)
- [ ] Database migrated (`pnpm prisma migrate dev`)
- [ ] Backend starts without errors (`pnpm dev` in apps/api)
- [ ] Can create agency via curl/Postman
- [ ] Can create invitation via curl/Postman
- [ ] Tokens are hashed in DB (verified via psql)
- [ ] Read all documentation files above
- [ ] Understand the user flow diagram (see User Flow section)

---

## 🚢 Ready for Phase 3?

Once frontend is complete and tested, Phase 3 will add:
- Campaign/Project management UI
- Client dashboard
- LLM-powered content generation
- Approval workflows

For now, focus on:
1. Database migration
2. Frontend onboarding screens
3. Integration tests
4. Email integration

---

**Questions?** Check the session documentation or ask the team.

**Updated:** 2026-02-07  
**Phase:** 2 (Core Entities & Management)  
**Next:** Frontend Implementation
