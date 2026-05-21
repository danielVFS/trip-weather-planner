# Relatorio de Bugfix - Trip Weather Planner

## Resumo
- Total de Bugs: 6
- Bugs Corrigidos: 5
- Bugs Parcialmente Corrigidos / Bloqueados por Ambiente: 1
- Testes de Regressao Criados: 7

## Detalhes por Bug
| ID | Severidade | Status | Correcao | Testes Criados |
|----|------------|--------|----------|----------------|
| BUG-01 | Media | Corrigido | Alinhados os testes ao contrato atual da UI de recentes, validando `Última vez buscado dd/mm/aaaa` com Min/Max. | `frontend/src/pages/home.test.tsx`; `e2e/app.spec.ts` fluxo de recentes |
| BUG-02 | Baixa | Corrigido | Adicionado favicon SVG servido pelo Vite e referenciado no `index.html`. | `e2e/app.spec.ts` caso `serve o favicon sem erro 404` |
| BUG-03 | Media | Corrigido | `test:e2e` agora roda `playwright test` em batch; modo UI ficou em `test:e2e:ui`. | `bun run test:e2e` |
| BUG-04 | Media | Corrigido | Maxima diaria preservada no forecast atual e snapshot de recentes salvo a partir de `forecast.daily[0]`. | `backend/src/index.test.ts`; `frontend/src/pages/city-details.test.tsx`; `e2e/app.spec.ts` |
| BUG-05 | Baixa | Corrigido | Middleware Hono registra logs JSON com metodo, rota, status, duracao, tipo de erro e origem. | `backend/src/index.test.ts` |
| BUG-06 | Alta | Parcial | WebKit ficou opt-in em `test:e2e:webkit`; instalacao de dependencias nativas foi tentada, mas bloqueada por `sudo` sem senha/TTY. | `bun run test:e2e`; `bun run test:e2e:webkit` documenta bloqueio |

## Testes
- Testes unitarios: TODOS PASSANDO (`bun run test`, 46 passed)
- Testes de integracao: TODOS PASSANDO via suite Vitest
- Testes E2E padrao: TODOS PASSANDO (`bun run test:e2e`, 28 passed, 2 skipped)
- Testes E2E WebKit: BLOQUEADO POR AMBIENTE (`bun run test:e2e:webkit`, dependencias nativas ausentes)
- Tipagem: SEM ERROS (`bun run typecheck`)
- Lint: SEM ERROS (`bun run lint`)
- Build: SEM ERROS (`bun run build`)

## Observacoes
- A execucao WebKit continua dependente de instalacao de bibliotecas do sistema. O comando oficial `bunx playwright install --with-deps webkit` falhou neste ambiente por exigir `sudo`.
- Validacao visual via Playwright MCP confirmou recentes com data/min/max diaria. Evidencia: `tasks/prd-trip-weather-planner/qa-evidence/bugfix-final-recents.png`.
