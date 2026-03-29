# Quickstart

Guia operacional para subir o projeto rapidamente com fluxo profissional de validação.

## 1. Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop (ou Docker Engine + Compose)

## 2. Clone and Install

```bash
git clone <repository-url>
cd budget-system
npm install
```

## 3. Configure Environment Files

Crie os arquivos de ambiente a partir dos exemplos:

- apps/api/.env
- apps/web/.env.local

Exemplo de backend:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/budget_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="change-me"
PORT=3000
```

Exemplo de frontend:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## 4. Start with Docker (Recommended)

```bash
npm run docker:up
npm run prisma:migrate
npm run seed
```

Endpoints:

- Frontend: http://localhost:3001
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

Credenciais de demonstração:

- Email: test@example.com
- Senha: password123

## 5. Local Development (Alternative)

Se preferir rodar sem Docker para API e web:

```bash
npm run dev:api
npm run dev:web
```

Observação: PostgreSQL e Redis precisam estar ativos localmente.

## 6. Verification Checklist

Após subir o sistema, valide:

1. Login com usuário de seed.
2. Abertura do dashboard sem erro.
3. Criação de despesa variável.
4. Recalculo automático do orçamento diário.
5. Acesso ao Swagger.

## 7. Useful Commands

```bash
# status dos containers
docker compose ps

# logs da API
docker compose logs -f api

# restart rápido
docker compose restart api web

# rebuild completo
docker compose up -d --build

# parar stack
docker compose down
```

## 8. Troubleshooting

### API não conecta no banco

- Verifique DATABASE_URL no apps/api/.env.
- Verifique se o container do Postgres está healthy.

### API não conecta no Redis

- Verifique REDIS_URL no apps/api/.env.
- Verifique se o container redis está em execução.

### Frontend não atualiza mudanças

- Reinicie API e web:

```bash
docker compose restart api web
```

### Porta em uso

No Windows PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 3000,3001 | Select-Object LocalPort,OwningProcess,State
```

## 9. Test Commands

```bash
# testes unitários API
npx jest --config apps/api/package.json --rootDir apps/api --testRegex test/unit/.*\.spec\.ts$

# build frontend
npm run build:web
```
