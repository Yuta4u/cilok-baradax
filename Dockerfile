# ===== BUILD STAGE =====
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build


# ===== PRODUCTION STAGE =====
FROM oven/bun:1-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY tsconfig.json ./

EXPOSE 3002

CMD ["bun", "dist/main.js"]
