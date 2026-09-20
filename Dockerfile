# syntax=docker/dockerfile:1

###############################################################################
# Single base image for all stages (oven/bun) so the Node ABI used to compile
# native modules (better-sqlite3, sharp) matches the runtime exactly.
###############################################################################

# ---- deps: install dependencies (incl. native builds for better-sqlite3/sharp)
FROM oven/bun:1.4.2-debian AS deps
WORKDIR /app

# Build toolchain for native modules (better-sqlite3, sharp).
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- builder: compile the Next.js standalone output
FROM oven/bun:1.4.2-debian AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

# ---- runner: minimal runtime image (same base as builder for native ABI match)
FROM oven/bun:1.4.2-debian AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_PATH=/data/data.db
ENV STORAGE_DIR=/data/storage

# Create a writable data directory (default image runs as root; drop privileges).
RUN mkdir -p /data/storage && chown -R bun:bun /data

# Standalone server + static assets + migrations (needed at runtime by ensureDb).
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static
COPY --from=builder --chown=bun:bun /app/public ./public
COPY --from=builder --chown=bun:bun /app/drizzle ./drizzle

USER bun
EXPOSE 3000

CMD ["bun", "server.js"]
