#!/usr/bin/env node
/**
 * Uploads the lesson videos to Supabase Storage.
 *
 *   node scripts/upload-lesson-videos.mjs           # upload what's missing
 *   node scripts/upload-lesson-videos.mjs --check   # report only, change nothing
 *   node scripts/upload-lesson-videos.mjs --force   # re-upload everything
 *   node scripts/upload-lesson-videos.mjs --free    # check against free limits
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
 * .env.local. The key is never printed; it goes straight from the file to the
 * Supabase client.
 *
 * Safe to run repeatedly: a file already in the bucket at the same size is
 * skipped, so an interrupted run continues where it stopped.
 *
 * THIS NEEDS THE PRO PLAN. Free allows 1 GB of storage, 5 GB of egress a
 * month, and — the one that really bites — 50 MB per file. Nine of the ten
 * recordings are bigger than 50 MB, so on free most of them are rejected
 * outright. Pro raises those to 100 GB, 250 GB and 50 GB per file.
 *
 * The size check therefore assumes Pro. Pass --free to check against the
 * free-tier ceilings instead, which is worth doing if a run fails and you
 * want to know whether the upgrade actually went through.
 */

import { createClient } from "@supabase/supabase-js";
import { readFile, readdir, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VIDEO_DIR = path.join(ROOT, "public", "videos");
const BUCKET = "lesson-videos";
const args = new Set(process.argv.slice(2));
const CHECK_ONLY = args.has("--check");
const FORCE = args.has("--force");
const ASSUME_FREE = args.has("--free");

// Supabase plan ceilings that matter here.
const PLAN = ASSUME_FREE
  ? { name: "free", total: 1024 ** 3, perFile: 50 * 1024 ** 2 }
  : { name: "Pro", total: 100 * 1024 ** 3, perFile: 50 * 1024 ** 3 };

const mb = (b) => `${(b / 1024 / 1024).toFixed(0)} MB`;

async function loadEnv() {
  let raw = "";
  try {
    raw = await readFile(path.join(ROOT, ".env.local"), "utf8");
  } catch {
    fail(".env.local not found. Copy .env.example and fill it in.");
  }

  const env = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

const env = await loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) fail("NEXT_PUBLIC_SUPABASE_URL is missing from .env.local.");
if (!key) {
  fail(
    "SUPABASE_SERVICE_ROLE_KEY is missing from .env.local.\n" +
      "  Supabase dashboard → Project Settings → API → service_role (or a\n" +
      "  secret key). Uploading is an admin action, so it needs that key.",
  );
}

// ---- What we have locally -------------------------------------------------
let files;
try {
  files = (await readdir(VIDEO_DIR)).filter((f) => f.endsWith(".mp4")).sort();
} catch {
  fail(`No ${path.relative(ROOT, VIDEO_DIR)} directory — nothing to upload.`);
}
if (files.length === 0) fail("No .mp4 files found in public/videos.");

const local = [];
let totalBytes = 0;
for (const name of files) {
  const { size } = await stat(path.join(VIDEO_DIR, name));
  local.push({ name, size });
  totalBytes += size;
}

console.log(`\n  ${files.length} videos, ${mb(totalBytes)} total\n`);

const tooBig = local.filter((f) => f.size > PLAN.perFile);

if (totalBytes > PLAN.total && !FORCE) {
  fail(
    `That is ${mb(totalBytes)}, and the ${PLAN.name} plan holds ` +
      `${mb(PLAN.total)}.\n` +
      "  This run would fail partway through, so it has not started.\n" +
      "  Re-run with --force to try anyway.",
  );
}

if (tooBig.length > 0 && !FORCE) {
  fail(
    `${tooBig.length} of ${local.length} files are over the ${PLAN.name} ` +
      `per-file limit of ${mb(PLAN.perFile)}:\n` +
      tooBig.map((f) => `    ${f.name}  ${mb(f.size)}`).join("\n") +
      "\n\n  On the free plan this is expected — the ceiling is 50 MB and\n" +
      "  these are lesson recordings. Upgrading to Pro is what fixes it.",
  );
}

console.log(`  Checking against ${PLAN.name} plan limits.\n`);

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---- Make sure the bucket exists ------------------------------------------
const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) fail(`Could not reach Supabase Storage: ${listError.message}`);

if (!buckets.some((b) => b.name === BUCKET)) {
  if (CHECK_ONLY) {
    console.log(`  Bucket "${BUCKET}" does not exist yet.`);
  } else {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: "500MB",
      allowedMimeTypes: ["video/mp4"],
    });
    if (error) fail(`Could not create the bucket: ${error.message}`);
    console.log(`  Created bucket "${BUCKET}" (public read).`);
  }
}

// ---- What is already up there ---------------------------------------------
const { data: remote } = await supabase.storage.from(BUCKET).list("", {
  limit: 1000,
});
const remoteSize = new Map(
  (remote ?? []).map((o) => [o.name, o.metadata?.size ?? 0]),
);

// ---- Upload ---------------------------------------------------------------
let uploaded = 0;
let skipped = 0;

for (const { name, size } of local) {
  const already = remoteSize.get(name);
  if (!FORCE && already === size) {
    console.log(`  skip    ${name}  (already there, ${mb(size)})`);
    skipped += 1;
    continue;
  }

  if (CHECK_ONLY) {
    console.log(`  would upload  ${name}  ${mb(size)}`);
    continue;
  }

  process.stdout.write(`  upload  ${name}  ${mb(size)} … `);
  const body = createReadStream(path.join(VIDEO_DIR, name));
  const { error } = await supabase.storage.from(BUCKET).upload(name, body, {
    contentType: "video/mp4",
    upsert: true,
    duplex: "half",
  });

  if (error) {
    console.log("failed");
    fail(`${name}: ${error.message}`);
  }
  console.log("done");
  uploaded += 1;
}

// ---- What to do with it ----------------------------------------------------
const base = `${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}`;

if (CHECK_ONLY) {
  console.log(`\n  Check only — nothing was changed.\n`);
} else {
  console.log(`\n  ${uploaded} uploaded, ${skipped} already present.\n`);
  console.log("  Set this in Vercel (Settings → Environment Variables), then");
  console.log("  redeploy, and the lessons will play from Supabase:\n");
  console.log(`    NEXT_PUBLIC_VIDEO_BASE_URL=${base}\n`);
}
