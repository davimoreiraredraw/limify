import { NextRequest, NextResponse } from "next/server";
import { getClientById, updateClient, deleteClient } from "@/lib/clients";
import { z } from "zod";

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
    const client = await getClientById(id);

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
    const body = await request.json();

    // Verificar se o cliente existe
    const existingClient = await getClientById(id);
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
    const updatedClient = await updateClient(id, clientData);

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

    // Verificar se o cliente existe
    const existingClient = await getClientById(id);
    if (!existingClient) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const result = await deleteClient(id);

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
