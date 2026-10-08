# Miller Costa Advogados & BAM Inteligência Jurídica

Portal institucional de alta conversão e triagem interativa com inteligência artificial para o escritório Miller Costa Advogados.

## Objetivo do Produto

Este projeto foi concebido para resolver o gargalo de atendimento inicial do escritório jurídico:
1. **Posicionamento de Autoridade**: Apresentação clara das 4 frentes de atuação (Direito do Trabalho, Direito Previdenciário / INSS, Cível & Contratos e Consumidor) na Grande São Paulo.
2. **Triagem Preliminar com Inteligência Artificial**: O cliente em potencial descreve sua situação e recebe instantaneamente um diagnóstico preliminar com os direitos prováveis e documentos recomendados.
3. **Transbordo Qualificado para o WhatsApp**: O lead clica no botão e já abre o WhatsApp do Dr. Miller Costa com o caso estruturado, reduzindo tempo de atendimento e aumentando a taxa de fechamento.

## Endpoints

- `GET /`: Landing page interativa e simulador de caso.
- `GET /health`: Verificação de saúde e disponibilidade da aplicação.
- `POST /api/triagem`: Motor de análise preliminar e formatação de caso para WhatsApp.

## Execução Local

```bash
npm install
npm start
```
Acesse `http://localhost:3000`.
