# ==============================================================================
# Multi-Stage Dockerfile for Task Manager Frontend SPA
# Build Context: Root directory of repository (e.g. docker build -f frontend/Dockerfile .)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Compile Vite Bundle
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy shared contract
COPY shared/package*.json ./shared/
COPY shared/tsconfig.json ./shared/
COPY shared/src ./shared/src
RUN npm --prefix shared install && npm --prefix shared run build

# 2. Copy frontend manifests & install dependencies
COPY frontend/package*.json ./frontend/

WORKDIR /app/frontend
RUN npm install

# 3. Copy frontend source files & build distribution bundle
COPY frontend/index.html ./
COPY frontend/vite.config.ts ./
COPY frontend/tsconfig*.json ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./
COPY frontend/src ./src

RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Nginx Serving
# ------------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
