# Miller Costa Advocacia

Portal institucional + triagem juridica. Motor unico em `lib/triagemCore.js`, compartilhado entre Express (`server.js`) e Vercel (`api/triagem.js`).

## Comandos

```bash
bin/setup            # setup idempotente: node >=20, npm ci, typecheck, testes
npm test             # suite completa, sem segredos: node --test test/triagem.test.js
npm run typecheck    # tsc --noEmit em server.js, lib/, api/, test/ via jsconfig.json
npm start            # prod local na porta 3000
npm run dev          # watch mode
npm run format       # prettier --write .
npm run format:check # prettier --check .
```

## Rotas

- `GET /` landing em `public/index.html`
- `GET /health` retorna `{status, service, uptime, timestamp}`
- `POST /api/triagem` body `{area, relato, urgencia?, nome?, telefone?}`, erro 400 sem area ou relato

## Env

- `PORT` (default 3000)
- `WHATSAPP_NUMBER` (default placeholder em `lib/triagemCore.js`)

## Regras

- Nunca duplicar logica de triagem fora de `lib/triagemCore.js`.
- Logs sempre JSON com `event` nomeado.
- JSDoc obrigatorio em funcao publica nova de `lib/`.
