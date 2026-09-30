# ==========================================
# ForexAI Analyzer - Backend Production Dockerfile
# Multi-stage production build for Node.js LTS
# ==========================================

# Stage 1: Dependencies installation
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies if needed
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Production runtime image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Add non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 forexuser

# Copy installed production node_modules from deps stage
COPY --from=deps --chown=forexuser:nodejs /app/node_modules ./node_modules
COPY --chown=forexuser:nodejs . .

# Set active user to non-root
USER forexuser

EXPOSE 5001

# Healthcheck to ensure API responsiveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1

CMD ["node", "src/server.js"]
