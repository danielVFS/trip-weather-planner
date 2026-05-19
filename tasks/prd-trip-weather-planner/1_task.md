# Tarefa 1.0: Base do monorepo e backend Hono

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Preparar a base técnica do projeto para suportar o fluxo full-stack do Trip Weather Planner, garantindo que o monorepo Bun, o frontend React/Vite, o backend Hono e os testes estejam alinhados com os comandos e padrões definidos.

<skills>
### Conformidade com Skills Padrões

- `hono`: obrigatória para qualquer trabalho no backend Hono/Bun.
- `vercel-react-best-practices`: aplicável ao validar a base React/Vite.
</skills>

<requirements>

- Validar ou configurar scripts Bun da raiz, frontend e backend.
- Garantir TypeScript compartilhado entre workspaces.
- Garantir Vitest e Playwright configurados para o monorepo.
- Criar ou validar app Hono com CORS e rota `GET /health`.
- Definir contratos base de dados e erro conforme `techspec.md`.
- Não implementar funcionalidades de busca/previsão nesta tarefa.
</requirements>

## Subtarefas

- [x] 1.1 Ler `prd.md`, `techspec.md` e instruções do projeto.
- [x] 1.2 Validar estrutura de workspaces Bun e scripts essenciais.
- [x] 1.3 Validar configuração TypeScript, Vitest e Playwright.
- [x] 1.4 Criar ou ajustar app Hono com CORS e `GET /health`.
- [x] 1.5 Definir tipos base para cidade, previsão e erro estável.
- [x] 1.6 Adicionar testes mínimos para health check e contratos base.

## Detalhes de Implementação

Seguir as seções "Arquitetura do Sistema", "Endpoints de API", "Modelos de Dados" e "Sequenciamento de Desenvolvimento" do `techspec.md`.

## Critérios de Sucesso

- O monorepo executa scripts básicos com Bun.
- O backend responde `GET /health`.
- Tipos base existem e são usados pelo backend.
- A tarefa não adiciona integração externa ainda.

## Testes da Tarefa

- [x] Testes de unidade para contratos/helpers base, se houver lógica.
- [x] Testes de integração para `GET /health` usando Hono.
- [x] Testes E2E não aplicáveis nesta tarefa.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `package.json`
- `tsconfig.base.json`
- `vitest.config.ts`
- `playwright.config.ts`
- `backend/src/index.ts`
- `backend/src/types/weather.ts`
- `backend/src/index.test.ts`
