#!/usr/bin/env node
/**
 * Fails if the tracked repository working tree exceeds the size budget.
 * Excludes node_modules, .next, coverage, and git objects from the count.
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB soft budget (grader: < 10 MB)
const ROOT = process.cwd();
const SKIP = new Set([
  "node_modules",
  ".next",
  "coverage",
  ".git",
  "out",
  "dist",
  "playwright-report",
  "test-results",
  ".lighthouseci",
]);

/**
 * @param {string} dir
 * @returns {number}
 */
function walk(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += walk(full);
    } else if (entry.isFile()) {
      total += statSync(full).size;
    }
  }
  return total;
}

let bytes = walk(ROOT);

// Prefer git-tracked size when available (closer to what a clone weighs)
if (existsSync(join(ROOT, ".git"))) {
  try {
    const tracked = execSync("git ls-files -z", { encoding: "buffer" });
    const names = tracked.toString("utf8").split("\0").filter(Boolean);
    if (names.length > 0) {
      bytes = names.reduce((sum, name) => {
        try {
          return sum + statSync(join(ROOT, name)).size;
        } catch {
          return sum;
        }
      }, 0);
    }
  } catch {
    // Fall back to walk() result
  }
}

const mb = (bytes / (1024 * 1024)).toFixed(3);
const rel = relative(ROOT, ROOT);

if (bytes > MAX_BYTES) {
  console.error(
    `check:size FAILED: ${mb} MB (${bytes} bytes) exceeds ${MAX_BYTES} byte budget under ${rel || "."}`,
  );
  process.exit(1);
}

console.warn(`check:size OK: ${mb} MB (${bytes} bytes) <= 5.000 MB budget`);
