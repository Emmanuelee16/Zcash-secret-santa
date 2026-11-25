import crypto from "node:crypto";

const secret = process.env.NOTE_SECRET ?? process.env.ADMIN_KEY ?? "dev-secret";

function keyFor(id: string) {
  return crypto.scryptSync(secret, id, 32);
}

export function sealNote(id: string, text: string) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", keyFor(id), iv);
  const enc = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return `${iv.toString("base64")}.${enc.toString("base64")}.${c.getAuthTag().toString("base64")}`;
}

export function openNote(id: string, payload: string | null) {
  if (!payload) return "";
  try {
    const [i, e, t] = payload.split(".");
    const d = crypto.createDecipheriv("aes-256-gcm", keyFor(id), Buffer.from(i, "base64"));
    d.setAuthTag(Buffer.from(t, "base64"));
    return Buffer.concat([d.update(Buffer.from(e, "base64")), d.final()]).toString("utf8");
  } catch {
    return "";
  }
}
