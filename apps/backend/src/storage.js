/**
 * Cloudflare R2 binding → Google Cloud Storage.
 *
 * The backend calls the R2 bucket-binding API on `env.KUDDL_STORAGE`:
 *     .put(key, value, { httpMetadata: { contentType } })
 *     .get(key)   -> { body, arrayBuffer(), key, size } | null
 *     .list({ prefix }) -> { objects: [{ key, size }] }
 *     .delete(key)
 * This shim implements that same surface on GCS. When GCS isn't configured
 * (local dev), it falls back to the local filesystem under ./.storage so the
 * backend still runs and upload/serve endpoints work.
 */
import { Buffer } from "node:buffer";
import fs from "node:fs/promises";
import path from "node:path";

/** Normalise any put() value (bytes / Web stream / Node stream) to a Buffer. */
async function toBuffer(value) {
  if (value == null) return Buffer.alloc(0);
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  // Web ReadableStream (File.stream(), R2 .body)
  if (typeof value.getReader === "function") {
    return Buffer.from(await new Response(value).arrayBuffer());
  }
  // Node Readable
  if (typeof value.on === "function" || typeof value[Symbol.asyncIterator] === "function") {
    const chunks = [];
    for await (const c of value) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
    return Buffer.concat(chunks);
  }
  if (typeof value === "string") return Buffer.from(value);
  return Buffer.from(value);
}

/** An R2ObjectBody-compatible wrapper around a Buffer. */
function makeObject(key, buf, contentType) {
  return {
    key,
    size: buf.length,
    body: buf, // R2 code re-puts this; toBuffer handles a Buffer
    httpMetadata: { contentType },
    async arrayBuffer() {
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    },
    async text() {
      return buf.toString("utf8");
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  GCS backend                                                                */
/* -------------------------------------------------------------------------- */
function createGcsStorage() {
  let bucketPromise;
  async function bucket() {
    if (!bucketPromise) {
      const { Storage } = await import("@google-cloud/storage");
      const storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID || undefined,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
      });
      bucketPromise = Promise.resolve(storage.bucket(process.env.GCS_BUCKET));
    }
    return bucketPromise;
  }

  return {
    async put(key, value, options = {}) {
      const buf = await toBuffer(value);
      const b = await bucket();
      await b.file(key).save(buf, {
        contentType: options?.httpMetadata?.contentType,
        resumable: false,
      });
      return makeObject(key, buf, options?.httpMetadata?.contentType);
    },
    async get(key) {
      try {
        const b = await bucket();
        const [buf] = await b.file(key).download();
        const [meta] = await b.file(key).getMetadata();
        return makeObject(key, buf, meta?.contentType);
      } catch (e) {
        if (e?.code === 404) return null;
        throw e;
      }
    },
    async delete(key) {
      const b = await bucket();
      await b.file(key).delete({ ignoreNotFound: true });
    },
    async list(options = {}) {
      const b = await bucket();
      const [files] = await b.getFiles({ prefix: options?.prefix });
      return {
        objects: files.map((f) => ({
          key: f.name,
          size: Number(f.metadata?.size || 0),
        })),
        truncated: false,
      };
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Local filesystem backend (dev fallback)                                    */
/* -------------------------------------------------------------------------- */
function createLocalStorage() {
  const root = path.resolve(process.env.LOCAL_STORAGE_DIR || ".storage");
  const full = (key) => path.join(root, key);

  return {
    async put(key, value, options = {}) {
      const buf = await toBuffer(value);
      const p = full(key);
      await fs.mkdir(path.dirname(p), { recursive: true });
      await fs.writeFile(p, buf);
      return makeObject(key, buf, options?.httpMetadata?.contentType);
    },
    async get(key) {
      try {
        const buf = await fs.readFile(full(key));
        return makeObject(key, buf);
      } catch (e) {
        if (e.code === "ENOENT") return null;
        throw e;
      }
    },
    async delete(key) {
      await fs.rm(full(key), { force: true });
    },
    async list(options = {}) {
      const prefix = options?.prefix || "";
      const objects = [];
      async function walk(dir, rel) {
        let entries = [];
        try {
          entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
          return;
        }
        for (const e of entries) {
          const relKey = rel ? `${rel}/${e.name}` : e.name;
          if (e.isDirectory()) await walk(path.join(dir, e.name), relKey);
          else if (relKey.startsWith(prefix)) {
            const st = await fs.stat(path.join(dir, e.name));
            objects.push({ key: relKey, size: st.size });
          }
        }
      }
      await walk(root, "");
      return { objects, truncated: false };
    },
  };
}

export function createStorage() {
  const useGcs =
    process.env.GCS_BUCKET &&
    (process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCS_PROJECT_ID);
  return useGcs ? createGcsStorage() : createLocalStorage();
}
