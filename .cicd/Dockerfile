FROM oven/bun:1.2.5 AS BUILDER

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .


ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PRIVATE_STANDALONE=true \
    NEXT_DISABLE_SOURCEMAPS=true

# These two are passed as non container ENV intentionally.
RUN NODE_OPTIONS='--max-old-space-size=8192' \
    NEXT_CPU_COUNT=$(nproc) \
    bun --bun next build

FROM oven/bun:1.2.5-alpine

WORKDIR /app

ENV HOSTNAME=0.0.0.0 \
    NODE_ENV=production

COPY --from=BUILDER /app/.next/standalone ./
COPY --from=BUILDER /app/.next/static ./.next/static
COPY --from=BUILDER /app/public ./public

EXPOSE ${PORT}

CMD ["bun", "server.js"]