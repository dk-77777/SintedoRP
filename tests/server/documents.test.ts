import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validCPF,
  validCNPJ,
  protectDocument,
} from "../../src/server/documents";
import { randomBytes } from "node:crypto";
test("CPF rejeita sequências, dígitos trocados e pontuação não reconhecida", () => {
  assert.equal(validCPF("529.982.247-25"), true);
  assert.equal(validCPF("52998224724"), false);
  assert.equal(validCPF("11111111111"), false);
  assert.equal(validCPF("52998224725<script>"), false);
});
test("CNPJ numérico e alfanumérico usam os dígitos da especificação", () => {
  assert.equal(validCNPJ("11.222.333/0001-81"), true);
  assert.equal(validCNPJ("12.ABC.345/01DE-35"), true);
  assert.equal(validCNPJ("12.ABC.345/01DE-34"), false);
  assert.equal(validCNPJ("00000000000000"), false);
});
test("Documento é cifrado com IV aleatório; unicidade usa HMAC da forma normalizada", () => {
  process.env.DOCUMENT_KEY = randomBytes(32).toString("hex");
  const a = protectDocument("529.982.247-25"),
    b = protectDocument("52998224725");
  assert.equal(a.hash, b.hash);
  assert.notEqual(a.cipher, b.cipher);
  assert.equal(a.cipher.includes("52998224725"), false);
});
