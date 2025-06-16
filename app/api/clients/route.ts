import { NextRequest, NextResponse } from "next/server";
import { getClients, createClient } from "@/lib/clients";
import { z } from "zod";

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
    const clients = await getClients();
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
    const newClient = await createClient(clientData);

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}
