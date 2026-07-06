# Highway Hoppers backend — Express + TypeScript + Prisma
FROM node:22-bookworm-slim

# bcrypt native build (python3/make/g++) + prisma runtime (openssl)
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Disable husky git hooks inside the image
ENV HUSKY=0

# Install deps first for better layer caching.
# Copy prisma schema too so the `postinstall` (prisma generate) can find it.
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --no-audit --no-fund

# App source
COPY . .

EXPOSE 5000

# Apply migrations (non-fatal — DB may already be migrated / pooled endpoint),
# then start the server (transpile-only, so it never dies on a tsc type error).
CMD ["sh", "-c", "npx prisma migrate deploy || echo 'migrate skipped'; npm run dev"]
