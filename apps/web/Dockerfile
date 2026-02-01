FROM node:24-alpine as base

FROM base AS prepare
# Set working directory
WORKDIR /app
RUN npm install -g turbo pnpm
COPY . .
RUN turbo prune web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS builder
WORKDIR /app

# Install dependencies
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build the project
COPY --from=prepare /app/out/full/ .

# Set build-time environment variables
# IMPORTANT: These are required for Next.js build (especially for Clerk)
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Fail fast if required env vars are missing
RUN test -n "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" || (echo "ERROR: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required for build" && exit 1)

RUN pnpm turbo build --filter=web

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=3000
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy built files
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
