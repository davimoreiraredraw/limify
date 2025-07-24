import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { clientsTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // Criar cliente do Supabase
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

    // Obter usuário autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Atualizar clientes existentes que não têm userId
    const result = await db
      .update(clientsTable)
      .set({ userId })
      .where(sql`${clientsTable.userId} IS NULL OR ${clientsTable.userId} = ''`)
      .returning();

    return NextResponse.json({
      message: "Migração concluída",
      updatedCount: result.length,
    });
  } catch (error) {
    console.error("Erro na migração:", error);
    return NextResponse.json({ error: "Erro na migração" }, { status: 500 });
  }
}
