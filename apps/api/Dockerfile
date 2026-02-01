ARG NODE_VERSION=24.13.1
FROM node:${NODE_VERSION}-alpine AS base

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

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Copy built application
COPY --from=builder --chown=expressjs:expressjs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=expressjs:expressjs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=expressjs:expressjs /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
