export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    service: "miller-costa-inteligencia-juridica",
    platform: "vercel",
    timestamp: new Date().toISOString()
  });
}
