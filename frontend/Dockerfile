# ==============================================================================
# CureHealth Frontend - Production Multi-Stage Dockerfile
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Vite bundling (baked into client bundle during build)
ARG VITE_API_BASE_URL=/api
ARG VITE_RAZORPAY_KEY_ID=rzp_test_TLLJHoZKSG6nBe

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

# Copy dependency manifests
COPY package*.json ./

RUN npm ci

COPY . .

# Build production bundle with Vite
RUN npx vite build

# ------------------------------------------------------------------------------
# Stage 2: Production Nginx Server
# ------------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets and configuration
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom Nginx production configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Healthcheck for Nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/nginx-health || exit 1

# Start Nginx with smart URL resolution (reads BACKEND_URL or VITE_API_BASE_URL, strips /api, defaults to http://backend:5000)
CMD ["/bin/sh", "-c", "TARGET_URL=\"${BACKEND_URL:-${VITE_API_BASE_URL:-http://backend:5000}}\"; TARGET_URL=$(echo \"$TARGET_URL\" | sed -e 's|/api/*$||' -e 's|/*$||'); sed -i \"s|__BACKEND_URL__|$TARGET_URL|g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
