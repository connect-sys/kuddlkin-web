# Deploying Kuddlkin to GCP (single Compute Engine VM)

One Ubuntu VM runs everything behind NGINX:

```
                         ┌────────────────────────── Compute Engine VM ──────────────────────────┐
                         │                                                                        │
  api.kuddlkin.co ─────► │  NGINX :443 ──► 127.0.0.1:5000   kuddl-backend   (PM2, Node)           │
  www.kuddlkin.co ─────► │  NGINX :443 ──► 127.0.0.1:3000   kuddl-customer  (PM2, next start)     │
  partner.kuddlkin.co ─► │  NGINX :443 ──► /var/www/kuddlkin/apps/partner/dist  (static)          │
  assets.kuddlkin.co ──► │  NGINX :443 ──► GCS bucket (reverse-proxied)                            │
                         │                                                                        │
                         │  PostgreSQL 16 (localhost:5432)                                        │
                         └────────────────────────────────────────────────────────────────────────┘
                                            files ──► gs://kuddlkin-prod
```

- `apps/backend` — Node API, PM2 process `kuddl-backend`, `:5000`
- `apps/customer` — Next.js SSR, PM2 process `kuddl-customer`, `:3000`
- `apps/partner` — Vite SPA (incl. `/admin/*`, `/worker/*`), **static**, served off disk
- Data: PostgreSQL on the VM · Files: Google Cloud Storage

Estimated cost: **e2-small + 30GB disk + static IP ≈ $15–20/mo**. Bump to `e2-medium` if `next build` runs out of memory.

---

## 0. Prerequisites (local machine)

- `gcloud` CLI installed and authed: `gcloud auth login && gcloud config set project YOUR_PROJECT_ID`
- Your domain's DNS is manageable (to add A records)
- A Postgres data dump from your dev DB (real prod data already lives there):
  ```bash
  # from your Mac, against local Postgres on :5050
  pg_dump -Fc -h localhost -p 5050 -U kuddlkin kuddlkin > kuddlkin.dump
  ```

---

## 1. Create GCP resources (run locally)

```bash
cd kuddlkin-web

# VM + static IP + firewall (edit vars at top of the script first if needed)
bash infra/gcp/create-vm.sh
# → prints the STATIC IP. Note it.

# GCS bucket + service account for file uploads
bash infra/gcp/create-gcs.sh
```

Defaults: region `asia-south1` (Mumbai), machine `e2-small`, VM `kuddlkin-prod`, bucket `kuddlkin-prod`. Override via env vars, e.g. `REGION=us-central1 bash infra/gcp/create-vm.sh`.

---

## 2. DNS

Point these **A records** at the static IP from step 1:

| Record | Type | Value |
|--------|------|-------|
| `@` (apex) | A | `STATIC_IP` |
| `www` | A | `STATIC_IP` |
| `api` | A | `STATIC_IP` |
| `partner` | A | `STATIC_IP` |
| `assets` | A | `STATIC_IP` |

Wait for propagation (`dig api.kuddlkin.co +short` returns the IP) before requesting SSL.

---

## 3. Provision the VM

```bash
gcloud compute ssh kuddlkin-prod --zone asia-south1-a

# ---- now on the VM ----
git clone https://github.com/connect-sys/kuddlkin-web.git /var/www/kuddlkin
cd /var/www/kuddlkin
sudo bash infra/scripts/provision.sh   # Node20, pnpm, PM2, Postgres, NGINX, Certbot
```

> `provision.sh` chowns `/var/www/kuddlkin` to the SSH user, so subsequent
> git/pnpm/pm2 commands run without sudo.

---

## 4. Configure `.env` on the VM

Create `/var/www/kuddlkin/.env` from `.env.example` and fill in real values:

```bash
cp .env.example .env
nano .env
```

Must-set for production:
- `JWT_SECRET` — long random string (`openssl rand -hex 32`)
- `PGPASSWORD` — the DB password (used by both the app and `setup-db.sh`)
- `DATABASE_URL` — `postgresql://kuddlkin:PGPASSWORD@localhost:5432/kuddlkin`
- `GCS_BUCKET=kuddlkin-prod`, `GCS_PROJECT_ID=YOUR_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS` — path to the key **(Option B)**, or leave empty and use the VM's attached SA **(Option A, recommended)**
- Third-party secrets you actually use: `TWILIO_*`, `RAZORPAY_*`, SMTP/Resend, `GOOGLE_VISION_API_KEY`, `FIREBASE_*`
- Confirm the public URLs match your domain (`API_URL`, `CUSTOMER_URL`, `NEXT_PUBLIC_API_BASE_URL`, `VITE_API_URL`, …)

If you chose Option B, copy the key up:
```bash
# from your Mac
gcloud compute scp gcs-key.json kuddlkin-prod:/var/www/kuddlkin/gcs-key.json --zone asia-south1-a
```

---

## 5. Database

Copy the dump up and load it:

```bash
# from your Mac
gcloud compute scp kuddlkin.dump kuddlkin-prod:/tmp/kuddlkin.dump --zone asia-south1-a

# on the VM
cd /var/www/kuddlkin
sudo bash infra/scripts/setup-db.sh /tmp/kuddlkin.dump
```

This creates the role + database, restores the data, and applies
`apps/backend/scripts/pg-compat.sql` (the `sqlite_master` view + UUID PK defaults).
Verify: `psql -U kuddlkin -d kuddlkin -c '\dt'` → should list ~38 tables.

---

## 6. First deploy (build + start processes)

```bash
cd /var/www/kuddlkin
bash infra/scripts/deploy.sh
```

This installs deps, projects the root `.env` into each frontend, builds
customer + partner, and starts both PM2 processes. Sanity checks:

```bash
pm2 status
curl -s http://127.0.0.1:5000/health         # {"status":"healthy",...}
curl -sI http://127.0.0.1:3000 | head -1      # HTTP/1.1 200 OK
```

---

## 7. NGINX + SSL

```bash
# Install the server blocks
sudo cp infra/nginx/00-websocket-map.conf     /etc/nginx/conf.d/
sudo cp infra/nginx/api.kuddlkin.co.conf       /etc/nginx/sites-available/
sudo cp infra/nginx/customer.kuddlkin.co.conf  /etc/nginx/sites-available/
sudo cp infra/nginx/partner.kuddlkin.co.conf   /etc/nginx/sites-available/
sudo cp infra/nginx/assets.kuddlkin.co.conf    /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/api.kuddlkin.co.conf      /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/customer.kuddlkin.co.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/partner.kuddlkin.co.conf  /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/assets.kuddlkin.co.conf   /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t && sudo systemctl reload nginx

# Issue Let's Encrypt certs for all hostnames at once (adds :443 + auto-renew)
sudo certbot --nginx \
  -d kuddlkin.co -d www.kuddlkin.co \
  -d api.kuddlkin.co -d partner.kuddlkin.co -d assets.kuddlkin.co \
  --redirect --agree-tos -m you@kuddlkin.co --no-eff-email
```

Certbot installs a systemd timer for renewal — nothing else to do.

---

## 8. Verify end-to-end

```bash
curl -s  https://api.kuddlkin.co/health
curl -sI https://www.kuddlkin.co     | head -1
curl -sI https://partner.kuddlkin.co | head -1
```

Then in a browser: customer site loads, partner/admin login works against the
API, a file upload lands in the GCS bucket and serves back via
`https://assets.kuddlkin.co/...`.

---

## 9. Migrate images off Cloudflare R2 → GCS

Your DB stores absolute image URLs against the old R2 domain
`https://prodassets.kuddl.co/<key>` (134 references across camps / services /
providers). The files themselves still live in R2. Three steps:

**a. Copy the files** (run once, from your Mac — needs `rclone` + a Cloudflare R2
S3-API token + `gcloud auth application-default login`):
```bash
export R2_ACCOUNT_ID=...  R2_ACCESS_KEY_ID=...  R2_SECRET_ACCESS_KEY=...  R2_BUCKET=...
bash infra/scripts/migrate-images-r2-to-gcs.sh    # dry-run, then confirms before copying
```
Keys are preserved, so `partners/<id>/…` in R2 lands at the identical path in
`gs://kuddlkin-prod`.

**b. Rewrite the DB URLs** (`prodassets.kuddl.co` → `assets.kuddlkin.co`):
```bash
psql -h localhost -U kuddlkin -d kuddlkin -f infra/scripts/rewrite-image-urls.sql
```
The script prints a BEFORE (>0) and AFTER (must be 0) count inside a transaction —
verified locally to move exactly 134 rows to 0. If AFTER isn't 0, `ROLLBACK`
instead of `COMMIT`.

**c. Config** — `R2_PUBLIC_URL=https://assets.kuddlkin.co` in `.env` (added to
`.env.example`) so *new* uploads also get `assets.kuddlkin.co` URLs served from GCS.

Then hit an image URL to confirm the full path: NGINX `assets.kuddlkin.co` →
`storage.googleapis.com/kuddlkin-prod/<key>`.
```bash
curl -sI https://assets.kuddlkin.co/partners/admin_super_001/services/temp/<file>.jpg | head -1
```

---

## Day-2 operations

| Task | Command (on the VM, in `/var/www/kuddlkin`) |
|------|---------------------------------------------|
| Deploy new code | `bash infra/scripts/deploy.sh` |
| Logs (live) | `pm2 logs` · files under `/var/log/kuddlkin/` |
| Restart a process | `pm2 reload kuddl-backend` |
| NGINX logs | `/var/log/nginx/{api,customer,partner,assets}.*.log` |
| DB shell | `psql -U kuddlkin -d kuddlkin` |
| Renew SSL (manual test) | `sudo certbot renew --dry-run` |

## Open items before/right after go-live

- **Backend write paths** still need endpoint validation (auth-login, booking-create, upload). A handful of `INSERT OR IGNORE/REPLACE` (~24) and double-quoted-string (~13) queries only surface when their endpoint is hit — fix each as it appears.
- **GCS real upload** — confirm an upload writes to the bucket (Option A ADC or Option B key) and comes back as an `assets.kuddlkin.co` URL.
- **R2 image migration** — see step 9 above; do it after the DB import.
- **CI/CD (optional)** — a GitHub Actions workflow could SSH in and run `deploy.sh` on push to `main`. Not included yet; `deploy.sh` is the single command it would call.
- **Backups** — schedule `pg_dump` to GCS (cron) once data is live.
