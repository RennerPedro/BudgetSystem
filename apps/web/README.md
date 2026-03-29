# Budget System - Frontend

Frontend Next.js 14 com App Router para sistema de gestão financeira pessoal.

## 🛠️ Stack Tecnológica

- **Next.js 14** - App Router
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **React Query** - Server State Management
- **Zustand** - Client State Management
- **Axios** - HTTP Client
- **Lucide React** - Icons
- **date-fns** - Date Formatting

## 🏗️ Estrutura

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard protegido
│   ├── login/            # Página de login
│   ├── register/         # Página de registro
│   └── layout.tsx        # Layout raiz
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Button, Input, Card)
│   ├── budget/           # Componentes de orçamento
│   ├── expenses/         # Componentes de despesas
│   └── alerts/           # Componentes de alertas
├── hooks/                # Custom Hooks
│   ├── useBudget.ts
│   ├── useExpenses.ts
│   └── useAlerts.ts
├── services/             # API Services
│   ├── auth.service.ts
│   ├── budget.service.ts
│   ├── expense.service.ts
│   └── alert.service.ts
├── store/                # Zustand Stores
│   └── auth.store.ts
├── lib/                  # Utilities
│   ├── api.ts           # Axios client
│   └── utils.ts         # Helper functions
├── types/               # TypeScript Types
│   └── index.ts
└── providers/           # React Providers
    └── query-provider.tsx
```

## 🚀 Começando

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite NEXT_PUBLIC_API_URL se necessário
```

### Desenvolvimento

```bash
# Rodar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm run start

# Lint
npm run lint
```

Acesse: `http://localhost:3001`

## 🎨 Componentes Principais

### Dashboard
- **BudgetSummary** - Visão geral do orçamento com métricas
- **ExpenseForm** - Formulário para adicionar despesas
- **ExpenseList** - Lista de despesas do mês
- **AlertsPanel** - Painel de notificações

### UI Components
- **Button** - Botão com variantes (primary, secondary, danger, ghost)
- **Input** - Input com label e validação
- **Card** - Container com título e subtitle
- **Badge** - Badge com status coloridos

## 🔐 Autenticação

O sistema usa JWT para autenticação:

1. Login/Register → Recebe token
2. Token salvo em localStorage
3. Interceptor do Axios adiciona token em todas requisições
4. Layout do dashboard protege rotas

## 📊 State Management

### Server State (React Query)
- Cache automático de dados da API
- Refetch e invalidação inteligente
- Loading e error states

### Client State (Zustand)
- Auth state (user, token, isAuthenticated)
- Persist em localStorage

## 🎨 Styling

Tailwind CSS com tema customizado:

```javascript
colors: {
  primary: { /* Blue shades */ },
  success: { /* Green shades */ },
  warning: { /* Orange shades */ },
  danger: { /* Red shades */ },
}
```

## 🔄 Hooks Customizados

### useBudget
```typescript
const { budget, createBudget, updateStrategy } = useBudget();
```

### useExpenses
```typescript
const { expenses, stats, createExpense, deleteExpense } = useExpenses();
```

### useAlerts
```typescript
const { alerts, unreadCount, markAsRead } = useAlerts();
```

## 🐳 Docker

```bash
# Build
docker build -t budget-web .

# Run
docker run -p 3001:3001 budget-web
```

## 📝 Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🌐 Páginas

- `/` - Redirect para dashboard
- `/login` - Página de login
- `/register` - Página de registro
- `/dashboard` - Dashboard principal (protegido)

## 🎯 Funcionalidades

- ✅ Autenticação completa
- ✅ Criação e visualização de orçamento
- ✅ Adição e remoção de despesas
- ✅ Visualização de alertas
- ✅ Troca de estratégia de orçamento
- ✅ Dashboard responsivo
- ✅ Feedback visual de status
