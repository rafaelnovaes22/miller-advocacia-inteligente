import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { analisarTriagem, resolverNumeroWhatsApp } from "./lib/triagemCore.js";

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

// Motor de Triagem Jurídica Inteligente (lógica em lib/triagemCore.js,
// compartilhada com a serverless function api/triagem.js da Vercel)
app.post("/api/triagem", (req, res) => {
  const { area, relato, urgencia, nome, telefone } = req.body ?? {};

  if (!area || !relato) {
    return res.status(400).json({
      error: "Área e relato do caso são obrigatórios para a análise preliminar."
    });
  }

  try {
    const resultado = analisarTriagem({
      area,
      relato,
      urgencia,
      nome,
      telefone,
      whatsappNumero: resolverNumeroWhatsApp(process.env),
    });
    console.log(JSON.stringify({
      event: "triagem_concluida",
      protocolo: resultado.analise.protocolo,
      area,
      gravidade: resultado.analise.nivelGravidade,
    }));
    return res.json(resultado);
  } catch (err) {
    console.log(JSON.stringify({ event: "triagem_falhou", area, detalhe: String(err?.message ?? err) }));
    return res.status(500).json({ error: "Falha ao processar a triagem. Tente novamente." });
  }
});

app.listen(port, () => {
  console.log(`Servidor Miller Costa Advocacia rodando na porta ${port}`);
});
