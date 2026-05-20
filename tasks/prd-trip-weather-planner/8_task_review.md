# Revisão da Tarefa 8.0: Indicadores de favoritos e clima em recentes

## Status

**APPROVED (APROVADO)**.

## Resumo

A implementação atualiza PRD, Tech Spec e task, adiciona metadata local para recentes, exibe estrela visual em destinos favoritados e mostra dia da busca, mínima e máxima em recentes quando a previsão já foi consultada.

## Findings

Nenhum problema crítico encontrado.

Nenhum problema major encontrado.

Nenhum problema minor bloqueante encontrado.

## Pontos positivos

- `frontend/src/hooks/use-local-cities.ts`: mantém compatibilidade com dados legados do `localStorage` e normaliza recentes com `searchedAt`.
- `frontend/src/hooks/use-city-details-page-data.ts`: grava snapshot de previsão somente quando há previsão utilizável.
- `frontend/src/components/city-list.tsx`: centraliza a exibição de estrela e metadata de recentes sem duplicar UI nas páginas.
- `e2e/app.spec.ts`: cobre a estrela de favorito e o conteúdo enriquecido de recentes.

## Validação

- `bun run lint`: passou.
- `bun run typecheck`: passou.
- `bun run build`: passou.
- `bun run test`: passou com 5 arquivos e 45 testes.
- `bun run test:e2e`: passou com 17 testes e 1 skip esperado no projeto mobile do cenário real.

## Riscos residuais

O teste E2E real segue dependente de rede e disponibilidade da Open-Meteo. Os avisos `NO_COLOR`/`FORCE_COLOR` do Playwright continuam não bloqueantes.
