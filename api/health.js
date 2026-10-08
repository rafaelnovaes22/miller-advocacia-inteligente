/**
 * @param {import("node:http").IncomingMessage} req
 * @param {{ status: (code: number) => { json: (body: unknown) => unknown } }} res
 */
export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    service: "miller-costa-inteligencia-juridica",
    platform: "vercel",
    timestamp: new Date().toISOString(),
  });
}
