import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamsTable, teamMembersTable } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, email } = body;

    if (!userId || !name) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Criar nova equipe
    const [newTeam] = await db
      .insert(teamsTable)
      .values({
        name: `Equipe ${name}`,
        ownerId: userId,
      })
      .returning();

    // Adicionar usuário como owner
    await db.insert(teamMembersTable).values({
      teamId: newTeam.id,
      userId: userId,
      name: name, // Adicionando o nome do membro
      role: "owner",
    });

    return NextResponse.json(
      {
        team: newTeam,
        message: "Equipe criada com sucesso",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar equipe:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
