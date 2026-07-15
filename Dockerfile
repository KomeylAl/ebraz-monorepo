# Dependencies
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app

# --- Install dependencies ---
FROM base AS deps
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY apps ./apps
COPY packages ./packages
COPY tooling ./tooling
RUN pnpm install

# --- Build ---
FROM deps AS builder
COPY . .
RUN pnpm db:generate
RUN pnpm turbo run build

# --- Production runner base ---
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/tooling ./tooling

# Default command (overridden per service in docker-compose)
CMD ["node", "-e", "console.log('Ebraz Clinic monorepo image ready')"]
