import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { portfolioTestimonials } from "@/lib/db/schema";
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

    const testimonials = await db
      .select()
      .from(portfolioTestimonials)
      .where(eq(portfolioTestimonials.user_id, userId));

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Erro ao buscar depoimentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar depoimentos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const formData = await req.formData();

    // Extrair dados do depoimento
    const clientName = formData.get("client_name") as string;
    const company = formData.get("company") as string;
    const profession = formData.get("profession") as string;
    const testimonial = formData.get("testimonial") as string;
    const rating = parseInt(formData.get("rating") as string);

    // Usar um avatar aleatório do DiceBear
    const seed = Math.random().toString(36).substring(7);
    const defaultPhotoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

    // Criar o depoimento
    const [newTestimonial] = await db
      .insert(portfolioTestimonials)
      .values({
        user_id: userId,
        client_name: clientName,
        company,
        profession,
        testimonial,
        rating,
        photo_url: defaultPhotoUrl,
      })
      .returning();

    return NextResponse.json({ success: true, testimonial: newTestimonial });
  } catch (error) {
    console.error("Erro ao criar depoimento:", error);
    return NextResponse.json(
      { error: "Erro ao criar depoimento" },
      { status: 500 }
    );
  }
}
