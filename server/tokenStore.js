import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "cf_tokens.json");

function readAll() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function writeAll(obj) {
  fs.writeFileSync(FILE, JSON.stringify(obj, null, 2));
}

export function saveToken(projectId, record) {
  const all = readAll();
  all[projectId] = record; // record contains encrypted token
  writeAll(all);
}

export function getToken(projectId) {
  const all = readAll();
  return all[projectId] || null;
}

export function deleteToken(projectId) {
  const all = readAll();
  delete all[projectId];
  writeAll(all);
}
