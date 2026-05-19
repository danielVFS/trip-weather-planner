# Tarefa 5.0: Página de detalhes da cidade

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar a página que exibe a previsão para uma cidade por latitude e longitude, incluindo deep link, resumo climático, próximos dias e favoritos.

<skills>
### Conformidade com Skills Padrões

- `frontend-design`: aplicável à apresentação escaneável da previsão.
- `shadcn`: aplicável se componentes shadcn forem adicionados ou ajustados.
- `vercel-react-best-practices`: aplicável a carregamento de dados, estado e componentes.
- `web-design-guidelines`: aplicável para acessibilidade e responsividade.
</skills>

<requirements>

- Criar rota de detalhes baseada em latitude e longitude.
- Exibir nome da cidade quando disponível por URL, navegação ou persistência.
- Buscar previsão pelo cliente API.
- Mostrar loading, erro e dados indisponíveis.
- Exibir resumo atual ou do dia.
- Exibir próximos dias com temperatura, chuva, vento e descrição/código.
- Permitir voltar para busca.
- Permitir favoritar e remover favorito.
- Suportar acesso direto por URL.
</requirements>

## Subtarefas

- [x] 5.1 Implementar rota e leitura dos parâmetros de detalhes.
- [x] 5.2 Implementar carregamento da previsão via cliente API.
- [x] 5.3 Renderizar resumo atual ou do dia.
- [x] 5.4 Renderizar lista de próximos dias.
- [x] 5.5 Implementar estados de loading, erro e dados indisponíveis.
- [x] 5.6 Integrar favoritos com `use-local-cities`.
- [x] 5.7 Adicionar testes de deep link, previsão, erro e favoritos.

## Detalhes de Implementação

Seguir as seções "Detalhes e previsão da cidade", "Modelos de Dados", "Experiência do Usuário" e "Abordagem de Testes" do `prd.md` e `techspec.md`.

## Critérios de Sucesso

- O usuário consegue abrir previsão a partir da busca e por deep link.
- A previsão apresenta dados práticos para viagem curta.
- Favoritar e remover favorito altera a persistência local.
- Falhas e dados incompletos não quebram a página.

## Testes da Tarefa

- [x] Testes de unidade para helpers locais, se houver.
- [x] Testes de integração com Testing Library para carregamento, previsão, erros e favoritos.
- [x] Testes E2E serão consolidados na tarefa 6.0.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/App.tsx`
- `frontend/src/pages/city-details.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/hooks/use-local-cities.ts`
- `frontend/src/components/ui/*`
- `frontend/src/**/*.test.tsx`
