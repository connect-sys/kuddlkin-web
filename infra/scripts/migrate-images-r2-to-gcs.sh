#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# migrate-images-r2-to-gcs.sh — copy every object from the Cloudflare R2 bucket
# into the GCS bucket, PRESERVING keys, using rclone.
#
# Your DB stores absolute URLs like:
#     https://prodassets.kuddl.co/partners/<id>/services/temp/<file>.jpg
# where the path after the host IS the R2 object key. We copy those keys verbatim
# into gs://$GCS_BUCKET, so after the URL rewrite (rewrite-image-urls.sql) they
# resolve as https://assets.kuddlkin.co/partners/<id>/...  via the NGINX→GCS proxy.
#
# Run this ONCE, from anywhere with network access (your Mac is fine).
#
# ── What you need first ──────────────────────────────────────────────────────
#   1. rclone installed:            brew install rclone   (mac)   /   apt install rclone
#   2. Cloudflare R2 S3-API token:  Cloudflare dashboard → R2 → Manage R2 API Tokens
#      → gives an Access Key ID + Secret Access Key.
#   3. Your R2 Account ID and the R2 bucket name.
#   4. gcloud auth for GCS:         gcloud auth application-default login
#
# ── Fill these in (env vars override) ────────────────────────────────────────
set -euo pipefail

R2_ACCOUNT_ID="${R2_ACCOUNT_ID:-YOUR_CLOUDFLARE_ACCOUNT_ID}"
R2_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID:-YOUR_R2_ACCESS_KEY_ID}"
R2_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY:-YOUR_R2_SECRET_ACCESS_KEY}"
R2_BUCKET="${R2_BUCKET:-kuddl-storage-prod}"          # the bucket behind prodassets.kuddl.co
GCS_BUCKET="${GCS_BUCKET:-kuddlkin-prod}"

for v in R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET; do
  case "${!v}" in YOUR_*) echo "❌ Set $v (edit the script or export it)"; exit 1;; esac
done

echo "▸ R2 bucket:  $R2_BUCKET   →   GCS bucket: gs://$GCS_BUCKET"

# ── Define the two rclone remotes inline (no persistent rclone.conf needed) ──
# R2 speaks the S3 API at https://<account-id>.r2.cloudflarestorage.com
export RCLONE_CONFIG_R2_TYPE=s3
export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
export RCLONE_CONFIG_R2_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export RCLONE_CONFIG_R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
export RCLONE_CONFIG_R2_ACL=private

# GCS remote via Application Default Credentials (gcloud auth adc).
export RCLONE_CONFIG_GCS_TYPE=gcs
export RCLONE_CONFIG_GCS_ENV_AUTH=true
export RCLONE_CONFIG_GCS_BUCKET_POLICY_ONLY=true   # uniform bucket-level access

echo "▸ Dry-run first (nothing is written):"
rclone copy "R2:$R2_BUCKET" "GCS:$GCS_BUCKET" --dry-run --progress --transfers=16

read -r -p "Proceed with the real copy? [y/N] " ok
[[ "$ok" == "y" || "$ok" == "Y" ]] || { echo "Aborted."; exit 0; }

echo "▸ Copying for real…"
rclone copy "R2:$R2_BUCKET" "GCS:$GCS_BUCKET" --progress --transfers=16 --checkers=32

echo "▸ Verifying object counts match:"
echo "  R2 : $(rclone size "R2:$R2_BUCKET" --json | sed 's/,/\n/g')"
echo "  GCS: $(rclone size "GCS:$GCS_BUCKET" --json | sed 's/,/\n/g')"

echo "✅ Image copy done. Next: run rewrite-image-urls.sql against the production DB."
