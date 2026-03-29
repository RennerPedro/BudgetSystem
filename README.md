# Budget System

Plataforma full stack para gestão financeira pessoal com foco em engenharia de software moderna: arquitetura orientada a domínio, regras de negócio explícitas, recalculo de orçamento em tempo real e API documentada.

Este projeto foi desenhado para demonstrar capacidade de entregar produto de ponta a ponta com qualidade de código, clareza arquitetural e boas práticas de DX.

## Executive Summary

- Problema resolvido: transformar renda, despesas fixas e despesas variáveis em decisão diária de gasto.
- Diferencial técnico: Budget Engine com múltiplas estratégias e estado de risco do orçamento.
- Arquitetura: Clean Architecture + DDD no backend e App Router no frontend.
- Operação: ambiente reproduzível via Docker Compose (API, Web, PostgreSQL e Redis).

## For Tech Recruiters

O que este projeto evidencia:

- Modelagem de domínio com separação clara entre camadas (Domain, Application, Infrastructure, Interface).
- Capacidade de evoluir regras de negócio sem acoplamento à camada HTTP/UI.
- Implementação e manutenção de consistência entre backend e frontend em fluxos reativos.
- Observabilidade funcional com histórico de ajustes e estados de orçamento.
- Maturidade de engenharia: testes unitários, Swagger/OpenAPI, scripts de bootstrap e documentação operacional.

## Product Highlights

- Autenticação JWT.
- Gestão de orçamento mensal.
- Registro de despesas FIXED e VARIABLE.
- Cálculo diário de gasto por estratégia:
	- LINEAR
	- AGGRESSIVE
	- SMART (heurística, AI-ready)
- Estados do orçamento:
	- HEALTHY
	- WARNING
	- CRITICAL
	- NEGATIVE
- Painel de alertas e histórico de ajustes.

## Architecture

### Backend

- NestJS 10
- Prisma ORM
- PostgreSQL
- Redis + BullMQ
- Swagger/OpenAPI

Estrutura lógica:

- Domain: regras e estratégias do Budget Engine
- Application: casos de uso e orquestração
- Infrastructure: banco, auth, fila
- Interface: controllers REST

### Frontend

- Next.js 14 (App Router)
- TypeScript
- React Query
- Zustand
- Tailwind CSS

## Repository Structure

```text
budget-system/
	apps/
		api/   # NestJS API
		web/   # Next.js app
	packages/
	docker-compose.yml
	README.md
	QUICKSTART.md
```

## Quick Links

- Setup rápido: veja QUICKSTART.md
- API Docs (Swagger): http://localhost:3000/api/docs
- Frontend: http://localhost:3001
- API: http://localhost:3000

## Run with Docker (Recommended)

```bash
npm install
npm run docker:up
npm run prisma:migrate
npm run seed
```

Credenciais de demonstração:

- Email: test@example.com
- Senha: password123

## Run Locally (Without Docker)

Pré-requisitos:

- Node.js 18+
- PostgreSQL 16+
- Redis 7+

Passos:

```bash
npm install
npm run prisma:migrate
npm run seed
npm run dev
```

## Testing

Observação: o monorepo possui testes unitários sob apps/api/test/unit e configuração dedicada do Jest.

```bash
npx jest --config apps/api/package.json --rootDir apps/api --testRegex test/unit/.*\.spec\.ts$
```

## Engineering Decisions

- Estratégias de orçamento isoladas por interface para facilitar evolução e testes.
- Recalculo síncrono em fluxos críticos de UX para evitar inconsistência visual.
- Atualização otimista e refetch controlado no frontend para manter UI responsiva.
- Cálculo diário com limites de viabilidade para evitar sugestões irreais de gasto.

## Roadmap

- Smart Strategy com sinais comportamentais mais ricos.
- Personalização de meta de reserva por usuário.
- Métricas de observabilidade e painéis operacionais.
- Testes e2e de fluxos críticos no dashboard.

## License

MIT
