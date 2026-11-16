
# ------------------------------------------------------------------------------
# Stage 1: Build & TypeScript Compilation
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json tsconfig.json ./

RUN npm ci

# Copy backend source code
COPY src ./src

# Compile TypeScript to JavaScript (/app/dist)
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Lean Production Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

# Install dumb-init for proper process supervision and POSIX signal forwarding
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy dependency manifests and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory and ensure non-root 'node' user owns the app directory
RUN mkdir -p /app/uploads && chown -R node:node /app

# Run as non-privileged 'node' user for enhanced container security
USER node

# Expose backend application port
EXPOSE 5000

# Healthcheck using native Node.js fetch against the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 5000) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start application using dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
