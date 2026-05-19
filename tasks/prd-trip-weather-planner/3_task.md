# Tarefa 3.0: Cliente frontend e persistência local

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Criar a base de dados do frontend: cliente HTTP tipado para o backend local e persistência em `localStorage` para cidades recentes e favoritas.

<skills>
### Conformidade com Skills Padrões

- `vercel-react-best-practices`: aplicável a hooks, estado e efeitos.
- `vercel-composition-patterns`: aplicável se a API do hook crescer em composição.
</skills>

<requirements>

- O frontend deve consumir apenas o backend local.
- Implementar fallback de `VITE_API_BASE_URL` para `http://localhost:3000`.
- Tratar respostas de erro do backend de forma consistente.
- Criar hook para recentes e favoritos usando chaves versionadas.
- Implementar deduplicação, limpeza de recentes e toggle de favoritos.
- Garantir comportamento em ambiente jsdom sem quebrar quando `localStorage` estiver vazio ou inválido.
</requirements>

## Subtarefas

- [x] 3.1 Criar tipos frontend compatíveis com os contratos do backend.
- [x] 3.2 Implementar cliente API para busca de cidades.
- [x] 3.3 Implementar cliente API para previsão.
- [x] 3.4 Implementar tratamento consistente de erro HTTP/rede.
- [x] 3.5 Implementar hook `use-local-cities`.
- [x] 3.6 Adicionar testes unitários do cliente API com mocks de `fetch`.
- [x] 3.7 Adicionar testes unitários do hook com `localStorage`.

## Detalhes de Implementação

Seguir as seções "Modelos de Dados", "Pontos de Integração" e "Abordagem de Testes" do `techspec.md`.

## Critérios de Sucesso

- O frontend possui uma camada única para chamadas ao backend.
- Recentes e favoritos persistem localmente e sobrevivem a recarregamento.
- Dados inválidos no armazenamento não quebram a aplicação.
- A tarefa não depende de UI final para ser validada.

## Testes da Tarefa

- [x] Testes de unidade para cliente API.
- [x] Testes de unidade para hook de persistência.
- [ ] Testes de integração com componentes mínimos, se necessário.
- [ ] Testes E2E não aplicáveis nesta tarefa.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/services/api.ts`
- `frontend/src/hooks/use-local-cities.ts`
- `frontend/src/App.tsx`
- `frontend/src/**/*.test.ts`
- `frontend/src/**/*.test.tsx`
