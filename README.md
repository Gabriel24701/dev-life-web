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

## Auth

Autenticação real contra a API (`/auth/login`, `/auth/register`, `/auth/me`), mais **login com Google** via Google Identity Services. Token e usuário ficam em `localStorage` (`devlife:token` / `devlife:user`). Lógica centralizada em `src/contexts/AuthContext.tsx`.

### Login com Google — configuração necessária

O botão "Entrar com Google" (em `/auth/login` e `/auth/register`) usa o [Google Identity Services](https://developers.google.com/identity/gsi/web) — precisa de um Client ID OAuth configurado no Google Cloud Console antes de funcionar.

**1. Criar as credenciais no Google Cloud Console:**
1. Acesse [console.cloud.google.com](https://console.cloud.google.com/) e crie (ou selecione) um projeto.
2. Vá em **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
3. Tipo de aplicação: **Web application**.
4. Em **Authorized JavaScript origins**, adicione as origens de onde o app roda (sem path, sem barra final):
   - `http://localhost:3000` (dev local)
   - `https://<seu-domínio-de-produção>`
5. **Authorized redirect URIs** não é necessário para o fluxo usado aqui (Google Identity Services faz a autenticação via popup/One Tap no próprio client-side, sem redirect de servidor).
6. Copie o **Client ID** gerado (formato `xxxxx.apps.googleusercontent.com`).

**2. Configurar a variável de ambiente:**

| Variável | Onde configurar |
|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `.env.local` em desenvolvimento; variável de ambiente do provedor de hosting (ex: Vercel → Project Settings → Environment Variables) em produção |

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

Sem essa variável, o botão do Google simplesmente **não é renderizado** (falha silenciosa e segura — login por senha continua funcionando normalmente).

**3. Configurar o mesmo Client ID no backend:** o backend (`dev-life-api`) precisa da variável `GOOGLE_CLIENT_ID` com o **mesmo valor**, para validar a audiência (`aud`) do token — veja o README do backend.

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
