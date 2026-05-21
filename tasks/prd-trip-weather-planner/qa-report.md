# Relatorio de QA - Trip Weather Planner

## Resumo

- Data: 2026-05-20
- Status: REPROVADO
- Total de Requisitos: 38
- Requisitos Atendidos: 34
- Requisitos Falhando/Bloqueados por validacao automatizada: 4
- Bugs Encontrados: 2

## Ambiente

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Backend existente em `3000` respondeu `GET /health` com `{"status":"ok","service":"trip-weather-planner-backend"}`.
- Comando solicitado executado: `bun run test:e2e:record`
- Playwright MCP usado para exploracao manual, screenshots, snapshot acessivel, console e rede.

## Requisitos Verificados

| ID | Requisito | Status | Evidencia |
|----|-----------|--------|-----------|
| RF-01 | Pagina inicial de busca | PASSOU | Snapshot MCP home |
| RF-02 | Campo de busca com rotulo acessivel | PASSOU | `searchbox "Cidade"` |
| RF-03 | Botao de busca | PASSOU | `button "Buscar"` |
| RF-04 | Estado de carregamento ao buscar | PASSOU | Coberto por E2E mockado |
| RF-05 | Lista cidades encontradas | PASSOU | `qa-home-search-results.png` |
| RF-06 | Resultado mostra nome, pais/regiao e coordenadas | PASSOU | `qa-home-search-results.png` |
| RF-07 | Selecao navega para detalhes | PASSOU | URL `/city?...` em exploracao manual |
| RF-08 | Estado vazio para busca sem resultados | PASSOU | E2E passou |
| RF-09 | Erro amigavel em falha de busca | PASSOU | E2E passou |
| RF-10 | Salva cidades recentes no navegador | PASSOU | `qa-recents.png` |
| RF-11 | Exibe recentes na home | PASSOU | `qa-recents.png` |
| RF-12 | Recentes exibem dia, minima e maxima | FALHOU | Funcionalmente visivel, mas testes obrigatorios falham por contrato textual divergente |
| RF-13 | Limpar recentes | BLOQUEADO | Fluxo E2E falha antes do clique de limpeza |
| RF-14 | Pagina de detalhes por latitude/longitude | PASSOU | URL `/city?...lat=...&lon=...` |
| RF-15 | Exibe nome da cidade | PASSOU | `heading "Rio de Janeiro"` |
| RF-16 | Busca previsao por latitude/longitude | PASSOU | Rede: `/api/weather/forecast` 200 |
| RF-17 | Loading da previsao | PASSOU | Coberto por E2E |
| RF-18 | Exibe resumo atual/do dia | PASSOU | `qa-city-details.png` |
| RF-19 | Exibe proximos dias | PASSOU | `qa-city-details.png` |
| RF-20 | Previsao inclui min, max, chuva, vento e codigo/descricao | PASSOU | `qa-city-details.png` |
| RF-21 | Erro amigavel em falha de previsao | PASSOU | E2E passou |
| RF-22 | Estado de dados indisponiveis | PASSOU | Coberto por testes/contratos implementados |
| RF-23 | Acao voltar para busca | PASSOU | Link `Voltar para busca` |
| RF-24 | Favoritar cidade | PASSOU | Botao alternou para `Remover favorito` |
| RF-25 | Remover favorito | PASSOU | Botao alternou para `Favoritar cidade` |
| RF-26 | Estrela visual em favorito | PASSOU | Snapshot MCP apos favoritar |
| RF-27 | E2E busca, selecao e previsao | PASSOU | `test:e2e:record` passou nos projetos |
| RF-28 | E2E busca sem resultados | PASSOU | `test:e2e:record` passou nos projetos |
| RF-29 | E2E falha na busca | PASSOU | `test:e2e:record` passou nos projetos |
| RF-30 | E2E falha na previsao | PASSOU | `test:e2e:record` passou nos projetos |
| RF-31 | E2E exibicao de recentes | FALHOU | Mesmo bug de contrato textual em recentes |
| RF-32 | E2E limpeza de recentes | BLOQUEADO | Teste falha antes de executar limpeza |
| RF-33 | E2E data/min/max em recentes | FALHOU | Mesmo bug de contrato textual em recentes |
| RF-34 | E2E favorito/remocao/estrela | PASSOU | `test:e2e:record` passou nos projetos |
| RF-35 | E2E deep link direto | PASSOU | `test:e2e:record` passou nos projetos |
| RF-36 | E2E viewport mobile | PASSOU | `test:e2e:record` passou; `qa-mobile-recents.png` sem overflow |
| RF-37 | E2E principais com mocks deterministas | FALHOU | Suite mockada falha no fluxo de recentes |
| RF-38 | E2E real contra backend e API publica | PASSOU | Chromium passou no `test:e2e:record`; Firefox/mobile skip esperado |

## Testes Executados

| Comando/Fluxo | Resultado | Observacoes |
|---------------|-----------|-------------|
| `bun run lint` | PASSOU | ESLint frontend sem erros |
| `bun run typecheck` | PASSOU | Backend e frontend |
| `bun run build` | PASSOU | Backend Bun build e frontend Vite build |
| `bun run test` | FALHOU | 44 passaram, 1 falhou em `home.test.tsx` por `Busca:` vs `Última vez buscado` |
| `bun run test:e2e:record` | FALHOU | 22 passaram, 2 skips, 3 falhas no mesmo teste de recentes |
| Exploracao real busca -> detalhes | PASSOU | Busca e forecast retornaram 200 |
| Favoritar/remover favorito manual | PASSOU | Estado visual e nome acessivel mudaram corretamente |
| Responsivo mobile manual | PASSOU | `scrollWidth` 390, `innerWidth` 390, sem overflow horizontal |

## Acessibilidade

- Campo de cidade possui nome acessivel `Cidade`.
- Botoes principais possuem nomes acessiveis: `Buscar`, `Favoritar cidade`, `Remover favorito`, `Limpar recentes`.
- Links de resultado e recentes sao navegaveis e possuem texto descritivo com cidade, localizacao e coordenadas.
- Estados de erro/vazio sao cobertos nos E2E com `role="alert"` e `role="status"`.
- Estrutura principal usa `main`, regioes nomeadas e headings.
- Navegacao por teclado foi exercitada parcialmente com Tab/Enter; sem bloqueio observado nas telas principais.

## Evidencias

- `tasks/prd-trip-weather-planner/qa-evidence/qa-home-search-results.png`
- `tasks/prd-trip-weather-planner/qa-evidence/qa-city-details.png`
- `tasks/prd-trip-weather-planner/qa-evidence/qa-recents.png`
- `tasks/prd-trip-weather-planner/qa-evidence/qa-mobile-recents.png`
- `test-results/app-salva-recentes-e-permite-limpar-a-lista-chromium/error-context.md`
- `test-results/app-salva-recentes-e-permite-limpar-a-lista-firefox/error-context.md`
- `test-results/app-salva-recentes-e-permite-limpar-a-lista-mobile-chrome/error-context.md`

## Bugs Encontrados

| ID | Descricao | Severidade | Screenshot/Evidencia |
|----|-----------|------------|----------------------|
| BUG-01 | Testes esperam `Busca: dd/mm/aaaa`, mas UI renderiza `Última vez buscado dd/mm/aaaa` em recentes | Media | `qa-recents.png`, `test-results/.../error-context.md` |
| BUG-02 | Console registra 404 para `favicon.ico` | Baixa | Console MCP |

## Conclusao

QA reprovada. O fluxo principal do produto funciona manualmente e o cenario real contra backend/Open-Meteo passou, mas a validacao obrigatoria nao pode ser aprovada enquanto `bun run test` e `bun run test:e2e:record` falharem no contrato textual da lista de recentes.
