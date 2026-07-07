#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# create-vm.sh — provision the Compute Engine VM, a static external IP, and the
# firewall rules. Run LOCALLY (needs gcloud auth'd to your project).
#
#   gcloud auth login
#   gcloud config set project YOUR_PROJECT_ID
#   bash infra/gcp/create-vm.sh
#
# Tweak the variables at the top before running.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${REGION:-asia-south1}"          # Mumbai — closest to an India audience
ZONE="${ZONE:-asia-south1-a}"
VM_NAME="${VM_NAME:-kuddlkin-prod}"
MACHINE_TYPE="${MACHINE_TYPE:-e2-small}" # 2 vCPU burst / 2GB. Bump to e2-medium (4GB) if builds OOM.
DISK_SIZE="${DISK_SIZE:-30GB}"
IP_NAME="${IP_NAME:-kuddlkin-ip}"

echo "▸ Project=$PROJECT_ID  Zone=$ZONE  VM=$VM_NAME  Type=$MACHINE_TYPE"

# ── 1. Reserve a static external IP (so DNS never breaks on reboot) ───────────
if ! gcloud compute addresses describe "$IP_NAME" --region "$REGION" >/dev/null 2>&1; then
  echo "▸ Reserving static IP $IP_NAME in $REGION"
  gcloud compute addresses create "$IP_NAME" --region "$REGION"
fi
STATIC_IP="$(gcloud compute addresses describe "$IP_NAME" --region "$REGION" --format='get(address)')"
echo "  Static IP = $STATIC_IP  (point your A records here)"

# ── 2. Firewall: allow HTTP/HTTPS to tagged instances ────────────────────────
if ! gcloud compute firewall-rules describe kuddlkin-allow-web >/dev/null 2>&1; then
  echo "▸ Creating firewall rule kuddlkin-allow-web (80,443)"
  gcloud compute firewall-rules create kuddlkin-allow-web \
    --direction=INGRESS --action=ALLOW \
    --rules=tcp:80,tcp:443 \
    --target-tags=kuddlkin-web \
    --source-ranges=0.0.0.0/0
fi
# SSH is covered by the default 'default-allow-ssh' rule on most projects; if not:
#   gcloud compute firewall-rules create kuddlkin-allow-ssh --allow=tcp:22 --target-tags=kuddlkin-web

# ── 3. The VM ────────────────────────────────────────────────────────────────
if ! gcloud compute instances describe "$VM_NAME" --zone "$ZONE" >/dev/null 2>&1; then
  echo "▸ Creating VM $VM_NAME"
  gcloud compute instances create "$VM_NAME" \
    --zone="$ZONE" \
    --machine-type="$MACHINE_TYPE" \
    --image-family=ubuntu-2404-lts-amd64 \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size="$DISK_SIZE" \
    --boot-disk-type=pd-balanced \
    --address="$STATIC_IP" \
    --tags=kuddlkin-web \
    --scopes=storage-rw
    # ^ storage-rw lets the VM's service account talk to GCS via ADC — so you may
    #   not even need a downloaded key file (see create-gcs.sh notes).
else
  echo "▸ VM $VM_NAME already exists — skipping."
fi

echo "✅ create-vm.sh done."
echo "   SSH in:   gcloud compute ssh $VM_NAME --zone $ZONE"
echo "   DNS:      A  api / www / partner / assets / @  →  $STATIC_IP"
