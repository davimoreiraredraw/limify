import { NextRequest, NextResponse } from "next/server";
import { getClientById, updateClient, deleteClient } from "@/lib/clients";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Função para obter o userId do usuário autenticado
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

// Schema de validação para atualização de cliente
const updateClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  company: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().optional().nullable(),
  document: z.string().optional().nullable(),
  additionalInfo: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
});

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const userId = await getUserId();
    const client = await getClientById(id, userId);

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error(`Erro ao buscar cliente com ID ${params.id}:`, error);
    return NextResponse.json(
      { error: "Erro ao buscar cliente" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const userId = await getUserId();
    const body = await request.json();

    // Verificar se o cliente existe
    const existingClient = await getClientById(id, userId);
    if (!existingClient) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Validar os dados recebidos
    const validationResult = updateClientSchema.safeParse(body);

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
    const updatedClient = await updateClient(id, clientData, userId);

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error(`Erro ao atualizar cliente com ID ${params.id}:`, error);
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const userId = await getUserId();

    // Verificar se o cliente existe
    const existingClient = await getClientById(id, userId);
    if (!existingClient) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const result = await deleteClient(id, userId);

    if (result) {
      return new NextResponse(null, { status: 204 });
    } else {
      return NextResponse.json(
        { error: "Falha ao excluir cliente" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`Erro ao excluir cliente com ID ${params.id}:`, error);
    return NextResponse.json(
      { error: "Erro ao excluir cliente" },
      { status: 500 }
    );
  }
}
