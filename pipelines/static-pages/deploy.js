import fs from "fs";
import path from "path";
import { createPagesClient } from "./pages-client.js";

const DEFAULT_MAX_PAGES = Number.parseInt(process.env.PAGES_MAX_PAGES || "5", 10);
const DEFAULT_MAX_TOTAL_BYTES = Number.parseInt(process.env.PAGES_MAX_TOTAL_BYTES || `${5 * 1024 * 1024}`, 10);
const DEFAULT_MAX_PUBLISHES_PER_DAY = Number.parseInt(process.env.PAGES_PUBLISHES_PER_DAY || "3", 10);

const STATE_DIR = process.env.BUILDER_STATE_DIR || path.join(process.cwd(), ".builder");
const HISTORY_FILE = path.join(STATE_DIR, "publish-history.json");

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFiles(fullPath);
    }
    return entry.isFile() ? [fullPath] : [];
  });
}

function readHistory() {
  if (!fs.existsSync(HISTORY_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse publish history file (${detail}). Delete ${HISTORY_FILE} and retry.`);
  }
}

function writeHistory(history) {
  ensureStateDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function normalizeLimit(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getUTCDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export async function deployStaticPages({
  siteId,
  distDir = "dist",
  limits = {}
} = {}) {
  if (!siteId) {
    throw new Error("siteId required");
  }

  const resolvedDist = path.resolve(distDir);
  if (!fs.existsSync(resolvedDist)) {
    throw new Error(`dist directory not found: ${resolvedDist}`);
  }

  const files = listFiles(resolvedDist);
  const pageCount = files.filter((file) => file.toLowerCase().endsWith(".html")).length;
  const totalBytes = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);

  const maxPages = normalizeLimit(limits.maxPages, DEFAULT_MAX_PAGES);
  const maxTotalBytes = normalizeLimit(limits.maxTotalBytes, DEFAULT_MAX_TOTAL_BYTES);
  const maxPublishesPerDay = normalizeLimit(limits.maxPublishesPerDay, DEFAULT_MAX_PUBLISHES_PER_DAY);

  if (pageCount > maxPages) {
    throw new Error(`MVP limit exceeded: ${pageCount} pages (max ${maxPages}).`);
  }
  if (totalBytes > maxTotalBytes) {
    throw new Error(`MVP limit exceeded: ${totalBytes} bytes (max ${maxTotalBytes}).`);
  }

  const today = getUTCDateKey();
  const history = readHistory();
  const siteHistory = history[siteId] || {};
  const publishCount = siteHistory[today] || 0;

  if (publishCount >= maxPublishesPerDay) {
    throw new Error(`MVP limit exceeded: ${publishCount} publishes today (max ${maxPublishesPerDay}).`);
  }

  const client = createPagesClient();
  const result = await client.deploy({ siteId, distDir: resolvedDist, pageCount, totalBytes });

  history[siteId] = {
    ...siteHistory,
    [today]: publishCount + 1
  };
  writeHistory(history);

  return result;
}
