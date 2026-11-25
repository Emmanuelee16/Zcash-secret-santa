export type AddressKind = "unified" | "sapling" | "transparent";

export function addressKind(a: string): AddressKind | null {
  const v = a.trim();
  if (/^u1[0-9a-z]{50,}$/i.test(v)) return "unified";
  if (/^zs1[0-9a-z]{60,}$/i.test(v)) return "sapling";
  if (/^t[13][0-9A-Za-z]{20,}$/.test(v)) return "transparent";
  return null;
}

export function isShielded(a: string) {
  const k = addressKind(a);
  return k === "unified" || k === "sapling";
}

export function zip321(address: string, amount: string, memo: string) {
  const m = Buffer.from(memo, "utf8").toString("base64url");
  return `zcash:${address}?amount=${amount}&memo=${m}`;
}

export function zec(n: number) {
  return n.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
}
