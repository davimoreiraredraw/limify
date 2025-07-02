import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { portfolioScripts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function GET() {
  try {
    const userId = await getUserId();

    const scripts = await db
      .select()
      .from(portfolioScripts)
      .where(eq(portfolioScripts.user_id, userId))
      .limit(1);

    return NextResponse.json(
      scripts[0] || { header_script: "", footer_script: "" }
    );
  } catch (error) {
    console.error("Erro ao buscar scripts:", error);
    return NextResponse.json(
      { error: "Erro ao buscar scripts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const { header_script, footer_script } = await req.json();

    // Verificar se já existe um registro para o usuário
    const existingScripts = await db
      .select()
      .from(portfolioScripts)
      .where(eq(portfolioScripts.user_id, userId))
      .limit(1);

    let result;
    if (existingScripts.length > 0) {
      // Atualizar registro existente
      [result] = await db
        .update(portfolioScripts)
        .set({
          header_script,
          footer_script,
          updated_at: new Date(),
        })
        .where(eq(portfolioScripts.user_id, userId))
        .returning();
    } else {
      // Criar novo registro
      [result] = await db
        .insert(portfolioScripts)
        .values({
          user_id: userId,
          header_script,
          footer_script,
        })
        .returning();
    }

    return NextResponse.json({ success: true, scripts: result });
  } catch (error) {
    console.error("Erro ao salvar scripts:", error);
    return NextResponse.json(
      { error: "Erro ao salvar scripts" },
      { status: 500 }
    );
  }
}
