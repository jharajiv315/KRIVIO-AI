# ==============================================================================
# KRIVIO AI — PRODUCTION CONTAINER SPECIFICATION (Google Cloud Run / OCI / Docker)
# Multi-stage minimal Node.js 20 production runtime
# ==============================================================================

# --- STAGE 1: Build & Bundle ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies needed for compilation & bundling
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Compile TypeScript and bundle server to dist/server.cjs via esbuild
RUN npm run build:server

# --- STAGE 2: Minimal Production Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install ONLY production runtime dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy bundled server from builder stage
COPY --from=builder /app/dist/server.cjs ./dist/server.cjs

# Cloud Run dynamic port injection (defaults to 8080)
EXPOSE 8080

# Run as non-root user for container security
USER node

# Launch production server
CMD ["node", "dist/server.cjs"]
