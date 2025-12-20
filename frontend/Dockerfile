# =========================
# 1. Dependencies
# =========================
FROM node:20-bullseye AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

# =========================
# 2. Build
# =========================
FROM node:20-bullseye AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DISABLE_TURBOPACK=1
ENV NODE_ENV=production

RUN npm run build

# =========================
# 3. Runner
# =========================
FROM node:20-bullseye AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

RUN groupadd -g 1001 nodejs
RUN useradd -u 1001 -g nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3001

CMD ["npm", "run", "start"]
