import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { budgets, budgetPublications } from "@/lib/db/schema";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";

// Função auxiliar para obter o userId
async function getUserId() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }

  return session.user.id;
}

export async function POST(req: NextRequest) {
  try {
    console.log("=== INÍCIO DA PUBLICAÇÃO ===");
    const userId = await getUserId();
    console.log("UserId obtido:", userId);

    const { previewData, configData, sectionConfigurations } = await req.json();
    console.log("Dados recebidos:", {
      previewData,
      configData,
      sectionConfigurations,
    });

    if (!previewData) {
      console.log("Erro: previewData não fornecido");
      return NextResponse.json(
        { success: false, error: "Dados do orçamento são obrigatórios" },
        { status: 400 }
      );
    }

    // Criar o orçamento
    const [newBudget] = await db
      .insert(budgets)
      .values({
        name: previewData.projectName,
        description: previewData.projectDescription,
        client_id: previewData.clientId,
        model: previewData.tipoAmbiente,
        budget_type: "m2",
        value_type: previewData.valorComodos,
        total: previewData.totalValue,
        user_id: userId,
        status: "publicado",
        discount: previewData.desconto || null,
        discount_type: previewData.tipoDesconto || null,
      })
      .returning();

    // Salvar dados da publicação
    const [publication] = await db
      .insert(budgetPublications)
      .values({
        budget_id: newBudget.id,
        header_title:
          configData?.title || `Proposta Comercial: ${previewData.projectName}`,
        header_subtitle: configData?.subtitle || "Preparado por: Estúdio Meza",
        header_image: configData?.headerImage || null,
        deliverables: JSON.stringify(sectionConfigurations?.deliverables || {}),
        phases: JSON.stringify(sectionConfigurations?.phases || {}),
        investment: JSON.stringify(sectionConfigurations?.investment || {}),
        about: JSON.stringify(sectionConfigurations?.about?.paragraphs || {}),
        about_years_experience:
          sectionConfigurations?.about?.yearsOfExperience || 0,
        about_completed_projects:
          sectionConfigurations?.about?.completedProjects || 0,
        team: JSON.stringify(sectionConfigurations?.team || {}),
      })
      .returning();

    return NextResponse.json({
      success: true,
      budgetId: newBudget.id,
      publicUrl: `/orcamento/${newBudget.id}`,
      message: "Orçamento publicado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao publicar orçamento:", error);

    // Se for erro de autenticação
    if (error instanceof Error && error.message === "Usuário não autenticado") {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
