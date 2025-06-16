import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/drizzle";
import { userPlansTable, planTypeEnum } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Inicializa o cliente Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

// Mapeamento de planos com suas respectivas cotas
const PLAN_QUOTAS = {
  free: {
    orçamentos: 1,
    alterações: 0,
    usuarios: 1,
    clientes: 2,
  },
  basic: {
    orçamentos: 10,
    alterações: 4,
    usuarios: 2,
    clientes: 10,
  },
  expert: {
    orçamentos: 30,
    alterações: null, // null representa ilimitado
    usuarios: 3,
    clientes: 50,
  },
  business: {
    orçamentos: null, // null representa ilimitado
    alterações: null, // null representa ilimitado
    usuarios: 10,
    clientes: null, // null representa ilimitado
  },
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  // Você precisará configurar este webhook secret no painel da Stripe e no seu .env
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      // Se estiver em desenvolvimento, apenas parse o JSON sem validar assinatura
      const payload = JSON.parse(body);
      event = payload as Stripe.Event;
      console.log("Webhook recebido (modo de desenvolvimento):", event.type);
    } else {
      // Em produção, valide a assinatura
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      console.log("Webhook recebido e verificado:", event.type);
    }
  } catch (err: any) {
    console.error(`Erro no webhook: ${err.message}`);
    return NextResponse.json(
      {
        error: `Webhook Error: ${err.message}`,
      },
      { status: 400 }
    );
  }

  // Processar o evento com base no tipo
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const priceId = session.metadata?.priceId || "";

        // Determinar o tipo de plano com base no priceId
        let planType: "basic" | "expert" | "business" = "basic";
        if (priceId === process.env.NEXT_PUBLIC_EXPERT_PLAN_ID) {
          planType = "expert";
        } else if (priceId === process.env.NEXT_PUBLIC_BUSINESS_PLAN_ID) {
          planType = "business";
        }

        // Buscar informações da assinatura para obter datas
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        const startDate = new Date(
          (subscription as any).current_period_start * 1000
        );
        const endDate = new Date(
          (subscription as any).current_period_end * 1000
        );

        if (userId) {
          // Verificar se o usuário já tem um plano
          const existingPlan = await db
            .select()
            .from(userPlansTable)
            .where(eq(userPlansTable.userId, userId))
            .limit(1);

          const quotas = PLAN_QUOTAS[planType];

          if (existingPlan.length > 0) {
            // Atualizar plano existente
            await db
              .update(userPlansTable)
              .set({
                planType: planType,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                stripePriceId: priceId,
                status: "active",
                quotaOrçamentos: quotas.orçamentos,
                quotaAlterações: quotas.alterações,
                quotaUsuários: quotas.usuarios,
                quotaClientes: quotas.clientes,
                startDate: startDate,
                endDate: endDate,
                updatedAt: new Date(),
              })
              .where(eq(userPlansTable.userId, userId));

            console.log(`Plano atualizado para usuário ${userId}: ${planType}`);
          } else {
            // Criar novo plano
            await db.insert(userPlansTable).values({
              userId: userId,
              planType: planType,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: priceId,
              status: "active",
              quotaOrçamentos: quotas.orçamentos,
              quotaAlterações: quotas.alterações,
              quotaUsuários: quotas.usuarios,
              quotaClientes: quotas.clientes,
              startDate: startDate,
              endDate: endDate,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            console.log(
              `Novo plano criado para usuário ${userId}: ${planType}`
            );
          }
        } else {
          console.error("ID de usuário não encontrado na sessão de checkout");
        }
        break;
      }

      case "invoice.payment_succeeded": {
        // Ao receber pagamento recorrente, atualizar datas de validade
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          const endDate = new Date(
            (subscription as any).current_period_end * 1000
          );

          await db
            .update(userPlansTable)
            .set({
              status: "active",
              endDate: endDate,
              updatedAt: new Date(),
            })
            .where(eq(userPlansTable.stripeSubscriptionId, subscriptionId));

          console.log(`Assinatura ${subscriptionId} renovada até ${endDate}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        // Processa atualizações na assinatura (mudança de plano, cancelamento, etc)
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const status = subscription.status;

        // Determinar o tipo de plano com base no priceId
        let planType: "free" | "basic" | "expert" | "business" = "basic";
        if (priceId === process.env.NEXT_PUBLIC_EXPERT_PLAN_ID) {
          planType = "expert";
        } else if (priceId === process.env.NEXT_PUBLIC_BUSINESS_PLAN_ID) {
          planType = "business";
        }

        // Atualizar o status e tipo de plano
        await db
          .update(userPlansTable)
          .set({
            planType: planType,
            status: status === "active" ? "active" : "inactive",
            stripePriceId: priceId,
            updatedAt: new Date(),
          })
          .where(eq(userPlansTable.stripeSubscriptionId, subscription.id));

        console.log(
          `Assinatura ${subscription.id} atualizada: ${status}, plano: ${planType}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        // Quando a assinatura é cancelada, voltar para o plano gratuito
        const subscription = event.data.object as Stripe.Subscription;

        await db
          .update(userPlansTable)
          .set({
            planType: "free",
            status: "inactive",
            quotaOrçamentos: PLAN_QUOTAS.free.orçamentos,
            quotaAlterações: PLAN_QUOTAS.free.alterações,
            quotaUsuários: PLAN_QUOTAS.free.usuarios,
            quotaClientes: PLAN_QUOTAS.free.clientes,
            updatedAt: new Date(),
          })
          .where(eq(userPlansTable.stripeSubscriptionId, subscription.id));

        console.log(
          `Assinatura ${subscription.id} cancelada, usuário voltou para plano gratuito`
        );
        break;
      }

      default:
        console.log(`Evento não processado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Erro ao processar webhook: ${error.message}`);
    return NextResponse.json(
      { error: `Erro ao processar webhook: ${error.message}` },
      { status: 500 }
    );
  }
}
