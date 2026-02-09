# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create uploads directory with proper permissions before switching to node user
RUN mkdir -p /app/uploads && chown -R node:node /app

# node:alpine image already has 'node' user, just use it
USER node

EXPOSE 3000

CMD ["node", "dist/main"]
