# Use official LTS Node.js runtime
FROM node:20-alpine AS base

# Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies first for Docker caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source and prisma schema
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose backend port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "src/server.js"]
