FROM oven/bun:1.2.5 AS BUILDER

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# NEXT_PUBLIC args go here for build-time.

ENV NODE_OPTIONS='--max-old-space-size=8192'
ENV NEXT_CPU_COUNT=$(nproc)

RUN bun --bun next build

FROM oven/bun:1.2.5-alpine

ARG APPLICATION_PORT
ENV PORT=${APPLICATION_PORT}
ENV HOSTNAME=0.0.0.0

COPY --from=BUILDER /app/.next/standalone ./
COPY --from=BUILDER /app/.next/static ./.next/static
COPY --from=BUILDER /app/public ./public

EXPOSE ${PORT}

CMD ["bun", "server.js"]