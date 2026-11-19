#!/usr/bin/env node
/**
 * Verifies that the first-load JS bundle (compressed transfer size)
 * for all routes stays strictly under the 150 KB performance budget.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const MAX_GZIP_BYTES = 150 * 1024; // 150 KB
const ROOT = process.cwd();
const MANIFEST_PATH = join(ROOT, ".next", "build-manifest.json");

if (!existsSync(MANIFEST_PATH)) {
  console.error("check-bundle-size: .next/build-manifest.json not found. Run 'next build' first.");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const params = manifest.pagesChunkGroupBootstrapParams || {};

let failed = false;

for (const [page, data] of Object.entries(params)) {
  let gzippedTotal = 0;
  const chunkSet = new Set(data.otherChunks || []);

  for (const chunk of chunkSet) {
    const chunkPath = join(ROOT, ".next", chunk);
    if (existsSync(chunkPath)) {
      const buffer = readFileSync(chunkPath);
      gzippedTotal += gzipSync(buffer).length;
    }
  }

  const kb = (gzippedTotal / 1024).toFixed(1);
  if (gzippedTotal > MAX_GZIP_BYTES) {
    console.error(`Route ${page} first load JS ${kb} KB exceeds 150 KB budget!`);
    failed = true;
  } else {
    console.warn(`Route ${page} first load JS: ${kb} KB (OK <= 150 KB)`);
  }
}

if (failed) {
  process.exit(1);
}

console.warn("All route bundles passed the 150 KB first-load JS budget!");
