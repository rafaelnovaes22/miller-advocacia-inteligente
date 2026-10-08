import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rota de Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "miller-costa-inteligencia-juridica",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Motor de Triagem Jurídica Inteligente
app.post("/api/triagem", (req, res) => {
  const { area, relato, tempoOcorrido, urgencia, nome, telefone } = req.body;

  if (!area || !relato) {
    return res.status(400).json({
      error: "Área e relato do caso são obrigatórios para a análise preliminar."
    });
  }

  // Análise com normalização de texto sem acentos
  const relatoNormalizado = relato.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const direitosIdentificados = [];
  const recomendacoes = [];
  let gravidade = urgencia || "moderada";

  if (area === "trabalhista") {
    if (relatoNormalizado.includes("justa causa")) {
      direitosIdentificados.push("Reversão de Demissão por Justa Causa (liberação de FGTS e Seguro-Desemprego)");
      recomendacoes.push("Guardar cópia da carta de demissão e advertências prévias.");
      gravidade = "alta";
    }
    if (relatoNormalizado.includes("hora") || relatoNormalizado.includes("extra") || relatoNormalizado.includes("jornada")) {
      direitosIdentificados.push("Cobrança de Horas Extras e Reflexos em Verbas Rescisórias");
      recomendacoes.push("Separar registros de ponto, mensagens de WhatsApp fora do horário e e-mails.");
    }
    if (relatoNormalizado.includes("insalubridade") || relatoNormalizado.includes("periculosidade") || relatoNormalizado.includes("risco")) {
      direitosIdentificados.push("Adicional de Insalubridade ou Periculosidade");
      recomendacoes.push("Listar EPIs recebidos e descrição detalhada do ambiente de trabalho.");
    }
    if (relatoNormalizado.includes("assedio") || relatoNormalizado.includes("humilh") || relatoNormalizado.includes("pressao")) {
      direitosIdentificados.push("Indenização por Assédio Moral e Possibilidade de Rescisão Indireta");
      recomendacoes.push("Preservar áudios, mensagens e nomes de testemunhas.");
      gravidade = "alta";
    }
    if (relatoNormalizado.includes("acidente") || relatoNormalizado.includes("machuc") || relatoNormalizado.includes("cirurgia")) {
      direitosIdentificados.push("Estabilidade Provisória e Reparação por Acidente de Trabalho");
      recomendacoes.push("Apresentar laudos médicos, CAT (Comunicação de Acidente de Trabalho) e exames.");
      gravidade = "alta";
    }

    if (direitosIdentificados.length === 0) {
      direitosIdentificados.push("Revisão Integral de Verbas Rescisórias e Direitos Trabalhistas");
      recomendacoes.push("Apresentar Termo de Rescisão (TRCT) e extrato do FGTS.");
    }
  } else if (area === "previdenciario") {
    if (relatoNormalizado.includes("negad") || relatoNormalizado.includes("negou") || relatoNormalizado.includes("indefer") || relatoNormalizado.includes("recusou")) {
      direitosIdentificados.push("Ação Judicial para Concessão ou Restabelecimento de Benefício do INSS");
      recomendacoes.push("Separar a Carta de Indeferimento do INSS e cópia do processo administrativo.");
      gravidade = "alta";
    }
    if (relatoNormalizado.includes("auxilio") || relatoNormalizado.includes("doenca") || relatoNormalizado.includes("incapacidade")) {
      direitosIdentificados.push("Auxílio por Incapacidade Temporária ou Aposentadoria por Invalidez");
      recomendacoes.push("Reunir laudos médicos atualizados com CID e atestados médicos recentes.");
    }
    if (relatoNormalizado.includes("bpc") || relatoNormalizado.includes("loas") || relatoNormalizado.includes("idoso") || relatoNormalizado.includes("vulnerab")) {
      direitosIdentificados.push("Benefício de Prestação Continuada (BPC/LOAS)");
      recomendacoes.push("Comprovante de inscrição no CadÚnico atualizado e comprovantes de renda familiar.");
    }
    if (relatoNormalizado.includes("aposentadoria") || relatoNormalizado.includes("tempo") || relatoNormalizado.includes("idade") || relatoNormalizado.includes("planejamento")) {
      direitosIdentificados.push("Planejamento Previdenciário Estratégico e Aposentadoria Especial");
      recomendacoes.push("Extrair o extrato CNIS completo no portal Meu INSS e cópias de Carteiras de Trabalho.");
    }

    if (direitosIdentificados.length === 0) {
      direitosIdentificados.push("Diagnóstico Completo de Direitos Previdenciários perante o INSS");
      recomendacoes.push("Acessar o Meu INSS para baixar o extrato CNIS para análise.");
    }
  } else if (area === "civel") {
    if (relatoNormalizado.includes("contrato") || relatoNormalizado.includes("clausula") || relatoNormalizado.includes("quebra")) {
      direitosIdentificados.push("Revisão Contratual, Cobrança de Multas ou Rescisão com Ressarcimento");
      recomendacoes.push("Apresentar o contrato assinado e comprovantes de pagamentos efetuados.");
    }
    if (relatoNormalizado.includes("inventario") || relatoNormalizado.includes("heranca") || relatoNormalizado.includes("falec")) {
      direitosIdentificados.push("Abertura de Inventário Judicial ou Extrajudicial e Partilha de Bens");
      recomendacoes.push("Certidão de óbito e certidões imobiliárias dos bens a inventariar.");
    }
    if (relatoNormalizado.includes("divorcio") || relatoNormalizado.includes("pensao") || relatoNormalizado.includes("guarda")) {
      direitosIdentificados.push("Ação de Divórcio, Definição de Guarda e Alimentos");
      recomendacoes.push("Certidão de casamento e certidão de nascimento dos filhos.");
    }

    if (direitosIdentificados.length === 0) {
      direitosIdentificados.push("Assessoria Cível Preventiva ou Contenciosa Especializada");
      recomendacoes.push("Reunir documentos comprobatórios dos fatos alegados.");
    }
  } else {
    // Consumidor
    if (relatoNormalizado.includes("nome") || relatoNormalizado.includes("serasa") || relatoNormalizado.includes("spc") || relatoNormalizado.includes("negativ")) {
      direitosIdentificados.push("Retirada Imediata de Negativação Indevida e Indenização por Danos Morais");
      recomendacoes.push("Comprovante da restrição nos órgãos de proteção ao crédito (Serasa/SPC).");
      gravidade = "alta";
    }
    if (relatoNormalizado.includes("plano") || relatoNormalizado.includes("saude") || relatoNormalizado.includes("cirurgia") || relatoNormalizado.includes("medicamento")) {
      direitosIdentificados.push("Pedido Liminar Urgente contra Negativa Abusiva do Plano de Saúde");
      recomendacoes.push("Relatório médico com urgência expressa e negativa formal da operadora.");
      gravidade = "alta";
    }
    if (relatoNormalizado.includes("banco") || relatoNormalizado.includes("juros") || relatoNormalizado.includes("golpe") || relatoNormalizado.includes("pix")) {
      direitosIdentificados.push("Ação Reparatória e Restituição por Fraude Bancária ou Práticas Abusivas");
      recomendacoes.push("Boletim de ocorrência e extratos bancários com os débitos contestados.");
    }

    if (direitosIdentificados.length === 0) {
      direitosIdentificados.push("Defesa dos Direitos do Consumidor e Reparação por Danos");
      recomendacoes.push("Protocolos de atendimento e notas fiscais do serviço contratado.");
    }
  }

  const prazoEstimado = gravidade === "alta" ? "Atendimento prioritário em até 2 horas úteis" : "Retorno especializado em até 24 horas úteis";

  const analise = {
    protocolo: `MC-${Date.now().toString().slice(-6)}`,
    areaIdentificada: area.toUpperCase(),
    nivelGravidade: gravidade,
    prazoAtendimento: prazoEstimado,
    direitosIdentificados,
    documentosSugeridos: recomendacoes,
    resumo: `Relato com indícios consistentes para atuação técnica em ${area}. Recomenda-se alinhamento imediato com a equipe do Dr. Miller Costa.`
  };

  // Texto formatado para o WhatsApp
  const mensagemWhatsApp = encodeURIComponent(
    `Olá, Dr. Miller Costa! Realizei a triagem prévia no seu site.\n\n` +
    `📌 *Protocolo:* ${analise.protocolo}\n` +
    `⚖️ *Área:* ${analise.areaIdentificada}\n` +
    `👤 *Nome:* ${nome || "Não informado"}\n` +
    `📱 *Contato:* ${telefone || "Não informado"}\n` +
    `🚨 *Urgência:* ${gravidade.toUpperCase()}\n\n` +
    `*Resumo do Caso:* ${relato}\n\n` +
    `*Direitos Pontuados na Triagem:*\n${direitosIdentificados.map(d => `• ${d}`).join("\n")}\n\n` +
    `Gostaria de agendar uma consulta para avaliar meu caso com o escritório.`
  );

  return res.json({
    analise,
    whatsappUrl: `https://wa.me/5511999999999?text=${mensagemWhatsApp}`
  });
});

app.listen(port, () => {
  console.log(`Servidor Miller Costa Advocacia rodando na porta ${port}`);
});
