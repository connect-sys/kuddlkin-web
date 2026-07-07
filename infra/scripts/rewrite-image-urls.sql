-- ─────────────────────────────────────────────────────────────────────────────
-- rewrite-image-urls.sql — repoint every stored image/asset URL from the old
-- Cloudflare R2 custom domain to the new GCS-backed asset domain.
--
--     https://prodassets.kuddl.co/<key>   →   https://assets.kuddlkin.co/<key>
--
-- The <key> (path after the host) is unchanged, so it matches the objects copied
-- into GCS by migrate-images-r2-to-gcs.sh. Plain string replace() also handles
-- the JSON-array-as-text columns (image_urls / images / documents / photos),
-- because only the host substring changes.
--
-- Run AFTER the file copy, against the PRODUCTION db:
--     psql -h localhost -U kuddlkin -d kuddlkin -f infra/scripts/rewrite-image-urls.sql
--
-- Wrapped in a transaction with before/after counts. Idempotent: re-running is a
-- no-op once the old host is gone. Adjust OLD_HOST/NEW_HOST below if different.
-- ─────────────────────────────────────────────────────────────────────────────
\set OLD_HOST 'https://prodassets.kuddl.co'
\set NEW_HOST 'https://storage.googleapis.com/kuddlkin-prod'

BEGIN;

-- Rows still referencing the old host BEFORE the rewrite (sanity check).
SELECT 'BEFORE' AS phase, SUM(n) AS rows_with_old_host FROM (
  SELECT count(*) n FROM providers              WHERE profile_image_url LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM camps           WHERE primary_image_url LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM camps           WHERE image_urls        LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM services        WHERE primary_image_url LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM services        WHERE image_urls        LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM services        WHERE images            LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM categories      WHERE image_url         LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM subcategories   WHERE image_url         LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM blog_posts      WHERE featured_image    LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM reviews         WHERE images            LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM document_verifications WHERE document_url LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM partner_applications   WHERE documents   LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM partner_applications   WHERE photos      LIKE '%prodassets.kuddl.co%'
) s;

-- Single-value URL columns
UPDATE providers    SET profile_image_url = replace(profile_image_url, :'OLD_HOST', :'NEW_HOST') WHERE profile_image_url LIKE '%prodassets.kuddl.co%';
UPDATE camps        SET primary_image_url = replace(primary_image_url, :'OLD_HOST', :'NEW_HOST') WHERE primary_image_url LIKE '%prodassets.kuddl.co%';
UPDATE services     SET primary_image_url = replace(primary_image_url, :'OLD_HOST', :'NEW_HOST') WHERE primary_image_url LIKE '%prodassets.kuddl.co%';
UPDATE categories   SET image_url         = replace(image_url,         :'OLD_HOST', :'NEW_HOST') WHERE image_url         LIKE '%prodassets.kuddl.co%';
UPDATE subcategories SET image_url        = replace(image_url,         :'OLD_HOST', :'NEW_HOST') WHERE image_url         LIKE '%prodassets.kuddl.co%';
UPDATE blog_posts   SET featured_image    = replace(featured_image,    :'OLD_HOST', :'NEW_HOST') WHERE featured_image    LIKE '%prodassets.kuddl.co%';
UPDATE document_verifications SET document_url = replace(document_url,  :'OLD_HOST', :'NEW_HOST') WHERE document_url      LIKE '%prodassets.kuddl.co%';

-- JSON-array-as-text columns (host substring swap is safe inside the JSON string)
UPDATE camps                SET image_urls = replace(image_urls, :'OLD_HOST', :'NEW_HOST') WHERE image_urls LIKE '%prodassets.kuddl.co%';
UPDATE services             SET image_urls = replace(image_urls, :'OLD_HOST', :'NEW_HOST') WHERE image_urls LIKE '%prodassets.kuddl.co%';
UPDATE services             SET images     = replace(images,     :'OLD_HOST', :'NEW_HOST') WHERE images     LIKE '%prodassets.kuddl.co%';
UPDATE reviews              SET images     = replace(images,     :'OLD_HOST', :'NEW_HOST') WHERE images     LIKE '%prodassets.kuddl.co%';
UPDATE partner_applications SET documents  = replace(documents,  :'OLD_HOST', :'NEW_HOST') WHERE documents  LIKE '%prodassets.kuddl.co%';
UPDATE partner_applications SET photos     = replace(photos,     :'OLD_HOST', :'NEW_HOST') WHERE photos     LIKE '%prodassets.kuddl.co%';

-- Should be 0 after the rewrite.
SELECT 'AFTER' AS phase, SUM(n) AS rows_with_old_host FROM (
  SELECT count(*) n FROM providers              WHERE profile_image_url LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM camps           WHERE primary_image_url LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM camps           WHERE image_urls        LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM services        WHERE primary_image_url LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM services        WHERE image_urls        LIKE '%prodassets.kuddl.co%'
  UNION ALL SELECT count(*) FROM services        WHERE images            LIKE '%prodassets.kuddl.co%'
) s;

-- Review the two counts above (BEFORE > 0, AFTER = 0), then:
COMMIT;
-- ROLLBACK;   -- use instead of COMMIT if the AFTER count is wrong
