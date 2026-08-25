# ==========================================
# 1. Base image
# ==========================================
FROM node:24-alpine AS base
WORKDIR /app

# ==========================================
# 2. Dependencies stage
# ==========================================
FROM base AS dependencies
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

# ==========================================
# 3. Build stage
# ==========================================
FROM dependencies AS build
COPY . .
RUN node ace build

# ==========================================
# 4. Production dependencies stage
# ==========================================
FROM base AS production-dependencies
RUN apk add --no-cache python3 make g++
WORKDIR /app/build
COPY --from=build /app/build/package.json /app/build/package-lock.json ./
RUN npm ci --omit=dev

# ==========================================
# 5. Final runtime image
# ==========================================
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

# Add dumb-init or create non-root user for security
RUN apk add --no-cache dumb-init

# Copy built application and production dependencies
COPY --from=build /app/build /app
COPY --from=production-dependencies /app/build/node_modules /app/node_modules

# Create directory for SQLite / runtime tmp files with proper permissions
RUN mkdir -p /app/tmp && chown -R node:node /app

USER node
EXPOSE 3333

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "node ace migration:run --force && node ace db:seed && node bin/server.js"]

