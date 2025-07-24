import { NextRequest, NextResponse } from "next/server";
import { getClients, createClient } from "@/lib/clients";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Schema de validação para criação de cliente
const createClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  company: z.string().optional(),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().optional().nullable(),
  document: z.string().optional().nullable(),
  additionalInfo: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
});

export async function GET() {
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
    const clients = await getClients(userId);
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json();

    // Validar os dados recebidos
    const validationResult = createClientSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const clientData = validationResult.data;
    const newClient = await createClient(clientData, userId);

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}
