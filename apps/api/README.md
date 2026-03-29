# Budget System - Backend API

Backend NestJS com Clean Architecture + DDD para sistema de gestão financeira pessoal.

## 🏗️ Arquitetura

```
src/
├── domain/              # Domain Layer - Regras de negócio
│   ├── budget-engine/   # Motor de cálculo de orçamento
│   │   ├── strategies/  # Estratégias (Linear, Aggressive, Smart)
│   │   └── budget.engine.ts
│   └── types.ts
├── application/         # Application Layer - Casos de uso
│   ├── dtos/           # Data Transfer Objects
│   └── services/       # Services (Auth, Budget, Expense, Alert)
├── infrastructure/      # Infrastructure Layer - Detalhes técnicos
│   ├── database/       # Prisma Service
│   ├── auth/           # JWT Strategy, Guards, Decorators
│   └── queue/          # BullMQ Processors
├── interface/          # Interface Layer - Controllers
│   └── controllers/    # HTTP Controllers
└── modules/            # NestJS Modules
```

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- PostgreSQL 16+
- Redis 7+

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Rodar migrações do Prisma
npm run prisma:migrate

# Popular banco com dados de teste
npm run seed
```

### Desenvolvimento

```bash
# Modo desenvolvimento (hot-reload)
npm run start:dev

# Build para produção
npm run build

# Rodar em produção
npm run start:prod
```

## 📊 Prisma

```bash
# Gerar Prisma Client
npm run prisma:generate

# Criar nova migration
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio

# Popular banco
npm run seed
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📚 Documentação da API

Acesse `http://localhost:3000/api/docs` após iniciar o servidor.

## 🎯 Budget Engine

O núcleo do sistema é o **Budget Engine**, que implementa 3 estratégias:

### 1. Linear Strategy
- Distribuição uniforme do saldo restante
- `dailyBudget = remainingBalance / remainingDays`

### 2. Aggressive Strategy
- Detecta excessos de gasto
- Aplica correção rápida em 2 dias
- `correction = excess / 2`

### 3. Smart Strategy (AI-ready)
- Análise de padrões de gasto
- Peso adaptativo baseado no progresso do mês
- Preparada para integração com ML

## 🔄 Processamento Assíncrono

Usa **BullMQ** para processar:
- Recálculo de orçamento após despesas
- Geração de alertas automáticos

## 🔐 Autenticação

- JWT com Passport
- Guards globais com decorator `@Public()` para rotas públicas
- Token expira em 7 dias (configurável)

## 📧 Credenciais de Teste

Após rodar o seed:

```
Email: test@example.com
Senha: password123
```

## 🗃️ Estrutura do Banco

- **users** - Usuários do sistema
- **budgets** - Orçamentos mensais
- **expenses** - Despesas (fixas e variáveis)
- **budget_adjustments** - Histórico de ajustes
- **alerts** - Notificações e alertas

## 🐳 Docker

```bash
# Build
docker build -t budget-api .

# Run
docker run -p 3000:3000 budget-api
```

## 📝 Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/budget_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```
