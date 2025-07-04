import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo foi enviado" },
        { status: 400 }
      );
    }

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

    // Gerar um nome único para o arquivo
    const fileExtension = file.name.split(".").pop();
    const fileName = `${userId}/${folder}/${Date.now()}.${fileExtension}`;

    // Upload do arquivo para o bucket s3limify
    const { data, error } = await supabase.storage
      .from("s3limify")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Erro no upload:", error);
      return NextResponse.json(
        { error: "Erro ao fazer upload do arquivo" },
        { status: 500 }
      );
    }

    // Gerar URL pública do arquivo
    const {
      data: { publicUrl },
    } = supabase.storage.from("s3limify").getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrl,
      path: fileName,
    });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
