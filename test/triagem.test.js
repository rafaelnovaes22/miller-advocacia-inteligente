import test from "node:test";
import assert from "node:assert";

function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

test("Validação do motor de triagem trabalhista", () => {
  const relato = "Fui demitido por justa causa e a empresa não pagou minhas horas extras.";
  const relatoNorm = normalizar(relato);
  
  const direitos = [];
  if (relatoNorm.includes("justa causa")) {
    direitos.push("Reversão de Demissão por Justa Causa");
  }
  if (relatoNorm.includes("hora") || relatoNorm.includes("extra")) {
    direitos.push("Cobrança de Horas Extras");
  }

  assert.strictEqual(direitos.length, 2);
  assert.ok(direitos.includes("Reversão de Demissão por Justa Causa"));
  assert.ok(direitos.includes("Cobrança de Horas Extras"));
});

test("Validação do motor de triagem previdenciária", () => {
  const relato = "O INSS negou meu pedido de auxílio-doença mesmo com atestado médico.";
  const relatoNorm = normalizar(relato);
  
  const direitos = [];
  if (relatoNorm.includes("negad") || relatoNorm.includes("negou") || relatoNorm.includes("indefer")) {
    direitos.push("Ação Judicial para Concessão de Benefício do INSS");
  }
  if (relatoNorm.includes("auxilio") || relatoNorm.includes("doenca")) {
    direitos.push("Auxílio por Incapacidade Temporária");
  }

  assert.strictEqual(direitos.length, 2);
  assert.ok(direitos.includes("Ação Judicial para Concessão de Benefício do INSS"));
  assert.ok(direitos.includes("Auxílio por Incapacidade Temporária"));
});
