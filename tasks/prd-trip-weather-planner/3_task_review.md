# Review: Task 3 - Cliente frontend e persistencia local

**Revisor**: AI Code Reviewer
**Data**: 2026-05-19
**Arquivo da task**: `3_task.md`
**Status**: APPROVED

## Resumo

A implementacao entrega a base frontend solicitada para a Tarefa 3.0: cliente HTTP tipado para o backend local, fallback de `VITE_API_BASE_URL` para `http://localhost:3000`, tratamento consistente de erros HTTP/rede, hook de persistencia local para cidades recentes e favoritas com chaves versionadas, deduplicacao, limpeza de recentes e toggle de favoritos.

Nao foram encontrados problemas criticos, major ou minor. A implementacao esta alinhada aos contratos do `techspec.md`, aos requisitos da task e passou nas validacoes executadas durante a revisao.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/services/api.ts` | OK | 0 |
| `frontend/src/hooks/use-local-cities.ts` | OK | 0 |
| `frontend/src/services/api.test.ts` | OK | 0 |
| `frontend/src/hooks/use-local-cities.test.ts` | OK | 0 |
| `tasks/prd-trip-weather-planner/3_task.md` | OK | 0 |
| `tasks/prd-trip-weather-planner/tasks.md` | OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema critico encontrado.

### 🟡 Problemas Major

Nenhum problema major encontrado.

### 🟢 Problemas Minor

Nenhum problema minor encontrado.

## ✅ Destaques Positivos

- **POSITIVE - `frontend/src/services/api.ts:66` - Fallback local explicito**: `DEFAULT_API_BASE_URL` garante que o frontend consuma o backend local por padrao quando `VITE_API_BASE_URL` nao estiver configurado.
- **POSITIVE - `frontend/src/services/api.ts:95` - Tratamento centralizado de requisicoes**: `request<T>` concentra `fetch`, leitura JSON e normalizacao de erro em uma unica camada para os endpoints de cidades e previsao.
- **POSITIVE - `frontend/src/services/api.ts:135` - Erros do backend preservados**: `parseApiError` reaproveita `code` e `message` do contrato `{ error: { code, message } }`, mantendo comportamento previsivel para a UI.
- **POSITIVE - `frontend/src/hooks/use-local-cities.ts:5` - Chaves versionadas**: recentes e favoritos usam `trip-weather-planner:recent:v1` e `trip-weather-planner:favorites:v1`, conforme esperado pela task.
- **POSITIVE - `frontend/src/hooks/use-local-cities.ts:27` - Recentes deduplicados e limitados**: `addRecent` move a cidade mais recente para o topo, remove duplicatas e limita a lista a 8 entradas.
- **POSITIVE - `frontend/src/hooks/use-local-cities.ts:70` - Leitura defensiva do storage**: `readCities` retorna lista vazia para storage ausente, JSON invalido, formato invalido ou itens fora do contrato.
- **POSITIVE - `frontend/src/services/api.test.ts:42` - Cobertura do cliente API**: os testes validam URL local, query params, forecast com timezone, erro estruturado, falha de rede e resposta inesperada.
- **POSITIVE - `frontend/src/hooks/use-local-cities.test.ts:36` - Cobertura do hook**: os testes cobrem storage vazio, JSON invalido, deduplicacao, limite de recentes, limpeza, toggle de favoritos e filtragem de cidades invalidas.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | OK |
| TypeScript/Node.js | OK |
| REST/HTTP | OK |
| Logging | Nao aplicavel nesta tarefa |
| React | OK |
| Testes | OK |

## Validacao Executada

| Comando | Resultado |
|---------|-----------|
| `bun run typecheck` | Passou |
| `bun run test` | Passou: 3 arquivos de teste, 30 testes |
| `cd frontend && bun run lint` | Passou |
| `bun run build` | Passou |

## Recomendações

1. Na Tarefa 4.0, consumir `searchCities` e `useLocalCities` em componentes com estados explicitos de loading, erro e vazio, preservando mensagens amigaveis para `ApiClientError`.
2. Na Tarefa 5.0, reutilizar `getForecast`, `toggleFavorite` e `isFavorite` sem duplicar logica de storage na pagina de detalhes.
3. Ao integrar UI e rotas, adicionar testes de componente para o fluxo busca -> adicionar recente e para favorito -> persistencia, conforme a abordagem de testes do `techspec.md`.

## Veredito

APPROVED. A Tarefa 3.0 atende aos requisitos funcionais e tecnicos definidos, nao apresenta achados bloqueantes e passou nas validacoes obrigatorias da revisao.
