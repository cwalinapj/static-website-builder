import crypto from "crypto";

const key = process.env.TOKEN_SECRET
  ? crypto.createHash("sha256").update(process.env.TOKEN_SECRET).digest()
  : crypto.randomBytes(32);
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export function encryptSecret(value) {
  if (typeof value !== "string") {
    throw new TypeError("Secret must be a string");
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptSecret(payload) {
  if (typeof payload !== "string") {
    throw new TypeError("Encrypted secret must be a string");
  }
  const data = Buffer.from(payload, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const text = data.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
  return decrypted.toString("utf8");
}
