# Documentação do Projeto Limify

## 1. Visão Geral

Limify é uma aplicação web desenvolvida para gerenciamento de orçamentos, despesas e projetos. O sistema atende profissionais autônomos e empresas que precisam gerenciar clientes, orçamentos e controlar finanças de forma eficiente.

## 2. Tecnologias Utilizadas

### 2.1. Frontend

- **Next.js 15**: Framework React com renderização do lado do servidor
- **TypeScript**: Tipagem estática
- **React 19**: Biblioteca para construção de interfaces
- **TailwindCSS**: Framework CSS utilitário
- **shadcn/ui**: Componentes React acessíveis baseados em Radix UI
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de esquemas
- **Sonner**: Sistema de notificações
- **Hello Pangea DnD**: Interface de arrastar e soltar
- **Recharts**: Biblioteca para gráficos

### 2.2. Backend

- **Supabase**: Plataforma de backend como serviço
  - Autenticação de usuários
  - Banco de dados PostgreSQL
  - Armazenamento de arquivos

### 2.3. ORM e Banco de Dados

- **Drizzle ORM**: ORM TypeScript para interação com o banco de dados
- **PostgreSQL**: Sistema de banco de dados relacional

## 3. Estrutura do Projeto

```
limify/
├── app/                    # Componentes de página (Next.js App Router)
│   ├── (auth)/             # Rotas de autenticação
│   │   ├── login/          # Página de login
│   │   └── register/       # Página de registro
│   ├── (dashboard)/        # Rotas protegidas
│   │   └── dashboard/      # Dashboard principal
│   │       ├── orcamentos/ # Gestão de orçamentos
│   │       └── despesas/   # Gestão de despesas
│   ├── api/                # Rotas de API
│   └── globals.css         # Estilos globais
├── components/             # Componentes reutilizáveis
│   ├── auth/               # Componentes de autenticação
│   ├── dashboard/          # Componentes do dashboard
│   ├── orcamentos/         # Componentes de orçamentos
│   ├── despesas/           # Componentes de despesas
│   └── ui/                 # Componentes de interface genéricos
├── lib/                    # Utilidades, hooks e configurações
│   ├── db/                 # Configurações do banco de dados
│   ├── hooks/              # Hooks personalizados
│   ├── drizzle.ts          # Esquema do Drizzle ORM
│   └── supabase.ts         # Configuração do Supabase
├── public/                 # Arquivos estáticos
└── drizzle/                # Migrações do Drizzle ORM
```

## 4. Autenticação e Autorização

### 4.1. Sistema de Autenticação

O Limify usa o Supabase Auth para gerenciar autenticação, oferecendo:

- Login/registro com email e senha
- Interface preparada para autenticação social
- Proteção de rotas via middleware

### 4.2. Hook `useAuth`

```typescript
// lib/hooks/use-auth.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function useAuth() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [user, setUser] = useState<any>(null);

  // Buscar usuário atual e configurar listener para mudanças
  useEffect(() => {
    // Código de inicialização...
  }, [supabase]);

  async function signIn(email: string, password: string) {
    // Implementação do login
  }

  async function signUp(
    email: string,
    password: string,
    name: string,
    userType: "client" | "professional"
  ) {
    // Implementação do registro
  }

  async function signOut() {
    // Implementação do logout
  }

  return {
    user,
    signIn,
    signUp,
    signOut,
  };
}
```

### 4.3. Middleware de Autenticação

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Criar cliente do Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Verificar sessão
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirecionar usuários não autenticados
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = new URL("/login", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirecionar usuários autenticados
  if (
    session &&
    (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/")
  ) {
    const redirectUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Configurar rotas para o middleware
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

## 5. Banco de Dados e Modelos

### 5.1. Esquemas Drizzle

```typescript
// lib/drizzle.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  decimal,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Configuração para o Next.js
const queryClient = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
  prepare: false,
  max: 1,
  connection: {
    keepAlive: false,
    keepAliveInitialDelayMillis: 0,
  },
  // Configurações adicionais...
});

// Tabela de Usuários
export const UsersTable = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    image: text("image").notNull(),
    userType: varchar("user_type", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (users) => {
    return {
      uniqueIdx: uniqueIndex("unique_idx").on(users.email),
    };
  }
);

// Tabela de Tipos de Orçamento
export const QuoteTypesTable = pgTable("quote_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Tabela de Orçamentos
export const QuotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => UsersTable.id),
  professionalId: integer("professional_id").references(() => UsersTable.id),
  quoteTypeId: integer("quote_type_id").references(() => QuoteTypesTable.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Tipos inferidos
export type User = InferSelectModel<typeof UsersTable>;
export type NewUser = InferInsertModel<typeof UsersTable>;

export type QuoteType = InferSelectModel<typeof QuoteTypesTable>;
export type NewQuoteType = InferInsertModel<typeof QuoteTypesTable>;

export type Quote = InferSelectModel<typeof QuotesTable>;
export type NewQuote = InferInsertModel<typeof QuotesTable>;

// Conectar ao Postgres
export const db = drizzle(queryClient);
```

## 6. Funcionalidades Principais

### 6.1. Dashboard

O Dashboard fornece uma visão geral das principais métricas:

```tsx
// app/(dashboard)/dashboard/page.tsx (parcial)
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          09 Feb 2024
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">
                Orçamentos realizados
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-medium">
                  {mockData.stats.orcamentosRealizados.value}
                </span>
                <span className="text-sm text-emerald-500">
                  ↑ {mockData.stats.orcamentosRealizados.percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Outras estatísticas... */}
        </div>

        {/* Gráfico de estatísticas */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Estatísticas</h2>
            <p className="text-sm text-muted-foreground">Fevereiro, 2025</p>
          </div>

          <StatsChart />
        </div>
      </div>

      {/* Tabela de orçamentos recentes */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {/* Implementação da tabela... */}
      </div>
    </div>
  );
}
```

### 6.2. Gestão de Orçamentos

O sistema utiliza uma interface tipo Kanban para gerenciar orçamentos, com as seguintes funcionalidades:

- Visualização em colunas por status
- Arrastar e soltar para mudar status
- Filtros e busca
- Detalhes e edição

### 6.3. Gestão de Despesas

O módulo de despesas permite:

- Cadastro categorizado de despesas
- Visualização por período
- Relatórios e gráficos

## 7. Componentes de Autenticação

### 7.1. Formulário de Login

```tsx
// components/auth/user-login-form.tsx (parcial)
export function UserLoginForm() {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      await signIn(values.email, values.password);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="example.email@gmail.com"
                  {...field}
                  className="h-12"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de senha... */}

        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Acessar agora"
          )}
        </Button>
      </form>
    </Form>
  );
}
```

## 8. Configuração e Implantação

### 8.1. Variáveis de Ambiente

```
# .env.example
POSTGRES_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
POSTGRES_URL_NON_POOLING=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
POSTGRES_USER=postgres.[project-ref]
POSTGRES_HOST=aws-0-[region].pooler.supabase.com
POSTGRES_PASSWORD=[your-password]
POSTGRES_DATABASE=postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### 8.2. Scripts Disponíveis

```json
// package.json (scripts)
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "generate": "drizzle-kit generate:pg",
    "push": "drizzle-kit push:pg",
    "drop": "drizzle-kit drop",
    "check": "drizzle-kit check:pg",
    "up": "drizzle-kit up:pg"
  }
}
```

## 9. Tipos e Interfaces

```typescript
// app/(dashboard)/dashboard/orcamentos/types.ts (parcial)
// Interface para orçamentos
export interface Budget {
  id: string;
  project: string;
  company: string;
  client: string;
  date: string;
  cost: number;
  price: number;
  profit: number;
  status:
    | "Visualizado"
    | "Não gerado"
    | "Pendente"
    | "Completo"
    | "Fechado"
    | "Vencido";
  column: "NÃO FINALIZADO" | "GERADO" | "FECHADOS";
}

// Interface para colunas
export interface Column {
  id: string;
  title: string;
  count: number;
  totalValue?: number;
  budgetIds: string[];
}

// Interface para o cliente
export interface Client {
  id: string;
  name: string;
  company: string;
  photoUrl?: string;
  budgetsCount: number;
  email?: string;
  phone?: string;
  document?: string;
  additionalInfo?: string;
}
```

## 10. Melhorias Futuras

### 10.1. Desenvolvimento de Backend

- Implementação completa das APIs RESTful
- Migração de dados mockados para banco de dados real

### 10.2. Funcionalidades Adicionais

- Relatórios avançados e exportação
- Integração com serviços de pagamento
- Notificações e lembretes
- Área do cliente para aprovação de orçamentos

### 10.3. Otimizações

- Implementação de cache para melhorar performance
- Testes automatizados
- CI/CD para implantação contínua

## 11. Execução do Projeto

### 11.1. Configuração Inicial

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente (copie `.env.example` para `.env` e preencha)
4. Execute as migrações: `npm run push`

### 11.2. Desenvolvimento

```bash
npm run dev
```

### 11.3. Produção

```bash
npm run build
npm run start
```
