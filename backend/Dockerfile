# ==============================================================================
# Multi-Stage Dockerfile for Task Manager Backend API & Worker
# Build Context: Root directory of repository (e.g. docker build -f backend/Dockerfile .)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Compile TypeScript
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build essentials for native dependencies if needed
RUN apk add --no-cache python3 make g++

# 1. Copy shared contract & install/compile
COPY shared/package*.json ./shared/
COPY shared/tsconfig.json ./shared/
COPY shared/src ./shared/src
RUN npm --prefix shared install && npm --prefix shared run build

# 2. Copy backend manifests & install dependencies
COPY backend/package*.json ./backend/
COPY backend/tsconfig*.json ./backend/
COPY backend/nest-cli.json ./backend/

WORKDIR /app/backend
RUN npm install

# 3. Copy backend source files & build production bundles
COPY backend/src ./src
RUN npm run build

# Prune development dependencies for minimal footprint
RUN npm prune --production

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Add curl/wget for container healthchecks
RUN apk add --no-cache curl

ENV NODE_ENV=production \
    APP_PORT=3001

# Copy shared compiled package
COPY --from=builder /app/shared/package.json ./shared/package.json
COPY --from=builder /app/shared/dist ./shared/dist

# Copy backend compiled artifacts and production dependencies
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist

WORKDIR /app/backend

# Create non-root system user for secure container execution
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["node", "dist/main.js"]
