# Coolify: Dockerfile build; set NUXT_PUBLIC_* / runtime env in Coolify. Exposes PORT (Coolify injects PORT).

FROM node:22-bookworm-slim AS builder

WORKDIR /app

ENV CI=true

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
