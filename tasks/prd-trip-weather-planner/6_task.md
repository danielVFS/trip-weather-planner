# Tarefa 6.0: Cobertura E2E

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar a suíte Playwright que comprova os fluxos principais do produto com mocks determinísticos e inclui um cenário real obrigatório contra backend local e Open-Meteo.

<skills>
### Conformidade com Skills Padrões

- `web-design-guidelines`: aplicável para validar acessibilidade básica, locators acessíveis e responsividade.
</skills>

<requirements>

- Cobrir busca com resultado, seleção e visualização da previsão.
- Cobrir busca sem resultados.
- Cobrir falha na busca.
- Cobrir falha na previsão.
- Cobrir recentes e limpeza de recentes.
- Cobrir favoritar e remover favorito.
- Cobrir deep link direto para detalhes.
- Validar layout principal em viewport mobile.
- Usar mocks de rede nos cenários principais.
- Incluir pelo menos um teste real contra backend e API pública.
</requirements>

## Subtarefas

- [ ] 6.1 Configurar Playwright para subir frontend e backend.
- [ ] 6.2 Criar fixtures/mocks para cidades e previsão.
- [ ] 6.3 Implementar E2E do fluxo feliz busca -> detalhes -> previsão.
- [ ] 6.4 Implementar E2E de vazio, falha na busca e falha na previsão.
- [ ] 6.5 Implementar E2E de recentes, limpar recentes e favoritos.
- [ ] 6.6 Implementar E2E de deep link e viewport mobile.
- [ ] 6.7 Implementar E2E real obrigatório contra backend e Open-Meteo.

## Detalhes de Implementação

Seguir as seções "Validação por testes", "Abordagem de Testes" e "Riscos Conhecidos" do `prd.md` e `techspec.md`.

## Critérios de Sucesso

- Os fluxos obrigatórios do PRD estão cobertos por Playwright.
- Cenários mockados são determinísticos.
- O cenário real valida integração ponta a ponta sem mocks.
- Locators priorizam nomes e papéis acessíveis.

## Testes da Tarefa

- [ ] Testes de unidade não aplicáveis nesta tarefa.
- [ ] Testes de integração não aplicáveis nesta tarefa.
- [ ] Testes E2E com mocks e um cenário real obrigatório.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `playwright.config.ts`
- `e2e/app.spec.ts`
- `frontend/src/App.tsx`
- `frontend/src/pages/home.tsx`
- `frontend/src/pages/city-details.tsx`
- `backend/src/index.ts`
