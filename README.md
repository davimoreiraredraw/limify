---
name: Postgres + Drizzle Next.js Starter
slug: postgres-drizzle
description: Simple Next.js template that uses a Postgres database and Drizzle as the ORM.
framework: Next.js
useCase: Starter
css: Tailwind
database: Postgres
deployUrl: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fexamples%2Ftree%2Fmain%2Fstorage%2Fpostgres-drizzle&project-name=postgres-drizzle&repository-name=postgres-drizzle&demo-title=Vercel%20Postgres%20%2B%20Drizzle%20Next.js%20Starter&demo-description=Simple%20Next.js%20template%20that%20uses%20Vercel%20Postgres%20as%20the%20database%20and%20Drizzle%20as%20the%20ORM.&demo-url=https%3A%2F%2Fpostgres-drizzle.vercel.app%2F&demo-image=https%3A%2F%2Fpostgres-drizzle.vercel.app%2Fopengraph-image.png&products=%5B%7B%22type%22%3A%22integration%22%2C%22group%22%3A%22postgres%22%7D%5D
demoUrl: https://postgres-drizzle.vercel.app/
relatedTemplates:
  - postgres-starter
  - postgres-prisma
  - postgres-kysely
---

# Postgres + Drizzle Next.js Starter

Simple Next.js template that uses a Postgres database and [Drizzle](https://github.com/drizzle-team/drizzle-orm) as the ORM.

## Demo

https://postgres-drizzle.vercel.app/

## How to Use

You can choose from one of the following two methods to use this repository:

### One-Click Deploy

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fexamples%2Ftree%2Fmain%2Fstorage%2Fpostgres-drizzle&project-name=postgres-drizzle&repository-name=postgres-drizzle&demo-title=Vercel%20Postgres%20%2B%20Drizzle%20Next.js%20Starter&demo-description=Simple%20Next.js%20template%20that%20uses%20Vercel%20Postgres%20as%20the%20database%20and%20Drizzle%20as%20the%20ORM.&demo-url=https%3A%2F%2Fpostgres-drizzle.vercel.app%2F&demo-image=https%3A%2F%2Fpostgres-drizzle.vercel.app%2Fopengraph-image.png&products=%5B%7B%22type%22%3A%22integration%22%2C%22group%22%3A%22postgres%22%7D%5D)

### Clone and Deploy

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [pnpm](https://pnpm.io/installation) to bootstrap the example:

```bash
pnpm create next-app --example https://github.com/vercel/examples/tree/main/storage/postgres-drizzle
```

Next, run Next.js in development mode:

```bash
pnpm dev
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples) ([Documentation](https://nextjs.org/docs/deployment)).

# Limify

## Integração com Stripe para planos de assinatura

### Configuração do ambiente

Para a integração com o Stripe funcionar corretamente, adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...            # Chave secreta da API do Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...       # Chave publicável da API do Stripe
NEXT_PUBLIC_BASIC_PLAN_ID=price_...      # ID do preço do plano Basic
NEXT_PUBLIC_EXPERT_PLAN_ID=price_...     # ID do preço do plano Expert
NEXT_PUBLIC_BUSINESS_PLAN_ID=price_...   # ID do preço do plano Business
NEXT_PUBLIC_BASE_URL=http://localhost:3000 # URL base da sua aplicação
STRIPE_WEBHOOK_SECRET=whsec_...          # Secret para webhook (opcional em dev)
```

### Configuração do Webhook

Para receber eventos do Stripe (como confirmações de pagamento e atualizações de assinatura), configure um webhook:

#### Em produção

1. No painel da Stripe, vá em **Developers > Webhooks**
2. Adicione um endpoint: `https://seu-dominio.com/api/stripe/webhook`
3. Selecione os eventos: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copie o "Signing Secret" e adicione como `STRIPE_WEBHOOK_SECRET` no seu `.env.local`

#### Em desenvolvimento

Use o Stripe CLI para testar webhooks localmente:

```bash
# Instalar Stripe CLI (instruções: https://stripe.com/docs/stripe-cli)
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

A CLI exibirá um webhook secret que você deve adicionar ao seu `.env.local` como `STRIPE_WEBHOOK_SECRET`.

### Limitações de planos

O sistema implementa as seguintes limitações por plano:

| Plano    | Orçamentos | Alterações      | Usuários | Clientes  |
| -------- | ---------- | --------------- | -------- | --------- |
| Grátis   | 1          | 0               | 1        | 2         |
| Basic    | 10         | 4 por orçamento | 2        | 10        |
| Expert   | 30         | Ilimitado       | 3        | 50        |
| Business | Ilimitado  | Ilimitado       | 10       | Ilimitado |

Estas limitações são automaticamente aplicadas ao criar recursos no sistema.
