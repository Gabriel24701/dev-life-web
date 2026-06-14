# Dev Life — Frontend

Interface web do SaaS de produtividade para desenvolvedores, construído com **Next.js 15**, **Tailwind CSS** e integração real com a API FastAPI em produção.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React + Tailwind CSS (Shadcn-style) |
| Ícones | Lucide React |
| Estado | Context API (AuthContext + ToastContext) |
| HTTP | Fetch nativo (centralizado em `src/services/api.ts`) |
| Tipagem | TypeScript strict |

---

## Estrutura de arquivos

```
src/
├── app/
│   ├── layout.tsx              # Root layout + dark mode flash prevention
│   ├── globals.css             # Tailwind + CSS vars + animações
│   ├── page.tsx                # Landing Page (/)
│   ├── auth/
│   │   ├── login/page.tsx      # /auth/login
│   │   └── register/page.tsx  # /auth/register
│   └── dashboard/
│       ├── layout.tsx          # Auth guard + shell
│       └── page.tsx            # /dashboard — integração real /tasks
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Botão reutilizável (4 variantes)
│   │   ├── Input.tsx           # Input com label e validação
│   │   ├── Modal.tsx           # Modal acessível (Esc + click outside)
│   │   └── ThemeToggle.tsx     # Toggle Dark/Light sem flash
│   ├── layout/
│   │   ├── Sidebar.tsx         # Navegação lateral com user info
│   │   └── DashboardHeader.tsx # Header sticky com saudação
│   ├── dashboard/
│   │   └── StatCard.tsx        # Card de métrica com acentuação por cor
│   └── tasks/
│       ├── TaskList.tsx        # Lista + filtros + estados de loading/empty
│       ├── TaskItem.tsx        # Item individual com toggle/delete
│       └── CreateTaskModal.tsx # Modal de criação de tarefa
│
├── contexts/
│   ├── AuthContext.tsx         # Auth mock + localStorage
│   └── ToastContext.tsx        # Sistema de toasts (success/error/info)
│
├── hooks/
│   └── useTasks.ts             # Hook: GET/POST/PATCH/DELETE + estado
│
├── services/
│   └── api.ts                  # HTTP client centralizado → API FastAPI
│
└── types/
    └── index.ts                # Tipos TypeScript (Task, User, etc.)
```

---

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

---

## Integração com a API

A URL base está em `src/services/api.ts`:

```ts
const BASE_URL = "https://app-devlife-api-bielllb-01.azurewebsites.net";
```

Endpoints consumidos:

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/tasks` | Carregar todas as tarefas |
| `POST` | `/tasks` | Criar nova tarefa |
| `PATCH` | `/tasks/:id` | Toggle de conclusão (optimistic update) |
| `DELETE` | `/tasks/:id` | Remover tarefa (optimistic update) |

---

## Auth (mock)

O fluxo de autenticação é **mockado no front-end** — nenhum endpoint de auth é chamado ainda. O usuário é salvo em `localStorage` com a chave `devlife:user`. Para conectar à API real, substitua as funções `login` e `register` em `src/contexts/AuthContext.tsx`.

---

## Dark Mode

O script inline em `layout.tsx` lê `localStorage.getItem('devlife:theme')` antes do primeiro paint, eliminando o flash de tema errado (FOUC). O toggle fica no header de todas as telas.

---

## Próximos passos sugeridos

- [ ] Conectar auth real (endpoint `/auth/login` e `/auth/register`)
- [ ] Adicionar SonarQube no pipeline de CI/CD
- [ ] Implementar `/dashboard/tasks` como página full de gestão
- [ ] Adicionar React Query (TanStack Query) para cache e invalidação
- [ ] Implementar módulo de Hábitos
