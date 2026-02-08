import fs from "fs";
import path from "path";

const STATE_DIR = process.env.BUILDER_STATE_DIR || path.join(process.cwd(), ".builder");
const RECORDS_FILE = path.join(STATE_DIR, "dns-records.json");
const DNS_API_URL = process.env.DNS_API_URL || "";

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

function readRecords() {
  if (!fs.existsSync(RECORDS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(RECORDS_FILE, "utf8"));
  } catch (error) {
    throw new Error("Failed to parse DNS records file. Delete .builder/dns-records.json and retry.");
  }
}

function writeRecords(records) {
  ensureStateDir();
  fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2));
}

async function upsertRecord(record) {
  if (DNS_API_URL) {
    const response = await fetch(DNS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    });
    if (!response.ok) {
      throw new Error(`dns_api_failed: ${response.status}`);
    }
    const data = await response.json().catch(() => ({}));
    return data.result || data;
  }

  const records = readRecords();
  const index = records.findIndex((existing) => existing.type === record.type && existing.name === record.name);
  if (index >= 0) {
    records[index] = { ...records[index], ...record };
  } else {
    records.push(record);
  }
  writeRecords(records);
  return { stored: true, record };
}

export async function upsertCnameRecord({ name, target, ttl = 300 }) {
  if (!name || !target) {
    throw new Error("name and target required for CNAME record");
  }
  return upsertRecord({ type: "CNAME", name, content: target, ttl });
}

export async function upsertApexRedirect({ domain, target, ttl = 300 }) {
  if (!domain || !target) {
    throw new Error("domain and target required for apex redirect");
  }
  return upsertRecord({ type: "URL", name: domain, content: target, ttl });
}
