// ==========================================================================
// Miller Costa Advogados - Lógica da Interface & Motor de Triagem
// ==========================================================================

let areaSelecionada = "trabalhista";

// Fechar Banner Didático
const closeBannerBtn = document.getElementById("closeBannerBtn");
const objectiveBanner = document.getElementById("objectiveBanner");
if (closeBannerBtn && objectiveBanner) {
  closeBannerBtn.addEventListener("click", () => {
    objectiveBanner.style.display = "none";
  });
}

// Seletor de Áreas na Triagem
const areaButtons = document.querySelectorAll(".btn-select");
areaButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    areaButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    areaSelecionada = btn.getAttribute("data-area");
    atualizarSugestoesRapidas(areaSelecionada);
  });
});

// Atualizar Sugestões Rápidas de acordo com a área
function atualizarSugestoesRapidas(area) {
  const container = document.getElementById("quickButtons");
  if (!container) return;

  const sugestoes = {
    trabalhista: [
      {
        titulo: "Demitido por justa causa injustamente",
        texto:
          "Fui demitido por justa causa sem justificativa plausível e não recebi rescisão nem guias do FGTS.",
      },
      {
        titulo: "Horas extras não pagas",
        texto:
          "Trabalhava fazendo horas extras diárias sem receber e nunca tive intervalo para almoço respeitado.",
      },
      {
        titulo: "Insalubridade ou periculosidade",
        texto:
          "Trabalhava exposto a agentes nocivos e risco sem proteção adequada e sem receber o adicional na folha.",
      },
      {
        titulo: "Assédio moral ou pressão abusiva",
        texto: "Sofria constantes humilhações da chefia com metas abusivas, causando abalo emocional severo.",
      },
    ],
    previdenciario: [
      {
        titulo: "Benefício negado pelo INSS",
        texto:
          "O INSS negou meu pedido de auxílio por incapacidade temporária mesmo com laudo médico indicando afastamento.",
      },
      {
        titulo: "Planejamento de Aposentadoria",
        texto:
          "Tenho mais de 30 anos de contribuição e quero saber se já posso me aposentar ou qual a regra mais vantajosa.",
      },
      {
        titulo: "Pedido de BPC / LOAS",
        texto:
          "Pessoa idosa ou com deficiência de baixa renda na família que necessita do benefício assistencial.",
      },
      {
        titulo: "Pensão por morte negada",
        texto: "O INSS indeferiu a concessão da pensão por morte alegando falta de qualidade de segurado.",
      },
    ],
    civel: [
      {
        titulo: "Quebra de contrato ou dívida",
        texto:
          "Contratei uma prestação de serviços que não foi cumprida e sofri prejuízo financeiro considerável.",
      },
      {
        titulo: "Abertura de Inventário e Herança",
        texto: "Falecimento de parente com bens a partilhar e necessidade de inventário ágil.",
      },
      {
        titulo: "Divórcio e partilha consensual",
        texto: "Necessidade de homologação de divórcio com partilha de patrimônio e definição de guarda.",
      },
    ],
    consumidor: [
      {
        titulo: "Negativação indevida Serasa",
        texto: "Meu nome foi inserido no Serasa/SPC por uma cobrança que desconheço ou já paguei.",
      },
      {
        titulo: "Negativa de Cirurgia ou Exame pelo Plano",
        texto:
          "O plano de saúde negou cobertura de procedimento médico prescrito com urgência pelo especialista.",
      },
      {
        titulo: "Fraude bancária ou golpe do Pix",
        texto:
          "Tive valores retirados da minha conta bancária em transação atípica e o banco se recusa a ressarcir.",
      },
    ],
  };

  const lista = sugestoes[area] || sugestoes.trabalhista;
  container.innerHTML = "";

  lista.forEach((item) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn-quick";
    b.setAttribute("data-text", item.texto);
    b.textContent = item.titulo;
    b.addEventListener("click", () => {
      document.getElementById("relatoInput").value = item.texto;
      document.getElementById("relatoInput").focus();
    });
    container.appendChild(b);
  });
}

// Vincular clique nas sugestões iniciais
document.querySelectorAll(".btn-quick").forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = btn.getAttribute("data-text");
    const input = document.getElementById("relatoInput");
    if (input && text) {
      input.value = text;
      input.focus();
    }
  });
});

// Função chamada pelos botões das 4 áreas
window.selecionarAreaParaTriagem = function (area) {
  const targetBtn = document.querySelector(`.btn-select[data-area="${area}"]`);
  if (targetBtn) {
    areaButtons.forEach((b) => b.classList.remove("active"));
    targetBtn.classList.add("active");
    areaSelecionada = area;
    atualizarSugestoesRapidas(area);
  }

  const sectionTriagem = document.getElementById("triagem");
  if (sectionTriagem) {
    sectionTriagem.scrollIntoView({ behavior: "smooth" });
    const input = document.getElementById("relatoInput");
    if (input) setTimeout(() => input.focus(), 600);
  }
};

// Processamento da Triagem com o Servidor
const btnProcessar = document.getElementById("btnProcessarTriagem");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");
const resultadoBox = document.getElementById("resultadoBox");

if (btnProcessar) {
  btnProcessar.addEventListener("click", async () => {
    const relato = document.getElementById("relatoInput").value.trim();
    const nome = document.getElementById("nomeInput").value.trim();
    const telefone = document.getElementById("telefoneInput").value.trim();
    const urgencia = document.getElementById("urgenciaSelect").value;

    if (!relato) {
      alert("Por favor, descreva brevemente seu caso para que nossa inteligência jurídica possa avaliá-lo.");
      document.getElementById("relatoInput").focus();
      return;
    }

    // Feedback de carregamento
    btnText.textContent = "Analisando com Inteligência Jurídica...";
    btnSpinner.classList.remove("hidden");
    btnProcessar.disabled = true;

    try {
      const response = await fetch("/api/triagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: areaSelecionada,
          relato,
          nome,
          telefone,
          urgencia,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar análise.");
      }

      const { analise, whatsappUrl } = data;

      // Preenchimento dos resultados na tela
      document.getElementById("resProtocolo").textContent = `PROTOCOLO: ${analise.protocolo}`;
      document.getElementById("resUrgencia").textContent =
        `PRIORIDADE ${analise.nivelGravidade.toUpperCase()}`;
      document.getElementById("resResumo").textContent = analise.resumo;

      // Lista de direitos
      const resDireitos = document.getElementById("resDireitos");
      resDireitos.innerHTML = "";
      analise.direitosIdentificados.forEach((dir) => {
        const li = document.createElement("li");
        li.textContent = dir;
        resDireitos.appendChild(li);
      });

      // Lista de documentos
      const resDocumentos = document.getElementById("resDocumentos");
      resDocumentos.innerHTML = "";
      analise.documentosSugeridos.forEach((doc) => {
        const li = document.createElement("li");
        li.textContent = doc;
        resDocumentos.appendChild(li);
      });

      // Atualiza link de WhatsApp
      const btnEnviarWhatsApp = document.getElementById("btnEnviarWhatsApp");
      btnEnviarWhatsApp.href = whatsappUrl;

      resultadoBox.classList.remove("hidden");
      resultadoBox.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error(err);
      alert("Houve uma instabilidade na conexão. Tente novamente em alguns segundos.");
    } finally {
      btnText.textContent = "Processar Análise do Caso com IA";
      btnSpinner.classList.add("hidden");
      btnProcessar.disabled = false;
    }
  });
}

// Acordeão de FAQ
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) => {
  const btn = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  btn.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    // Fecha os outros
    faqItems.forEach((other) => {
      other.classList.remove("active");
      const otherAnswer = other.querySelector(".faq-answer");
      if (otherAnswer) otherAnswer.style.maxHeight = null;
    });

    if (!isActive) {
      item.classList.add("active");
      answer.style.maxHeight = answer.scrollHeight + 30 + "px";
    }
  });
});
