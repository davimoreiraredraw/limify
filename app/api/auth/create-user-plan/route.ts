import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { userPlansTable, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Cotas do plano gratuito
const FREE_PLAN_QUOTAS = {
  quotaOrçamentos: 5,
  quotaUsuários: 2,
  quotaClientes: 10,
  quotaAlterações: 3,
};

export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando criação de plano gratuito...", request);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    console.log("Usuário:", user);
    if (authError) {
      console.error("Erro de autenticação:", authError);
      return NextResponse.json(
        { error: `Erro de autenticação: ${authError.message}` },
        { status: 401 }
      );
    }

    if (!user) {
      console.error("Usuário não autenticado");
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    console.log("Usuário autenticado:", user.id);

    // Verificar se o usuário já possui um plano
    const existingPlan = await db
      .select()
      .from(userPlansTable)
      .where(eq(userPlansTable.userId, user.id))
      .limit(1);

    if (existingPlan.length > 0) {
      console.log("Usuário já possui um plano:", existingPlan[0]);
      return NextResponse.json(
        { message: "Usuário já possui um plano", plan: existingPlan[0] },
        { status: 200 }
      );
    }

    // Verificar se o perfil do usuário existe
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    // Se o perfil não existir, criar um
    if (userProfile.length === 0) {
      console.log("Criando perfil para o usuário:", user.id);
      try {
        await db.insert(profiles).values({
          id: user.id,
          name: user.user_metadata?.name || "Usuário",
          email: user.email,
          image: user.user_metadata?.avatar_url || null,
          user_type: "professional",
        });
      } catch (profileError) {
        console.error("Erro ao criar perfil do usuário:", profileError);
        // Continuar mesmo se falhar a criação do perfil
      }
    }

    // Criar plano gratuito com validade de 1 ano
    console.log("Criando plano gratuito para o usuário:", user.id);
    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(now.getFullYear() + 1);

    try {
      const [newPlan] = await db
        .insert(userPlansTable)
        .values({
          userId: user.id,
          planType: "free",
          status: "active",
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          stripePriceId: null,
          ...FREE_PLAN_QUOTAS,
          startDate: now,
          endDate: endDate,
        })
        .returning();

      console.log("Plano gratuito criado com sucesso:", newPlan);
      return NextResponse.json(
        {
          message: "Plano gratuito criado com sucesso",
          plan: newPlan,
          user: {
            id: user.id,
            email: user.email,
          },
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      console.error("Erro ao inserir plano no banco de dados:", dbError);
      return NextResponse.json(
        {
          error: "Erro ao criar plano gratuito no banco de dados",
          details: dbError.message || "Erro desconhecido",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Erro geral ao criar plano gratuito:", error);
    return NextResponse.json(
      {
        error: "Erro ao criar plano gratuito",
        details: error.message || "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
