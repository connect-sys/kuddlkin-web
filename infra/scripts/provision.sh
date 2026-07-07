#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# provision.sh — one-time bootstrap of a fresh Ubuntu 22.04/24.04 Compute Engine VM.
# Installs: Node 20, pnpm, PM2, PostgreSQL 16, NGINX, Certbot.
# Run as a sudo-capable user ON THE VM:  sudo bash infra/scripts/provision.sh
# Idempotent-ish: safe to re-run; skips what's already present.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

echo "▸ apt update + base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git build-essential ca-certificates gnupg ufw

# ── Node 20 (NodeSource) ─────────────────────────────────────────────────────
if ! command -v node >/dev/null || [[ "$(node -v)" != v20* ]]; then
  echo "▸ Installing Node 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# ── pnpm + PM2 ───────────────────────────────────────────────────────────────
echo "▸ Installing pnpm + pm2 (global)"
npm install -g pnpm@11.9.0 pm2

# ── PostgreSQL 16 ────────────────────────────────────────────────────────────
if ! command -v psql >/dev/null; then
  echo "▸ Installing PostgreSQL"
  apt-get install -y postgresql postgresql-contrib
  systemctl enable --now postgresql
fi

# ── NGINX + Certbot ──────────────────────────────────────────────────────────
echo "▸ Installing NGINX + Certbot"
apt-get install -y nginx certbot python3-certbot-nginx
systemctl enable --now nginx

# ── Directories ──────────────────────────────────────────────────────────────
echo "▸ Creating app + log directories"
mkdir -p /var/www/kuddlkin
mkdir -p /var/log/kuddlkin
# Hand the app dir to the deploy user (the user running this, via sudo).
DEPLOY_USER="${SUDO_USER:-$USER}"
chown -R "$DEPLOY_USER":"$DEPLOY_USER" /var/www/kuddlkin /var/log/kuddlkin

# ── Firewall (host-level; GCP firewall rules are separate, see create-vm.sh) ──
echo "▸ Configuring ufw"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── PM2 startup on boot ──────────────────────────────────────────────────────
echo "▸ Enabling PM2 on boot for $DEPLOY_USER"
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$DEPLOY_USER" --hp "/home/$DEPLOY_USER" || true

echo "✅ provision.sh done."
echo "   Next: clone the repo into /var/www/kuddlkin, add .env, run setup-db.sh then deploy.sh"
