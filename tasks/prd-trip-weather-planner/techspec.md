# Template de Especificação Técnica

## Resumo Executivo

A implementação deve criar o monorepo do zero conforme `AGENTS.md`: frontend React 19 + Vite 8 + TypeScript, backend Hono + Bun e testes com Vitest/Playwright. O backend será a única camada autorizada a consumir a Open-Meteo, expondo dois endpoints internos separados para busca de cidades e previsão; o frontend consumirá apenas esses endpoints locais.

A solução prioriza contratos simples, dados normalizados em português do Brasil, estado local no navegador para recentes/favoritos e E2E determinístico com mocks, além de um cenário real obrigatório contra backend e API pública. Não haverá banco de dados, autenticação, SDK climático adicional ou proxy genérico.

## Arquitetura do Sistema

### Visão Geral dos Componentes

- `package.json`, `bun.lock`, `tsconfig.base.json`, `vitest.config.ts`, `playwright.config.ts`: base do monorepo, scripts e configuração compartilhada.
- `backend/src/index.ts`: cria o app Hono, registra CORS, health check e rotas de API.
- `backend/src/routes/cities.ts`: valida `q`, chama serviço de geocoding e responde lista normalizada.
- `backend/src/routes/weather.ts`: valida latitude/longitude, chama serviço de forecast e responde previsão normalizada.
- `backend/src/services/open-meteo.ts`: orquestra chamadas externas, tratamento de erros e mapeamento de dados.
- `backend/src/types/weather.ts`: contratos internos compartilháveis para cidade e previsão.
- `frontend/src/App.tsx`: define rotas de busca e detalhes.
- `frontend/src/pages/home.tsx`: busca, resultados, recentes e estados de UI.
- `frontend/src/pages/city-details.tsx`: previsão, favorito, deep link e navegação de volta.
- `frontend/src/services/api.ts`: cliente HTTP para o backend local.
- `frontend/src/hooks/use-local-cities.ts`: persistência de recentes/favoritos em `localStorage`.
- `e2e/app.spec.ts`: fluxos Playwright com mocks e teste real.

Fluxo: usuário busca cidade no frontend -> `GET /api/cities/search` -> Open-Meteo Geocoding -> seleção navega para `/city?lat=...&lon=...&name=...` -> `GET /api/weather/forecast` -> Open-Meteo Forecast -> frontend renderiza resumo e próximos dias.

## Design de Implementação

### Interfaces Principais

```ts
type CitySearchService = {
  searchCities(input: { query: string; language: "pt" }): Promise<CityResult[]>
}

type WeatherService = {
  getForecast(input: {
    latitude: number
    longitude: number
    timezone?: string
  }): Promise<WeatherForecast>
}
```

```ts
type LocalCitiesStore = {
  recent: RecentCity[]
  favorites: CityResult[]
  addRecent(city: CityResult): void
  updateRecentWeather(city: CityResult, snapshot: RecentWeatherSnapshot): void
  clearRecent(): void
  toggleFavorite(city: CityResult): void
  isFavorite(city: CityResult): boolean
}
```

### Modelos de Dados

```ts
type CityResult = {
  id: number
  name: string
  country: string
  region?: string
  latitude: number
  longitude: number
  timezone?: string
}

type RecentWeatherSnapshot = {
  forecastDate: string
  minTemperatureC: number
  maxTemperatureC: number
}

type RecentCity = CityResult & {
  searchedAt: string
  weatherSnapshot?: RecentWeatherSnapshot
}

type ForecastDay = {
  date: string
  minTemperatureC: number
  maxTemperatureC: number
  precipitationMm: number
  precipitationProbabilityPct?: number
  maxWindKmh: number
  weatherCode: number
  weatherDescription: string
}

type WeatherForecast = {
  latitude: number
  longitude: number
  timezone: string
  current: ForecastDay
  daily: ForecastDay[]
}
```

Sem esquema de banco: recentes e favoritos ficam apenas no `localStorage`, com chaves versionadas, por exemplo `trip-weather-planner:recent:v1` e `trip-weather-planner:favorites:v1`. Recentes devem aceitar dados legados sem metadata e, ao salvar uma nova selecao, registrar `searchedAt`; quando uma previsao for carregada para a cidade recente, armazenar `weatherSnapshot` com data da previsao, minima e maxima. Favoritos continuam como `CityResult[]`, e a UI deve derivar o indicador visual de estrela comparando o destino com a lista persistida.

### Endpoints de API

- `GET /health`: retorna status básico do backend.
- `GET /api/cities/search?q=rio`: valida termo com no mínimo 2 caracteres úteis; chama `https://geocoding-api.open-meteo.com/v1/search` com `language=pt`, `count=10` e retorna `{ results: CityResult[] }`.
- `GET /api/weather/forecast?latitude=-22.9&longitude=-43.2&timezone=America/Sao_Paulo`: valida coordenadas; chama `https://api.open-meteo.com/v1/forecast` com `timezone=auto` ou timezone recebido, `forecast_days=5`, `current=temperature_2m,weather_code,wind_speed_10m,precipitation` e `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max`.

Erros internos seguem contrato estável: `{ error: { code: string; message: string } }`, com `400` para entrada inválida, `502` para falha da API externa e `503` para indisponibilidade temporária.

## Pontos de Integração

- Open-Meteo Geocoding API: busca de cidades por `name`, sem API key para uso não comercial.
- Open-Meteo Forecast API: previsão diária e atual por coordenadas.
- Frontend/backend local: configurar `VITE_API_BASE_URL` com fallback para `http://localhost:3000`.

O backend deve impor timeout via `AbortController`, validar shape mínimo da resposta externa e mapear ausência de `results` para lista vazia. Descrições de clima por `weatherCode` devem ser mapeadas localmente em português brasileiro para manter consistência visual.

## Abordagem de Testes

### Testes Unidade

- Backend: validação de query params, normalização de cidades, normalização de forecast, mapeamento de códigos WMO e erros Open-Meteo.
- Frontend: hooks de `localStorage`, cliente API, renderização de loading/error/empty/success, metadata de recentes e toggles/indicadores de favorito.
- Mocks apenas para `fetch` externo e armazenamento local.

### Testes de Integração

- Hono com `app.request()` ou `hono/testing` para rotas `/api/cities/search` e `/api/weather/forecast`, cobrindo sucesso, entrada inválida, vazio e falha externa.
- Frontend com Testing Library para interação de busca e persistência local em jsdom.

### Testes de E2E

Playwright deve cobrir os fluxos do PRD usando locators acessíveis e assertions web-first. Os cenários principais devem mockar `/api/cities/search` e `/api/weather/forecast` com `page.route`. O cenário real deve iniciar frontend e backend via `webServer`, executar busca real em português brasileiro e validar renderização da previsão sem isolamento por variável de ambiente.

## Sequenciamento de Desenvolvimento

### Ordem de Construção

1. Criar estrutura do monorepo, scripts Bun, TypeScript, Vite, Hono, Vitest e Playwright.
2. Implementar backend Hono com contratos, clientes Open-Meteo e testes de rota/serviço.
3. Implementar frontend com rotas, services, hooks de persistência e componentes de estado.
4. Integrar fluxo busca -> detalhes -> previsão com deep link.
5. Implementar E2E mockado e cenário real.
6. Executar `bun run lint`, `bun run typecheck`, `bun run build`, `bun run test` e `bun run test:e2e`.

### Dependências Técnicas

- Bun disponível localmente.
- Acesso de rede à Open-Meteo durante backend real e teste E2E real.
- Sem credenciais externas obrigatórias.

## Monitoramento e Observabilidade

Não há infraestrutura Prometheus/Grafana no repositório atual. Para esta versão, registrar logs estruturados no backend para: rota, status, duração, tipo de erro e origem externa. Evitar logar query completa se futuramente houver dados sensíveis, embora cidade e coordenadas sejam aceitáveis neste escopo.

Métricas futuras podem ser derivadas de contadores por endpoint, taxa de erro `4xx/5xx`, latência das chamadas Open-Meteo e volume de respostas vazias.

## Considerações Técnicas

### Decisões Principais

- Endpoints separados preservam contratos simples e facilitam mocks E2E.
- `localStorage` atende o escopo sem conta de usuário e evita backend stateful.
- Hono deve ser usado no backend, não Express, seguindo a regra do projeto.
- O frontend deve usar componentes funcionais tipados diretamente, sem `React.FC`.
- Não usar SDK Open-Meteo inicialmente: `fetch` nativo é suficiente para dois endpoints e reduz dependências.

### Riscos Conhecidos

- O teste E2E real pode falhar por rede, rate limit ou indisponibilidade da API pública; mitigar com cidade estável, assertions flexíveis e timeout razoável.
- A API externa pode omitir campos administrativos; UI e normalização devem aceitar `region` opcional.
- Forecast diário exige timezone quando variáveis diárias são solicitadas; usar `timezone=auto` por padrão.
- Limites de uso da Open-Meteo Free API exigem evitar loops, retries agressivos e testes reais excessivos.

### Conformidade com Skills Padrões

- `create-techspec`: aplicada para gerar este documento a partir do PRD.
- `hono`: obrigatória para backend Hono/Bun.
- `frontend-design`: aplicável à criação da UI task-oriented.
- `shadcn`: aplicável se componentes shadcn forem adicionados.
- `vercel-react-best-practices`: aplicável a componentes, hooks e performance React.
- `vercel-composition-patterns`: aplicável se componentes de previsão/resultados crescerem em composição.
- `web-design-guidelines` e `ui-ux-pro-max`: aplicáveis para revisão de acessibilidade, responsividade e qualidade visual.

### Arquivos relevantes e dependentes

- `AGENTS.md`
- `CLAUDE.md`
- `tasks/prd-trip-weather-planner/prd.md`
- `tasks/prd-trip-weather-planner/techspec.md`
- `package.json`
- `frontend/package.json`
- `frontend/src/App.tsx`
- `frontend/src/pages/home.tsx`
- `frontend/src/pages/city-details.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/hooks/use-local-cities.ts`
- `backend/package.json`
- `backend/src/index.ts`
- `backend/src/routes/cities.ts`
- `backend/src/routes/weather.ts`
- `backend/src/services/open-meteo.ts`
- `backend/src/types/weather.ts`
- `e2e/app.spec.ts`
