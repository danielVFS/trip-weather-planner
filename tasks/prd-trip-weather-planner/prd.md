# PRD: Trip Weather Planner

## Visao Geral

Trip Weather Planner e uma aplicacao full-stack simples para planejar viagens curtas a partir da previsao do tempo de uma cidade. O usuario busca uma cidade, seleciona um resultado e visualiza um resumo meteorologico atual e dos proximos dias, com dados suficientes para decidir roupas, deslocamento e cuidados basicos com chuva e vento.

O produto existe principalmente como estudo demonstravel de um workflow de geracao de codigo com IA em um monorepo real. O valor central e entregar um caso de uso pequeno, visual e testavel de ponta a ponta, com separacao clara entre frontend, backend, integracao com API publica e testes automatizados cobrindo comportamento real do usuario.

## Objetivos

- Demonstrar um fluxo completo de produto: buscar cidade, selecionar resultado, abrir detalhes e consultar previsao.
- Usar cobertura E2E robusta como principal metrica de sucesso, validando fluxos felizes, erros, estados vazios, persistencia local e responsividade mobile.
- Manter o escopo pequeno o suficiente para ser compreensivel em uma demonstracao publica, sem transformar o app em um planejador de viagens completo.
- Validar a separacao frontend/backend, garantindo que o frontend consuma apenas o backend local.
- Garantir que a aplicacao possa ser validada por lint, typecheck, build, testes unitarios e testes E2E.

Sucesso significa que a aplicacao roda localmente com os comandos do projeto, as duas paginas principais estao funcionais, os principais estados de UI estao cobertos e `bun run test:e2e` valida os comportamentos obrigatorios, incluindo pelo menos um cenario real contra backend e API publica.

## Historias de Usuario

- Como pessoa planejando uma viagem curta, eu quero buscar uma cidade pelo nome para encontrar rapidamente o destino correto.
- Como pessoa planejando uma viagem curta, eu quero ver diferentes resultados de cidade com pais, regiao e coordenadas para evitar selecionar um local errado.
- Como pessoa planejando uma viagem curta, eu quero abrir a previsao de uma cidade selecionada para decidir se a viagem exige preparacao para frio, calor, chuva ou vento.
- Como pessoa recorrente, eu quero ver cidades pesquisadas recentemente para reabrir destinos sem repetir a busca.
- Como pessoa recorrente, eu quero que cidades recentes mantenham o dia da busca e a menor/maior temperatura conhecida para comparar destinos reabertos.
- Como pessoa recorrente, eu quero limpar minhas cidades recentes para controlar os dados salvos no navegador.
- Como pessoa interessada em um destino, eu quero favoritar e remover uma cidade favorita para acompanhar locais importantes.
- Como pessoa interessada em destinos favoritos, eu quero ver uma estrela no destino favoritado para reconhecer rapidamente seu estado.
- Como pessoa acessando um link direto, eu quero abrir a pagina de detalhes por URL e ainda visualizar a previsao.
- Como avaliador tecnico do projeto, eu quero testes E2E deterministas e um teste real de integracao para confiar no comportamento principal da aplicacao.

## Funcionalidades Principais

### Busca de cidade

A pagina inicial permite que o usuario pesquise cidades por nome e escolha um resultado normalizado. Ela e importante porque inicia o fluxo principal do produto e precisa lidar bem com sucesso, ausencia de dados e falhas.

Requisitos funcionais:

1. A aplicacao deve disponibilizar uma pagina inicial de busca de cidade.
2. A pagina inicial deve exibir um campo de busca com rotulo acessivel.
3. A pagina inicial deve exibir um botao para executar a busca.
4. Ao buscar, a aplicacao deve mostrar estado de carregamento.
5. Quando a busca retornar resultados, a aplicacao deve listar cidades encontradas.
6. Cada resultado deve mostrar, no minimo, nome da cidade, pais ou regiao e coordenadas aproximadas.
7. Ao selecionar um resultado, a aplicacao deve navegar para a pagina de detalhes da cidade.
8. Quando nenhuma cidade for encontrada, a aplicacao deve mostrar um estado vazio compreensivel.
9. Quando a busca falhar, a aplicacao deve mostrar uma mensagem de erro amigavel.
10. A aplicacao deve salvar cidades pesquisadas recentemente no navegador.
11. A aplicacao deve exibir cidades recentes na pagina inicial.
12. Cada cidade recente deve exibir, quando disponivel, o dia em que a busca foi registrada, a temperatura minima e a temperatura maxima da previsao consultada.
13. A aplicacao deve permitir limpar a lista de cidades recentes.

### Detalhes e previsao da cidade

A pagina de detalhes mostra um resumo meteorologico para uma cidade selecionada ou acessada diretamente por link. Ela e importante porque entrega a informacao final que ajuda no planejamento da viagem.

Requisitos funcionais:

14. A aplicacao deve disponibilizar uma pagina de detalhes de cidade baseada em latitude e longitude.
15. A pagina de detalhes deve exibir o nome da cidade quando essa informacao estiver disponivel por navegacao, URL ou dado persistido.
16. A pagina de detalhes deve buscar a previsao usando latitude e longitude.
17. Durante o carregamento da previsao, a aplicacao deve mostrar estado de carregamento.
18. A pagina deve exibir um resumo de clima atual ou do dia.
19. A pagina deve exibir previsao dos proximos dias.
20. A previsao deve incluir temperatura minima, temperatura maxima, precipitacao ou chance/volume de chuva, vento e codigo ou descricao do clima.
21. Quando a previsao falhar, a pagina deve mostrar erro amigavel.
22. Quando dados indispensaveis estiverem indisponiveis, a pagina deve mostrar estado de dados indisponiveis.
23. A pagina deve oferecer uma acao para voltar para a busca.
24. A pagina deve permitir favoritar a cidade.
25. A pagina deve permitir remover a cidade dos favoritos.
26. A pagina deve exibir uma estrela visual no destino quando ele estiver favoritado.

### Validacao por testes

A cobertura E2E e parte do produto, pois o app foi definido como estudo demonstravel de comportamento ponta a ponta.

Requisitos funcionais:

27. Os testes E2E devem cobrir busca com resultado, selecao de cidade e visualizacao da previsao.
28. Os testes E2E devem cobrir busca sem resultados.
29. Os testes E2E devem cobrir falha na busca.
30. Os testes E2E devem cobrir falha na previsao.
31. Os testes E2E devem cobrir exibicao de cidade em recentes.
32. Os testes E2E devem cobrir limpeza de recentes.
33. Os testes E2E devem cobrir exibicao de dia da busca, temperatura minima e temperatura maxima em recentes quando a previsao ja foi consultada.
34. Os testes E2E devem cobrir favoritar, remover favorito e a estrela visual de destino favoritado.
35. Os testes E2E devem cobrir deep link direto para a pagina de detalhes.
36. Os testes E2E devem validar o layout principal em viewport mobile.
37. Os testes E2E principais devem usar mocks de rede para manter determinismo.
38. Deve existir ao menos um teste E2E real obrigatorio contra backend e API publica.

## Experiencia do Usuario

A experiencia deve ser direta e orientada a tarefa. Na primeira tela, o usuario deve entender imediatamente que pode buscar uma cidade. A lista de resultados deve ser facil de comparar, especialmente quando houver cidades com nomes parecidos. A navegacao para detalhes deve parecer natural e reversivel por uma acao clara de voltar.

Na pagina de detalhes, a informacao mais importante deve aparecer primeiro: cidade, resumo atual ou do dia e sinais praticos para viagem curta, como temperatura, chuva e vento. A previsao dos proximos dias deve ser escaneavel e adequada para desktop e mobile.

A interface deve considerar acessibilidade desde o inicio:

- Campos devem ter rotulos acessiveis.
- Botoes devem ter nomes acessiveis.
- Estados de carregamento, erro e vazio devem ser perceptiveis.
- Conteudo principal deve usar landmarks quando fizer sentido.
- A aplicacao deve ser usavel em viewport mobile.

## Restricoes Tecnicas de Alto Nivel

- O produto deve respeitar o monorepo existente com frontend React 19 + Vite 8 + TypeScript e backend Hono + Bun.
- O backend deve isolar o frontend da API publica externa.
- O frontend deve chamar apenas o backend local para busca de cidades e previsao.
- A aplicacao deve consumir a Open-Meteo Geocoding API e Forecast API.
- Dados de cidades recentes e favoritos devem permanecer locais ao navegador, sem contas de usuario.
- A aplicacao deve validar entradas essenciais e comunicar erros de forma amigavel.
- A validacao final deve incluir lint, typecheck, build, testes unitarios e testes E2E.
- Os testes E2E devem usar locators acessiveis e assertions web-first.
- O teste E2E real contra backend e API publica e obrigatorio.

## Fora de Escopo

- Login, contas de usuario, autenticacao e sincronizacao entre dispositivos.
- Banco de dados persistente no servidor.
- Mapas interativos nesta versao inicial.
- Planejamento de viagens longas, roteiros, itinerarios e recomendacoes de atividades.
- Reservas de hospedagem, passagens, transporte ou eventos.
- Alertas meteorologicos em tempo real ou notificacoes push.
- Internacionalizacao completa.
- Aplicativo mobile nativo.

Mapas interativos e planejamento de viagens longas podem ser considerados atividades futuras depois que o fluxo principal e a cobertura E2E estiverem estabilizados.
