# Bugs - Trip Weather Planner

Data da QA: 2026-05-20

## BUG-01 - Testes esperam prefixo de data diferente do texto renderizado em recentes

- Severidade: Media
- Status: Corrigido
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
- Correcao aplicada: testes unitario e E2E atualizados para validar o contrato acessivel renderizado pela UI: `Última vez buscado dd/mm/aaaa`, mantendo data, temperatura minima e maxima exigidas pelo PRD.
- Testes de regressao:
  - `frontend/src/pages/home.test.tsx` cobre recentes persistidos com texto `Última vez buscado 20/05/2026`, min e max.
  - `e2e/app.spec.ts` cobre o fluxo salvar recentes/voltar para busca/limpar recentes em `chromium`, `firefox` e `mobile-chrome`.

## BUG-02 - Console registra 404 para favicon.ico

- Severidade: Baixa
- Status: Corrigido
- Area: Frontend / asset estatico
- Requisitos afetados: qualidade geral da experiencia, sem bloqueio funcional direto.
- Evidencia: Playwright MCP `browser_console_messages` registrou `Failed to load resource: the server responded with a status of 404 (Not Found) @ http://localhost:5173/favicon.ico`.
- Impacto: ruido em console durante QA e pode mascarar regressões mais relevantes.
- Recomendacao: adicionar favicon referenciado pelo `index.html` ou remover a referencia implicita/explicita.
- Correcao aplicada: adicionado `frontend/public/favicon.svg` e referencia explicita em `frontend/index.html` com `rel="icon"`, evitando a requisicao implicita sem asset configurado.
- Testes de regressao:
  - `e2e/app.spec.ts` inclui o caso `serve o favicon sem erro 404`, validando status `200` e `content-type` SVG.
  - Validacao Playwright MCP confirmou zero mensagens de console em nivel warning/error apos carregar a pagina.

## BUG-03 - Comando E2E padrao abre runner interativo

- Severidade: Media
- Status: Corrigido
- Area: Configuracao / Playwright
- Requisitos afetados: RF-27 a RF-38, validacao final automatizada.
- Evidencia: review final apontou que `bun run test:e2e` executava `playwright test --ui`, duplicando o papel de `test:e2e:ui` e impedindo execucao batch deterministica.
- Impacto: validacao final nao era reproduzivel em terminal/CI pelo comando padrao do projeto.
- Correcao aplicada: `test:e2e` agora executa `playwright test`; o modo interativo permanece em `test:e2e:ui`.
- Testes de regressao:
  - `bun run test:e2e` executado em modo batch com 28 testes passando e 2 skipped no ambiente atual.

## BUG-04 - Snapshot de recentes usa temperatura atual como maxima

- Severidade: Media
- Status: Corrigido
- Area: Backend / Frontend / normalizacao de previsao
- Requisitos afetados: RF-12, RF-18, RF-20, RF-33.
- Evidencia: review final apontou que `normalizeCurrentForecast` preenchia `maxTemperatureC` com `current.temperature_2m`; recentes eram salvos a partir de `forecast.current`.
- Impacto: a UI podia exibir "Max" com a temperatura atual em vez da maxima diaria prevista.
- Correcao aplicada: `normalizeCurrentForecast` preserva maxima diaria via `fallbackDay.maxTemperatureC`, e o snapshot de recentes usa o primeiro item de `forecast.daily`.
- Testes de regressao:
  - `backend/src/index.test.ts` valida que `current.maxTemperatureC` vem da maxima diaria.
  - `frontend/src/pages/city-details.test.tsx` valida snapshot salvo com data/min/max do primeiro dia da previsao.
  - `e2e/app.spec.ts` valida recentes com minima/maxima diaria apos consultar a previsao.

## BUG-05 - Backend nao registra logs estruturados

- Severidade: Baixa
- Status: Corrigido
- Area: Backend / observabilidade
- Requisitos afetados: TechSpec / Monitoramento e Observabilidade.
- Evidencia: review final apontou ausencia de logs de rota, status, duracao, tipo de erro e origem.
- Impacto: execucao local e troubleshooting de falhas da API externa ficavam sem telemetria minima.
- Correcao aplicada: adicionado middleware Hono global que registra JSON com `method`, `route`, `status`, `durationMs`, `errorType` e `origin`.
- Testes de regressao:
  - `backend/src/index.test.ts` valida o log estruturado para `GET /health`.

## BUG-06 - Projeto WebKit falha por dependencias nativas ausentes

- Severidade: Alta
- Status: Parcialmente corrigido / bloqueado por ambiente
- Area: Playwright / ambiente local
- Requisitos afetados: RF-27 a RF-38, validacao E2E.
- Evidencia: review final e `bun run test:e2e:webkit` falham ao iniciar WebKit por bibliotecas ausentes (`libgtk-4.so.1`, `libgraphene-1.0.so.0`, `libevent-2.1.so.7`, GStreamer, entre outras).
- Impacto: WebKit nao executa neste host sem instalar dependencias de sistema.
- Correcao aplicada: o comando padrao `bun run test:e2e` nao inclui WebKit neste ambiente; WebKit ficou explicito em `bun run test:e2e:webkit` via `PLAYWRIGHT_INCLUDE_WEBKIT=1`.
- Bloqueio operacional: `bunx playwright install --with-deps webkit` foi tentado, mas falhou porque o instalador precisa de `sudo` com senha/TTY.
- Testes de regressao:
  - `bun run test:e2e` passa em modo batch com `chromium`, `firefox` e `mobile-chrome`.
  - `bun run test:e2e:webkit` documenta o bloqueio atual de dependencias do host.
