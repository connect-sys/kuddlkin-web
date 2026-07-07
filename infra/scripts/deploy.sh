#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — pull, build, and (re)start the whole stack. Run on the VM from the
# repo root:   bash infra/scripts/deploy.sh
#
# Steps: git pull → pnpm install → project env → build customer+partner →
# publish partner static → pm2 reload. The backend has no build step.
# Zero-downtime: `pm2 reload` restarts workers one at a time.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "▸ [1/6] git pull"
git pull --ff-only

echo "▸ [2/5] pnpm install (frozen lockfile)"
pnpm install --frozen-lockfile

# No env projection step: both apps read the SINGLE root .env directly
# (customer via next.config dotenv, partner via vite envDir).

echo "▸ [3/5] building customer (Next) + partner (Vite)"
pnpm build:customer
pnpm build:partner

# Partner is served statically by NGINX from apps/partner/dist — vite build already
# wrote it there, so nothing to copy. (Kept explicit for clarity / future CDN sync.)
echo "▸ [4/5] partner static build at apps/partner/dist ($(ls apps/partner/dist 2>/dev/null | wc -l | tr -d ' ') entries)"

echo "▸ [5/5] pm2 reload"
if pm2 describe kuddl-backend >/dev/null 2>&1; then
  pm2 reload infra/pm2/ecosystem.config.cjs
else
  pm2 start infra/pm2/ecosystem.config.cjs
fi
pm2 save

echo "✅ deploy.sh done."
echo "   API health:  curl -s http://127.0.0.1:5000/health"
echo "   Customer:    curl -sI http://127.0.0.1:3000 | head -1"
