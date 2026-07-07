#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# create-gcs.sh — create the assets bucket + a service account for the backend.
# Run LOCALLY with gcloud auth'd to your project.
#
#   bash infra/gcp/create-gcs.sh
#
# Two ways the backend can authenticate to GCS:
#   (A) ADC via the VM's service account  (create-vm.sh used --scopes=storage-rw)
#       → simplest, NO key file to manage. Grant the VM's SA objectAdmin below.
#   (B) A downloaded JSON key            → set GOOGLE_APPLICATION_CREDENTIALS.
# This script sets up (B) and shows how to do (A). Prefer (A) in production.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
BUCKET="${GCS_BUCKET:-kuddlkin-prod}"
LOCATION="${LOCATION:-asia-south1}"
SA_NAME="${SA_NAME:-kuddlkin-backend}"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "▸ Project=$PROJECT_ID  Bucket=$BUCKET  Location=$LOCATION"

# ── 1. Bucket ────────────────────────────────────────────────────────────────
if ! gcloud storage buckets describe "gs://$BUCKET" >/dev/null 2>&1; then
  echo "▸ Creating bucket gs://$BUCKET"
  gcloud storage buckets create "gs://$BUCKET" \
    --location="$LOCATION" \
    --uniform-bucket-level-access
fi

# ── 2. Make objects public (needed for the assets.kuddlkin.co NGINX proxy) ────
# Skip this and use signed URLs instead if the assets must stay private.
echo "▸ Granting public read (allUsers → objectViewer)"
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" \
  --member=allUsers --role=roles/storage.objectViewer

# ── 3. Service account for the backend ───────────────────────────────────────
if ! gcloud iam service-accounts describe "$SA_EMAIL" >/dev/null 2>&1; then
  echo "▸ Creating service account $SA_EMAIL"
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="Kuddlkin backend (GCS)"
fi

echo "▸ Granting objectAdmin on the bucket to $SA_EMAIL"
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" \
  --member="serviceAccount:$SA_EMAIL" --role=roles/storage.objectAdmin

# ── 4a. OPTION A (recommended): attach this SA to the VM, use ADC, no key file.
echo
echo "OPTION A (no key file) — bind the SA to the VM and leave"
echo "GOOGLE_APPLICATION_CREDENTIALS empty in .env:"
echo "  gcloud compute instances set-service-account kuddlkin-prod --zone=asia-south1-a \\"
echo "    --service-account=$SA_EMAIL --scopes=cloud-platform"
echo

# ── 4b. OPTION B: download a JSON key to copy onto the VM ─────────────────────
KEY_OUT="gcs-key.json"
echo "▸ (OPTION B) writing a key to ./$KEY_OUT — scp it to /var/www/kuddlkin/gcs-key.json"
gcloud iam service-accounts keys create "$KEY_OUT" --iam-account="$SA_EMAIL"

echo "✅ create-gcs.sh done."
echo "   .env →  GCS_BUCKET=$BUCKET  GCS_PROJECT_ID=$PROJECT_ID"
echo "           GOOGLE_APPLICATION_CREDENTIALS=/var/www/kuddlkin/gcs-key.json  (Option B only)"
