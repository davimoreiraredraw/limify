import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { portfolioProjects, portfolioImages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
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

    // Buscar todos os projetos do usuário com suas imagens
    const projects = await db
      .select({
        id: portfolioProjects.id,
        title: portfolioProjects.title,
        description: portfolioProjects.description,
        category: portfolioProjects.category,
        created_at: portfolioProjects.created_at,
        images: portfolioImages,
      })
      .from(portfolioProjects)
      .leftJoin(
        portfolioImages,
        eq(portfolioImages.project_id, portfolioProjects.id)
      )
      .where(eq(portfolioProjects.user_id, userId));

    // Agrupar imagens por projeto
    const formattedProjects = projects.reduce((acc: any[], curr) => {
      const existingProject = acc.find((p) => p.id === curr.id);
      if (existingProject) {
        if (curr.images) {
          existingProject.images.push(curr.images);
        }
      } else {
        acc.push({
          ...curr,
          images: curr.images ? [curr.images] : [],
        });
      }
      return acc;
    }, []);

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar projetos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const formData = await req.formData();

    // Extrair dados do projeto
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const images = JSON.parse(formData.get("images") as string);

    // Criar o projeto
    const [project] = await db
      .insert(portfolioProjects)
      .values({
        user_id: userId,
        title,
        description,
        category,
      })
      .returning();

    // Salvar todas as imagens do projeto
    if (images && images.length > 0) {
      await db.insert(portfolioImages).values(
        images.map(
          (img: { url: string; is_cover: boolean }, index: number) => ({
            project_id: project.id,
            url: img.url,
            is_cover: index === 0, // primeira imagem será a capa
          })
        )
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    return NextResponse.json(
      { error: "Erro ao criar projeto" },
      { status: 500 }
    );
  }
}
