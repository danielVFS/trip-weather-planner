# Prompt de implementacao: Trip Weather Planner

Quero desenvolver um app simples, com foco em demonstrar um workflow de geracao de codigo com IA e uma boa cobertura de comportamento ponta a ponta usando Playwright.

O app deve se chamar **Trip Weather Planner**. Ele permite buscar uma cidade, selecionar um resultado e visualizar um resumo de clima para ajudar no planejamento de uma viagem curta.

## Objetivo

Construir uma aplicacao full-stack simples neste monorepo, usando:

- Frontend: React 19 + Vite 8 + TypeScript.
- Backend: Hono + Bun.
- Testes unitarios: Vitest.
- Testes E2E: Playwright.
- API publica externa: Open-Meteo, usando Geocoding API e Forecast API.

O objetivo principal nao e criar um produto grande, mas sim um caso de uso pequeno, visual e testavel de ponta a ponta.

## Requisitos de produto

Criar duas paginas principais:

### 1. Pagina inicial: busca de cidade

Rota sugerida: `/`

Funcionalidades:

- Campo de busca por nome de cidade.
- Botao para executar a busca.
- Lista de resultados retornados pela API.
- Cada resultado deve mostrar pelo menos cidade, pais/regiao e coordenadas aproximadas.
- Ao clicar em um resultado, navegar para a pagina de detalhes da cidade.
- Mostrar cidades recentes pesquisadas usando `localStorage`.
- Permitir limpar cidades recentes.

Estados obrigatorios:

- Estado inicial.
- Loading durante a busca.
- Resultado vazio quando nenhuma cidade for encontrada.
- Erro amigavel quando a busca falhar.

### 2. Pagina de detalhes: previsao da cidade

Rota sugerida: `/city/:latitude/:longitude`

Funcionalidades:

- Exibir nome da cidade selecionada, quando disponivel via query string ou estado persistido.
- Buscar a previsao no backend usando latitude e longitude.
- Mostrar clima atual ou resumo do dia.
- Mostrar previsao dos proximos dias.
- Exibir temperatura maxima/minima, chance ou volume de chuva, vento e codigo/descricao do clima.
- Botao para voltar para a busca.
- Botao para favoritar/remover cidade usando `localStorage`.

Estados obrigatorios:

- Loading durante carregamento da previsao.
- Erro quando a previsao falhar.
- Estado de dados indisponiveis.

## Backend

Criar endpoints Hono no backend para isolar o frontend da API externa.

Endpoints sugeridos:

### `GET /api/locations/search?q=<cidade>`

Responsabilidade:

- Validar que `q` foi informado.
- Chamar a Geocoding API da Open-Meteo.
- Normalizar a resposta para um formato interno simples.
- Retornar uma lista de cidades.

Formato sugerido de resposta:

```json
{
  "locations": [
    {
      "id": "sao-paulo-br--23.55--46.64",
      "name": "Sao Paulo",
      "country": "Brazil",
      "admin1": "Sao Paulo",
      "latitude": -23.55,
      "longitude": -46.64,
      "timezone": "America/Sao_Paulo"
    }
  ]
}
```

### `GET /api/weather?latitude=<lat>&longitude=<lon>&timezone=<tz>`

Responsabilidade:

- Validar latitude e longitude.
- Chamar a Forecast API da Open-Meteo.
- Retornar dados normalizados para o frontend.

Formato sugerido de resposta:

```json
{
  "current": {
    "temperature": 24.3,
    "windSpeed": 12.4,
    "weatherCode": 2
  },
  "daily": [
    {
      "date": "2026-05-18",
      "temperatureMin": 18.1,
      "temperatureMax": 26.4,
      "precipitation": 1.2,
      "windSpeedMax": 18.6,
      "weatherCode": 3
    }
  ]
}
```

Regras do backend:

- Usar Hono, nao Express.
- Usar `fetch` nativo do Bun.
- Tratar erros da API externa.
- Retornar status HTTP adequados para parametros invalidos.
- Manter a normalizacao em funcoes testaveis.
- Adicionar testes unitarios para validacao, normalizacao e respostas dos endpoints.

## Frontend

Regras:

- Usar componentes funcionais.
- Nao usar `React.FC`.
- Tipar props diretamente nas funcoes.
- Usar arquivos em kebab-case.
- Criar responsiva.
- Priorizar acessibilidade: labels, botoes com nomes acessiveis e landmarks quando fizer sentido.
- Usar `fetch` para chamar apenas o backend local, nunca a Open-Meteo diretamente do frontend.
- Criar estados de loading, erro e vazio.

## Testes E2E com Playwright

Criar testes Playwright que validem comportamento real do usuario.

Cenarios obrigatorios:

1. Usuario busca uma cidade, seleciona um resultado e visualiza a previsao.
2. Busca sem resultados mostra estado vazio.
3. Falha na busca mostra mensagem de erro.
4. Falha na previsao mostra mensagem de erro na pagina de detalhes.
5. Cidade pesquisada aparece em recentes.
6. Usuario consegue limpar recentes.
7. Usuario consegue favoritar e remover favorito.
8. Deep link direto para pagina de detalhes carrega a previsao.
9. Layout principal funciona em viewport mobile.

Regras dos testes:

- Usar locators acessiveis: `getByRole`, `getByLabel`, `getByText`.
- Usar `expect` com web-first assertions.
- Usar `page.route` para mockar respostas do backend nos testes principais, evitando dependencia da API externa.
- Ter pelo menos um teste de integracao E2E real que use o backend rodando e permita validar o contrato com a API publica, se o ambiente permitir rede.
- Habilitar trace/screenshot/video apenas em falha, conforme configuracao do Playwright.

Mocks sugeridos:

- `GET /api/locations/search?q=Curitiba` retorna uma cidade.
- `GET /api/locations/search?q=Atlantis` retorna lista vazia.
- `GET /api/weather?...` retorna previsao com 5 dias.
- Respostas 500 para validar erro.

## Criterios de aceite

- A aplicacao roda com `bun run dev`.
- O frontend roda em `localhost:5173`.
- O backend roda em `localhost:3000`.
- `bun run lint` passa.
- `bun run typecheck` passa.
- `bun run build` passa.
- `bun run test` passa.
- `bun run test:e2e` passa.
- O app tem duas paginas funcionais.
- O fluxo buscar cidade -> abrir detalhe -> ver previsao funciona.
- Os testes E2E cobrem os principais estados de sucesso, erro e persistencia local.

## Resultado esperado para o estudo

Ao final, quero ter um app pequeno, mas completo o suficiente para demonstrar no LinkedIn:

- Planejamento de um use case testavel.
- Geracao de codigo com IA em um monorepo real.
- Separacao frontend/backend.
- Consumo de API publica.
- Testes E2E com Playwright cobrindo comportamento de usuario.
- Uso de mocks de rede para testes deterministas.
- Um fluxo de validacao com lint, typecheck, build, unit tests e E2E.
