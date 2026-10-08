import test from "node:test";
import assert from "node:assert";
import { analisarTriagem, normalizarRelato, resolverNumeroWhatsApp } from "../lib/triagemCore.js";

test("triagem trabalhista detecta justa causa e horas extras", () => {
  const { analise, whatsappUrl } = analisarTriagem({
    area: "trabalhista",
    relato: "Fui demitido por justa causa e a empresa não pagou minhas horas extras.",
    urgencia: "moderada",
    nome: "Caso Teste",
    telefone: "11999999999",
  });

  assert.strictEqual(analise.direitosIdentificados.length, 2);
  assert.strictEqual(analise.nivelGravidade, "alta");
  assert.ok(analise.protocolo.startsWith("MC-"));
  assert.ok(whatsappUrl.startsWith("https://wa.me/"));
});

test("triagem previdenciária detecta benefício negado e auxílio-doença", () => {
  const { analise } = analisarTriagem({
    area: "previdenciario",
    relato: "O INSS negou meu pedido de auxílio-doença mesmo com atestado médico.",
  });

  assert.strictEqual(analise.direitosIdentificados.length, 2);
  assert.strictEqual(analise.nivelGravidade, "alta");
});

test("triagem sem área ou relato falha com contexto", () => {
  assert.throws(() => analisarTriagem({ area: "", relato: "" }), /triagem inválida/);
});

test("normalização remove acentos para casamento de sinais", () => {
  assert.ok(normalizarRelato("ASSÉDIO com pressão").includes("assedio"));
});

test("número do WhatsApp usa env quando configurado", () => {
  assert.strictEqual(resolverNumeroWhatsApp({ WHATSAPP_NUMBER: "5511888888888" }), "5511888888888");
  assert.strictEqual(resolverNumeroWhatsApp({}), "5511999999999");
});
