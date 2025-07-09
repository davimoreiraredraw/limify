import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CategoriesTable } from "@/lib/db/schema";
import { eq, desc, or, isNull } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Rota para listar todas as categorias
export async function GET(req: NextRequest) {
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

    // Buscar categorias padrão (sem user_id) e categorias do usuário
    const categories = await db
      .select()
      .from(CategoriesTable)
      .where(
        or(
          eq(CategoriesTable.userId, session.user.id),
          isNull(CategoriesTable.userId)
        )
      )
      .orderBy(desc(CategoriesTable.createdAt));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rota para criar uma nova categoria
export async function POST(req: NextRequest) {
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

    const body = await req.json();

    // Extrai os dados do corpo da requisição
    const { name } = body;

    // Valida os campos obrigatórios
    if (!name) {
      return NextResponse.json(
        { error: "Nome da categoria é obrigatório" },
        { status: 400 }
      );
    }

    // Gera uma cor aleatória em formato hexadecimal
    const color = "#" + Math.floor(Math.random() * 16777215).toString(16);

    // Cria a data atual para os campos timestamp
    const now = new Date();

    // Inserir a categoria no banco
    const insertedCategories = await db
      .insert(CategoriesTable)
      .values({
        name,
        color,
        userId: session.user.id,
        createdAt: now,
      })
      .returning();

    if (!insertedCategories || insertedCategories.length === 0) {
      return NextResponse.json(
        { error: "Erro ao criar categoria" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { category: insertedCategories[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rota para atualizar uma categoria
export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID e nome são obrigatórios" },
        { status: 400 }
      );
    }

    // Atualizar a categoria
    const updatedCategories = await db
      .update(CategoriesTable)
      .set({ name })
      .where(eq(CategoriesTable.id, id))
      .returning();

    if (!updatedCategories || updatedCategories.length === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category: updatedCategories[0] });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rota para excluir uma categoria
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da categoria é obrigatório" },
        { status: 400 }
      );
    }

    // Excluir a categoria
    const deletedCategories = await db
      .delete(CategoriesTable)
      .where(eq(CategoriesTable.id, id))
      .returning();

    if (!deletedCategories || deletedCategories.length === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
