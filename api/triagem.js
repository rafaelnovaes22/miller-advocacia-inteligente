import { analisarTriagem, resolverNumeroWhatsApp } from "../lib/triagemCore.js";

/**
 * @typedef {{ method?: string, body?: import("../lib/triagemCore.js").EntradaTriagem }} TriagemRequest
 * @typedef {{ setHeader: (nome: string, valor: string) => void, status: (code: number) => { end: () => unknown, json: (body: unknown) => unknown } }} TriagemResponse
 * @param {TriagemRequest} req
 * @param {TriagemResponse} res
 */
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { area, relato, urgencia, nome, telefone } = req.body || {};

  if (!area || !relato) {
    return res.status(400).json({
      error: "Área e relato do caso são obrigatórios para a análise preliminar.",
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
    console.log(
      JSON.stringify({
        event: "triagem_concluida",
        plataforma: "vercel",
        protocolo: resultado.analise.protocolo,
        area,
        gravidade: resultado.analise.nivelGravidade,
      })
    );
    return res.status(200).json(resultado);
  } catch (err) {
    console.log(
      JSON.stringify({
        event: "triagem_falhou",
        plataforma: "vercel",
        area,
        detalhe: String(err?.message ?? err),
      })
    );
    return res.status(500).json({ error: "Falha ao processar a triagem. Tente novamente." });
  }
}
