import { createCipheriv, createHmac, randomBytes } from "node:crypto";

export function normalizeDocument(value: string) {
  return value.replace(/[.\-/\s]/g, "").toUpperCase();
}
export function validCPF(value: string): boolean {
  const cpf = normalizeDocument(value);
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const length of [9, 10]) {
    const sum = [...cpf.slice(0, length)].reduce(
      (acc, digit, index) => acc + Number(digit) * (length + 1 - index),
      0,
    );
    const check = ((sum * 10) % 11) % 10;
    if (check !== Number(cpf[length])) return false;
  }
  return true;
}
export function validCNPJ(value: string): boolean {
  const cnpj = normalizeDocument(value);
  if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj))
    return false;
  for (const length of [12, 13]) {
    const weights =
      length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = [...cnpj.slice(0, length)].reduce(
      (acc, digit, i) => acc + (digit.charCodeAt(0) - 48) * weights[i],
      0,
    );
    const remainder = sum % 11;
    if (Number(cnpj[length]) !== (remainder < 2 ? 0 : 11 - remainder))
      return false;
  }
  return true;
}
export function protectDocument(raw: string) {
  const value = normalizeDocument(raw);
  const key = Buffer.from(process.env.DOCUMENT_KEY ?? "", "hex");
  if (key.length !== 32) throw new Error("Chave de documentos não configurada");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return {
    hash: createHmac("sha256", key)
      .update(`document:v1:${value}`)
      .digest("hex"),
    cipher: `v1:${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${encrypted.toString("hex")}`,
  };
}
