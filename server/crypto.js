import crypto from "crypto";

const MASTER = process.env.CF_TOKEN_MASTER_KEY;
if (!MASTER) throw new Error("Missing CF_TOKEN_MASTER_KEY environment variable");

const MASTER_KEY = Buffer.from(MASTER, "base64"); // 32 bytes
if (MASTER_KEY.length !== 32) {
  throw new Error("CF_TOKEN_MASTER_KEY must decode to 32 bytes");
}

export function encryptSecret(plaintext) {
  if (typeof plaintext !== "string") {
    throw new Error("Plaintext must be a string");
  }
  const iv = crypto.randomBytes(12); // GCM standard
  const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decryptSecret(encB64) {
  if (typeof encB64 !== "string" || encB64.length === 0) {
    throw new Error("Encrypted payload must be a non-empty base64 string");
  }
  const raw = Buffer.from(encB64, "base64");
  if (raw.length < 28) {
    throw new Error(`Invalid encrypted payload: expected at least 28 bytes, got ${raw.length}`);
  }
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
  decipher.setAuthTag(tag);
  try {
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString("utf8");
  } catch (error) {
    throw new Error("Invalid encrypted payload");
  }
}
