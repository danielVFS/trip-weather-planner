# Tarefa 4.0: Página inicial de busca

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar a página inicial onde o usuário pesquisa cidades, compara resultados, acessa recentes e inicia o fluxo para detalhes da previsão.

<skills>
### Conformidade com Skills Padrões

- `frontend-design`: aplicável à construção da UI task-oriented.
- `shadcn`: aplicável se componentes shadcn forem adicionados ou ajustados.
- `vercel-react-best-practices`: aplicável a componentes, estado e interações.
- `web-design-guidelines`: aplicável para acessibilidade e responsividade.
</skills>

<requirements>

- Exibir campo de busca com rótulo acessível.
- Exibir botão de busca com nome acessível.
- Mostrar estados de loading, sucesso, vazio e erro.
- Listar resultados com cidade, país/região e coordenadas aproximadas.
- Salvar cidade selecionada em recentes.
- Exibir recentes na página inicial.
- Permitir limpar recentes.
- Navegar para detalhes ao selecionar resultado ou recente.
</requirements>

## Subtarefas

- [x] 4.1 Criar página `home` com estrutura semântica e responsiva.
- [x] 4.2 Implementar formulário de busca e chamada ao cliente API.
- [x] 4.3 Implementar estados de loading, erro e vazio.
- [x] 4.4 Implementar lista de resultados comparável.
- [x] 4.5 Integrar recentes com `use-local-cities`.
- [x] 4.6 Implementar navegação para detalhes com parâmetros necessários.
- [x] 4.7 Adicionar testes de interação da busca, estados e recentes.

## Detalhes de Implementação

Seguir as seções "Busca de cidade", "Experiência do Usuário", "Arquitetura do Sistema" e "Abordagem de Testes" do `prd.md` e `techspec.md`.

## Critérios de Sucesso

- O usuário consegue buscar e selecionar uma cidade.
- Estados de falha e ausência de resultados são claros.
- Recentes aparecem e podem ser limpos.
- A página funciona em viewport mobile.

## Testes da Tarefa

- [x] Testes de unidade para helpers locais, se houver.
- [x] Testes de integração com Testing Library para busca, estados e recentes.
- [x] Testes E2E serão consolidados na tarefa 6.0.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/App.tsx`
- `frontend/src/pages/home.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/hooks/use-local-cities.ts`
- `frontend/src/components/ui/*`
- `frontend/src/**/*.test.tsx`
