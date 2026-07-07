#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-db.sh — create the Postgres role + database, apply the SQLite-compat
# layer, and (optionally) restore a data dump exported from your local machine.
#
# Run on the VM:   sudo bash infra/scripts/setup-db.sh [path/to/kuddlkin.dump]
#
# Reads DB creds from the root .env (PGDATABASE/PGUSER/PGPASSWORD). If you pass a
# dump file, it's restored AFTER the role/db exist. Produce the dump locally with:
#   pg_dump -Fc -h localhost -p 5050 -U kuddlkin kuddlkin > kuddlkin.dump
# and scp it to the VM.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
DUMP_FILE="${1:-}"

[[ -f "$ENV_FILE" ]] || { echo "❌ $ENV_FILE not found. Create it first."; exit 1; }
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

DB="${PGDATABASE:-kuddlkin}"
USER="${PGUSER:-kuddlkin}"
PW="${PGPASSWORD:?PGPASSWORD must be set in .env}"

echo "▸ Creating role '$USER' and database '$DB' (if missing)"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$USER') THEN
    CREATE ROLE $USER LOGIN PASSWORD '$PW';
  END IF;
END \$\$;
SELECT 'CREATE DATABASE $DB OWNER $USER'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB')\gexec
GRANT ALL PRIVILEGES ON DATABASE $DB TO $USER;
SQL

if [[ -n "$DUMP_FILE" ]]; then
  [[ -f "$DUMP_FILE" ]] || { echo "❌ dump file '$DUMP_FILE' not found"; exit 1; }
  echo "▸ Restoring data from $DUMP_FILE"
  sudo -u postgres pg_restore --no-owner --role="$USER" -d "$DB" "$DUMP_FILE" || \
    echo "⚠ pg_restore reported non-fatal errors (often ok on --no-owner)."
fi

echo "▸ Applying SQLite-compat layer (sqlite_master view + uuid PK defaults)"
PGPASSWORD="$PW" psql -h "${PGHOST:-localhost}" -p "${PGPORT:-5432}" -U "$USER" -d "$DB" \
  -f "$ROOT_DIR/apps/backend/scripts/pg-compat.sql"

echo "✅ setup-db.sh done. Verify:  psql -U $USER -d $DB -c '\\dt'"
