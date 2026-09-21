#!/usr/bin/env bash
#
# Build the standalone bundle and deploy it to the server over rsync.
#
# SAFE BY DESIGN: the database (data.db*) and the uploads folder (storage/)
# are NEVER synced or deleted on the server, even with --delete. Keep them in a
# persistent location (e.g. /var/lib/pilkospapi) and point DATABASE_PATH and
# STORAGE_DIR there via the server's .env.
#
# Usage:
#   scripts/deploy.sh                        # build + rsync
#   scripts/deploy.sh --no-build             # skip build, just rsync
#   scripts/deploy.sh --restart              # also restart the systemd service
#
# Configure (env vars or edit the defaults below):
#   DEPLOY_HOST=twizz@43.156.14.234
#   DEPLOY_PATH=/var/www/osis-sma
#   DEPLOY_SERVICE=osis-sma        # systemd unit name for --restart
#
set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-twizz@43.156.14.234}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/osis-sma}"
DEPLOY_SERVICE="${DEPLOY_SERVICE:-osis-sma}"

SRC=".next/standalone/"
DEST="${DEPLOY_HOST}:${DEPLOY_PATH}/"

DO_BUILD=1
DO_RESTART=0
for arg in "$@"; do
  case "$arg" in
    --no-build) DO_BUILD=0 ;;
    --restart)  DO_RESTART=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

cd "$(dirname "$0")/.."

if [[ "$DO_BUILD" == "1" ]]; then
  echo "==> Building standalone bundle"
  bun run build:standalone
fi

if [[ ! -f "${SRC}server.js" ]]; then
  echo "✗ ${SRC}server.js not found. Run without --no-build first." >&2
  exit 1
fi

echo "==> Syncing ${SRC} → ${DEST}"
# --delete keeps the server in sync with the build, while the excludes below
# guarantee the database, uploads and env file are never touched on the server.
rsync -avz --delete \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='data.db' \
  --exclude='data.db-shm' \
  --exclude='data.db-wal' \
  --exclude='storage/' \
  "$SRC" "$DEST"

echo "==> Deploy finished"

# ---------------------------------------------------------------------------
# Safety check: warn if the server's database/storage live INSIDE the deploy
# directory (an rsync with --delete would then be dangerous if excludes change).
# ---------------------------------------------------------------------------
echo "==> Verifying server data paths"
SERVER_ENV="$(ssh "$DEPLOY_HOST" "cat '${DEPLOY_PATH}/.env' 2>/dev/null" || true)"
if [[ -z "$SERVER_ENV" ]]; then
  echo "⚠  No .env found at ${DEPLOY_PATH}/.env on the server."
  echo "   Create one so DATABASE_PATH / STORAGE_DIR point OUTSIDE ${DEPLOY_PATH}."
else
  DB_PATH="$(printf '%s\n' "$SERVER_ENV" | grep -E '^DATABASE_PATH=' | cut -d= -f2- || true)"
  ST_PATH="$(printf '%s\n' "$SERVER_ENV" | grep -E '^STORAGE_DIR=' | cut -d= -f2- || true)"
  for p in "$DB_PATH" "$ST_PATH"; do
    [[ -z "$p" ]] && continue
    case "$p" in
      *"$DEPLOY_PATH"*) echo "⚠  Data path '$p' is INSIDE ${DEPLOY_PATH} — move it out to be safe." ;;
    esac
  done
  echo "   DATABASE_PATH=${DB_PATH:-<unset>}"
  echo "   STORAGE_DIR=${ST_PATH:-<unset>}"
fi

if [[ "$DO_RESTART" == "1" ]]; then
  echo "==> Restarting service: ${DEPLOY_SERVICE}"
  ssh "$DEPLOY_HOST" "sudo systemctl restart ${DEPLOY_SERVICE}"
  echo "==> Service restarted"
else
  echo
  echo "Next: restart the app on the server, e.g."
  echo "  ssh ${DEPLOY_HOST} 'sudo systemctl restart ${DEPLOY_SERVICE}'"
fi
