FROM node:24-alpine as base

FROM base AS prepare
WORKDIR /app
RUN npm install -g turbo pnpm
COPY . .
RUN turbo prune api --docker

FROM base AS builder
WORKDIR /app

# Install dependencies
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build the project
COPY --from=prepare /app/out/full/ .
RUN pnpm turbo build --filter=api

FROM node:24-alpine AS runner
WORKDIR /app

# Install pnpm
RUN corepack enable pnpm

# Copy package files for production install
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/logger/dist ./packages/logger/dist
COPY --from=builder /app/packages/logger/package.json ./packages/logger/package.json

# Don't run production as root
RUN addgroup --system --gid 1001 expressjs && \
    adduser --system --uid 1001 expressjs && \
    chown -R expressjs:expressjs /app

USER expressjs

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
