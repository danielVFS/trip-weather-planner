# Bugs - Trip Weather Planner

Data da QA: 2026-05-20

## BUG-01 - Testes esperam prefixo de data diferente do texto renderizado em recentes

- Severidade: Media
- Status: Aberto
- Area: Frontend / testes unitarios / E2E
- Requisitos afetados: RF-12, RF-31, RF-32, RF-33, RF-37
- Evidencias:
  - `bun run test` falha em `frontend/src/pages/home.test.tsx:179`.
  - `bun run test:e2e:record` falha em `e2e/app.spec.ts:94` nos projetos `chromium`, `firefox` e `mobile-chrome`.
  - Contextos Playwright: `test-results/app-salva-recentes-e-permite-limpar-a-lista-chromium/error-context.md`, `test-results/app-salva-recentes-e-permite-limpar-a-lista-firefox/error-context.md`, `test-results/app-salva-recentes-e-permite-limpar-a-lista-mobile-chrome/error-context.md`.
  - Screenshot manual: `tasks/prd-trip-weather-planner/qa-evidence/qa-recents.png`.
- Resultado esperado pelo teste: texto contendo `Busca: dd/mm/aaaa`.
- Resultado atual: UI renderiza `Última vez buscado 20/05/2026`.
- Impacto: o comportamento funcional de persistir recentes com data/min/max aparece operante na exploracao manual, mas a suite automatizada obrigatoria nao passa. Isso impede aprovacao de QA conforme o PRD exige E2E deterministico aprovado.
- Observacao: decidir se o contrato de UI deve voltar para `Busca:` ou se os testes devem ser atualizados para o texto atual acessivel.

## BUG-02 - Console registra 404 para favicon.ico

- Severidade: Baixa
- Status: Aberto
- Area: Frontend / asset estatico
- Requisitos afetados: qualidade geral da experiencia, sem bloqueio funcional direto.
- Evidencia: Playwright MCP `browser_console_messages` registrou `Failed to load resource: the server responded with a status of 404 (Not Found) @ http://localhost:5173/favicon.ico`.
- Impacto: ruido em console durante QA e pode mascarar regressões mais relevantes.
- Recomendacao: adicionar favicon referenciado pelo `index.html` ou remover a referencia implicita/explicita.
