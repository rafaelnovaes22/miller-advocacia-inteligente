// PORQUÊ: motor único de triagem compartilhado entre o Express local
// (server.js) e as serverless functions da Vercel (api/triagem.js).
// A lógica nasceu duplicada nos dois arquivos; qualquer ajuste aplicado
// em só um deles divergia local de produção sem nenhum erro visível.

export const WHATSAPP_NUMERO_PADRAO = "5511999999999";

// PORQUÊ: número real do escritório chega via env WHATSAPP_NUMBER no
// deploy; o placeholder mantém o fluxo clicável em preview/local.
export function resolverNumeroWhatsApp(env) {
  const numero = (env?.WHATSAPP_NUMBER ?? "").trim();
  return numero === "" ? WHATSAPP_NUMERO_PADRAO : numero;
}

/**
 * @param {string} relato
 * @returns {string}
 */
export function normalizarRelato(relato) {
  return relato.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * @typedef {{ chaves: string[], direito: string, documento: string, grave: boolean }} SinalJuridico
 * @typedef {{ direitos: string[], documentos: string[], grave: boolean }} AvaliacaoSinais
 */

/**
 * @param {string} relatoNorm
 * @param {SinalJuridico[]} sinais
 * @returns {AvaliacaoSinais}
 */
function avaliarPorSinais(relatoNorm, sinais) {
  const direitos = [];
  const documentos = [];
  let grave = false;
  for (const sinal of sinais) {
    if (!sinal.chaves.some((c) => relatoNorm.includes(c))) continue;
    direitos.push(sinal.direito);
    documentos.push(sinal.documento);
    if (sinal.grave) grave = true;
  }
  return { direitos, documentos, grave };
}

const SINAIS_TRABALHISTAS = [
  { chaves: ["justa causa"], direito: "Reversão de Demissão por Justa Causa (liberação de FGTS e Seguro-Desemprego)", documento: "Guardar cópia da carta de demissão e advertências prévias.", grave: true },
  { chaves: ["hora", "extra", "jornada"], direito: "Cobrança de Horas Extras e Reflexos em Verbas Rescisórias", documento: "Separar registros de ponto, mensagens de WhatsApp fora do horário e e-mails.", grave: false },
  { chaves: ["insalubridade", "periculosidade", "risco"], direito: "Adicional de Insalubridade ou Periculosidade", documento: "Listar EPIs recebidos e descrição detalhada do ambiente de trabalho.", grave: false },
  { chaves: ["assedio", "humilh", "pressao"], direito: "Indenização por Assédio Moral e Possibilidade de Rescisão Indireta", documento: "Preservar áudios, mensagens e nomes de testemunhas.", grave: true },
  { chaves: ["acidente", "machuc", "cirurgia"], direito: "Estabilidade Provisória e Reparação por Acidente de Trabalho", documento: "Apresentar laudos médicos, CAT (Comunicação de Acidente de Trabalho) e exames.", grave: true },
];

const SINAIS_PREVIDENCIARIOS = [
  { chaves: ["negad", "negou", "indefer", "recusou"], direito: "Ação Judicial para Concessão ou Restabelecimento de Benefício do INSS", documento: "Separar a Carta de Indeferimento do INSS e cópia do processo administrativo.", grave: true },
  { chaves: ["auxilio", "doenca", "incapacidade"], direito: "Auxílio por Incapacidade Temporária ou Aposentadoria por Invalidez", documento: "Reunir laudos médicos atualizados com CID e atestados médicos recentes.", grave: false },
  { chaves: ["bpc", "loas", "idoso", "vulnerab"], direito: "Benefício de Prestação Continuada (BPC/LOAS)", documento: "Comprovante de inscrição no CadÚnico atualizado e comprovantes de renda familiar.", grave: false },
  { chaves: ["aposentadoria", "tempo", "idade", "planejamento"], direito: "Planejamento Previdenciário Estratégico e Aposentadoria Especial", documento: "Extrair o extrato CNIS completo no portal Meu INSS e cópias de Carteiras de Trabalho.", grave: false },
];

const SINAIS_CIVEIS = [
  { chaves: ["contrato", "clausula", "quebra"], direito: "Revisão Contratual, Cobrança de Multas ou Rescisão com Ressarcimento", documento: "Apresentar o contrato assinado e comprovantes de pagamentos efetuados.", grave: false },
  { chaves: ["inventario", "heranca", "falec"], direito: "Abertura de Inventário Judicial ou Extrajudicial e Partilha de Bens", documento: "Certidão de óbito e certidões imobiliárias dos bens a inventariar.", grave: false },
  { chaves: ["divorcio", "pensao", "guarda"], direito: "Ação de Divórcio, Definição de Guarda e Alimentos", documento: "Certidão de casamento e certidão de nascimento dos filhos.", grave: false },
];

const SINAIS_CONSUMIDOR = [
  { chaves: ["nome", "serasa", "spc", "negativ"], direito: "Retirada Imediata de Negativação Indevida e Indenização por Danos Morais", documento: "Comprovante da restrição nos órgãos de proteção ao crédito (Serasa/SPC).", grave: true },
  { chaves: ["plano", "saude", "cirurgia", "medicamento"], direito: "Pedido Liminar Urgente contra Negativa Abusiva do Plano de Saúde", documento: "Relatório médico com urgência expressa e negativa formal da operadora.", grave: true },
  { chaves: ["banco", "juros", "golpe", "pix"], direito: "Ação Reparatória e Restituição por Fraude Bancária ou Práticas Abusivas", documento: "Boletim de ocorrência e extratos bancários com os débitos contestados.", grave: false },
];

/**
 * @param {string} relatoNorm
 * @returns {AvaliacaoSinais}
 */
export function avaliarSinaisTrabalhistas(relatoNorm) {
  const resultado = avaliarPorSinais(relatoNorm, SINAIS_TRABALHISTAS);
  if (resultado.direitos.length > 0) return resultado;
  resultado.direitos.push("Revisão Integral de Verbas Rescisórias e Direitos Trabalhistas");
  resultado.documentos.push("Apresentar Termo de Rescisão (TRCT) e extrato do FGTS.");
  return resultado;
}

/**
 * @param {string} relatoNorm
 * @returns {AvaliacaoSinais}
 */
export function avaliarSinaisPrevidenciarios(relatoNorm) {
  const resultado = avaliarPorSinais(relatoNorm, SINAIS_PREVIDENCIARIOS);
  if (resultado.direitos.length > 0) return resultado;
  resultado.direitos.push("Diagnóstico Completo de Direitos Previdenciários perante o INSS");
  resultado.documentos.push("Acessar o Meu INSS para baixar o extrato CNIS para análise.");
  return resultado;
}

/**
 * @param {string} relatoNorm
 * @returns {AvaliacaoSinais}
 */
export function avaliarSinaisCiveis(relatoNorm) {
  const resultado = avaliarPorSinais(relatoNorm, SINAIS_CIVEIS);
  if (resultado.direitos.length > 0) return resultado;
  resultado.direitos.push("Assessoria Cível Preventiva ou Contenciosa Especializada");
  resultado.documentos.push("Reunir documentos comprobatórios dos fatos alegados.");
  return resultado;
}

/**
 * @param {string} relatoNorm
 * @returns {AvaliacaoSinais}
 */
export function avaliarSinaisConsumidor(relatoNorm) {
  const resultado = avaliarPorSinais(relatoNorm, SINAIS_CONSUMIDOR);
  if (resultado.direitos.length > 0) return resultado;
  resultado.direitos.push("Defesa dos Direitos do Consumidor e Reparação por Danos");
  resultado.documentos.push("Protocolos de atendimento e notas fiscais do serviço contratado.");
  return resultado;
}

const AVALIADORES_POR_AREA = {
  trabalhista: avaliarSinaisTrabalhistas,
  previdenciario: avaliarSinaisPrevidenciarios,
  civel: avaliarSinaisCiveis,
};

/**
 * @param {string} area
 * @param {string} relatoNorm
 * @returns {AvaliacaoSinais}
 */
function selecionarAvaliacao(area, relatoNorm) {
  const avaliar = AVALIADORES_POR_AREA[area] ?? avaliarSinaisConsumidor;
  return avaliar(relatoNorm);
}

/**
 * @typedef {{ protocolo: string, areaIdentificada: string, nivelGravidade: string, prazoAtendimento: string, direitosIdentificados: string[], documentosSugeridos: string[], resumo: string }} AnaliseTriagem
 */

/**
 * @param {AnaliseTriagem} analise
 * @param {{ nome?: string, telefone?: string, relato: string }} contato
 * @returns {string}
 */
function montarTextoWhatsApp(analise, contato) {
  const linhas = [
    "Olá, Dr. Miller Costa! Realizei a triagem prévia no seu site.",
    "",
    `📌 *Protocolo:* ${analise.protocolo}`,
    `⚖️ *Área:* ${analise.areaIdentificada}`,
    `👤 *Nome:* ${contato.nome || "Não informado"}`,
    `📱 *Contato:* ${contato.telefone || "Não informado"}`,
    `🚨 *Urgência:* ${analise.nivelGravidade.toUpperCase()}`,
    "",
    `*Resumo do Caso:* ${contato.relato}`,
    "",
    "*Direitos Pontuados na Triagem:*",
    ...analise.direitosIdentificados.map((d) => `• ${d}`),
    "",
    "Gostaria de agendar uma consulta para avaliar meu caso com o escritório.",
  ];
  return encodeURIComponent(linhas.join("\n"));
}

/**
 * @param {{ area: string, relato: string, urgencia?: string, nome?: string, telefone?: string, whatsappNumero?: string }} entrada
 * @returns {{ analise: AnaliseTriagem, whatsappUrl: string }}
 */
export function analisarTriagem({ area, relato, urgencia, nome, telefone, whatsappNumero }) {
  if (!area || !relato) {
    throw new Error(
      `triagem inválida: recebido area=${JSON.stringify(area)} relatoPresente=${Boolean(relato)}; esperado area e relato não vazios`
    );
  }
  const relatoNorm = normalizarRelato(relato);
  const base = selecionarAvaliacao(area, relatoNorm);
  const gravidade = base.grave ? "alta" : (urgencia || "moderada");
  const prazo = gravidade === "alta"
    ? "Atendimento prioritário em até 2 horas úteis"
    : "Retorno especializado em até 24 horas úteis";
  const analise = {
    protocolo: `MC-${Date.now().toString().slice(-6)}`,
    areaIdentificada: area.toUpperCase(),
    nivelGravidade: gravidade,
    prazoAtendimento: prazo,
    direitosIdentificados: base.direitos,
    documentosSugeridos: base.documentos,
    resumo: `Relato com indícios consistentes para atuação técnica em ${area}. Recomenda-se alinhamento imediato com a equipe do Dr. Miller Costa.`,
  };
  const numero = (whatsappNumero ?? "").trim() === "" ? WHATSAPP_NUMERO_PADRAO : whatsappNumero.trim();
  const texto = montarTextoWhatsApp(analise, { nome, telefone, relato });
  return { analise, whatsappUrl: `https://wa.me/${numero}?text=${texto}` };
}
