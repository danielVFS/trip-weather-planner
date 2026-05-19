# Tarefa 2.0: API interna de clima e cidades

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar a camada backend que isola o frontend da Open-Meteo, expondo endpoints internos para busca de cidades e previsão com validação, normalização, timeout e erros estáveis.

<skills>
### Conformidade com Skills Padrões

- `hono`: obrigatória para rotas, handlers e testes do backend.
</skills>

<requirements>

- Implementar serviço Open-Meteo para geocoding e forecast.
- Implementar validação de `q`, `latitude`, `longitude` e `timezone`.
- Normalizar resultados para os modelos definidos no `techspec.md`.
- Mapear códigos WMO para descrições em português brasileiro.
- Aplicar timeout com `AbortController`.
- Responder erros no contrato `{ error: { code, message } }`.
- Cobrir sucesso, vazio, entrada inválida e falhas externas.
</requirements>

## Subtarefas

- [x] 2.1 Implementar cliente/serviço Open-Meteo.
- [x] 2.2 Implementar normalização de cidades.
- [x] 2.3 Implementar normalização de previsão e mapeamento WMO.
- [x] 2.4 Implementar rota `GET /api/cities/search`.
- [x] 2.5 Implementar rota `GET /api/weather/forecast`.
- [x] 2.6 Adicionar testes unitários de normalização, validação e WMO.
- [x] 2.7 Adicionar testes de integração das rotas com mocks de `fetch`.

## Detalhes de Implementação

Seguir as seções "Interfaces Principais", "Modelos de Dados", "Endpoints de API", "Pontos de Integração" e "Abordagem de Testes" do `techspec.md`.

## Critérios de Sucesso

- O frontend tem endpoints internos suficientes para buscar cidades e previsão.
- O backend não vaza formato bruto da Open-Meteo.
- Falhas externas retornam status e mensagens amigáveis.
- Entradas inválidas retornam `400` com contrato estável.

## Testes da Tarefa

- [x] Testes de unidade para validação, normalização, WMO e erros.
- [x] Testes de integração para `/api/cities/search` e `/api/weather/forecast`.
- [x] Testes E2E não aplicáveis nesta tarefa.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `backend/src/index.ts`
- `backend/src/routes/cities.ts`
- `backend/src/routes/weather.ts`
- `backend/src/services/open-meteo.ts`
- `backend/src/types/weather.ts`
- `backend/src/index.test.ts`
