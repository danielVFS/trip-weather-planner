# Tarefa 8.0: Indicadores de favoritos e clima em recentes

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Adicionar feedback visual de favoritos e enriquecer recentes com o dia da busca e temperaturas mínima/máxima já consultadas.

<skills>
### Conformidade com Skills Padrões

- `vercel-react-best-practices`: aplicável aos hooks e componentes React.
- `frontend-design`: aplicável aos ajustes visuais de cards e botões.
</skills>

<requirements>

- Atualizar `use-local-cities` para manter `searchedAt` em recentes e aceitar snapshot de mínima/máxima.
- Atualizar a página de detalhes para gravar o snapshot da previsão atual em recentes quando a previsão carregar com sucesso.
- Exibir uma estrela visual no destino favoritado.
- Exibir, nos recentes, dia da busca, temperatura mínima e temperatura máxima quando esses dados estiverem disponíveis.
- Preservar compatibilidade com dados antigos do `localStorage`.
- Atualizar testes unitários e E2E dos fluxos afetados.
</requirements>

## Subtarefas

- [x] 8.1 Atualizar documentação do PRD e Tech Spec com os novos requisitos.
- [x] 8.2 Enriquecer o modelo local de recentes com `searchedAt` e snapshot de previsão.
- [x] 8.3 Exibir estrela visual para destinos favoritados.
- [x] 8.4 Exibir dia da busca, mínima e máxima nos recentes.
- [x] 8.5 Atualizar testes unitários de hook e páginas.
- [x] 8.6 Atualizar testes E2E para recentes enriquecidos e estrela de favorito.
- [x] 8.7 Executar lint, typecheck, build e testes necessários.

## Detalhes de Implementação

Seguir `prd.md` e `techspec.md`. Manter o storage local versionado e tolerante a entradas legadas.

## Critérios de Sucesso

- Recentes continuam funcionando com dados antigos.
- Novas seleções registram o dia da busca.
- Após abrir detalhes com previsão válida, o card recente mostra mínima e máxima.
- Favoritos têm estrela visível no destino favoritado.
- Testes unitários e E2E cobrem os novos comportamentos.

## Testes da Tarefa

- [x] Testes unitários via `bun run test`.
- [x] Testes E2E via `bun run test:e2e`.
- [x] Checks obrigatórios do projeto via `bun run lint`, `bun run typecheck` e `bun run build`.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/hooks/use-local-cities.ts`
- `frontend/src/hooks/use-city-details-page-data.ts`
- `frontend/src/components/city-list.tsx`
- `frontend/src/pages/home.tsx`
- `frontend/src/pages/city-details.tsx`
- `frontend/src/index.css`
- `frontend/src/**/*.test.tsx`
- `e2e/app.spec.ts`

## Resultado Final

- `bun run lint`: passou.
- `bun run typecheck`: passou.
- `bun run build`: passou.
- `bun run test`: passou com 5 arquivos e 45 testes.
- `bun run test:e2e`: passou com 17 testes executados e 1 skip esperado do cenário real no projeto mobile; o cenário real executou em Chromium.
