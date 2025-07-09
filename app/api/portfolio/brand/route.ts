import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { portfolioBrand } from "@/lib/db/schema";
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

    const brand = await db
      .select()
      .from(portfolioBrand)
      .where(eq(portfolioBrand.user_id, userId))
      .limit(1);

    return NextResponse.json(brand[0] || null);
  } catch (error) {
    console.error("Erro ao buscar informações da marca:", error);
    return NextResponse.json(
      { error: "Erro ao buscar informações da marca" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserId();
    const formData = await req.formData();

    const about = formData.get("about") as string;
    const logo_url = formData.get("logo_url") as string;

    // Verificar se já existe um registro para o usuário
    const existingBrand = await db
      .select()
      .from(portfolioBrand)
      .where(eq(portfolioBrand.user_id, userId))
      .limit(1);

    let brand;

    if (existingBrand.length > 0) {
      // Atualizar registro existente
      [brand] = await db
        .update(portfolioBrand)
        .set({
          about,
          logo_url,
          updated_at: new Date(),
        })
        .where(eq(portfolioBrand.user_id, userId))
        .returning();
    } else {
      // Criar novo registro
      [brand] = await db
        .insert(portfolioBrand)
        .values({
          user_id: userId,
          about,
          logo_url,
        })
        .returning();
    }

    return NextResponse.json({ success: true, brand });
  } catch (error) {
    console.error("Erro ao atualizar marca:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar marca" },
      { status: 500 }
    );
  }
}
