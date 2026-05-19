# Tarefa 7.0: Validação final

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Executar a validação final da implementação completa, corrigindo falhas de causa raiz e documentando o resultado dos checks obrigatórios do projeto.

<skills>
### Conformidade com Skills Padrões

- `hono`: aplicável se falhas finais envolverem backend.
- `vercel-react-best-practices`: aplicável se falhas finais envolverem React.
- `frontend-design`: aplicável se ajustes finais envolverem UI/responsividade.
- `web-design-guidelines`: aplicável se ajustes finais envolverem acessibilidade.
</skills>

<requirements>

- Executar `bun run lint`.
- Executar `bun run typecheck`.
- Executar `bun run build`.
- Executar `bun run test`.
- Executar `bun run test:e2e`.
- Corrigir falhas por causa raiz, sem workarounds.
- Confirmar que o frontend consome apenas o backend local.
- Confirmar que o backend isola a Open-Meteo.
- Documentar resultados e riscos residuais.
</requirements>

## Subtarefas

- [ ] 7.1 Rodar lint e corrigir problemas.
- [ ] 7.2 Rodar typecheck e corrigir problemas.
- [ ] 7.3 Rodar build e corrigir problemas.
- [ ] 7.4 Rodar testes unitários e corrigir problemas.
- [ ] 7.5 Rodar testes E2E e corrigir problemas.
- [ ] 7.6 Revisar aderência ao PRD e Tech Spec.
- [ ] 7.7 Registrar resultado final dos checks.

## Detalhes de Implementação

Seguir as seções "Objetivos", "Restrições Técnicas de Alto Nível", "Sequenciamento de Desenvolvimento" e "Considerações Técnicas" do `prd.md` e `techspec.md`.

## Critérios de Sucesso

- Todos os checks obrigatórios passam.
- A cobertura E2E obrigatória existe e passa.
- Nenhum workaround substitui correção de causa raiz.
- Resultado final está documentado para revisão.

## Testes da Tarefa

- [ ] Testes de unidade via `bun run test`.
- [ ] Testes de integração via `bun run test`.
- [ ] Testes E2E via `bun run test:e2e`.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `package.json`
- `frontend/package.json`
- `backend/package.json`
- `tasks/prd-trip-weather-planner/prd.md`
- `tasks/prd-trip-weather-planner/techspec.md`
- `tasks/prd-trip-weather-planner/tasks.md`
