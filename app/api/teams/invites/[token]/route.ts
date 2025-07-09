import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamInvitesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invite = await db.query.teamInvitesTable.findFirst({
      where: eq(teamInvitesTable.id, params.token),
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Convite não encontrado" },
        { status: 404 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "Este convite já foi utilizado" },
        { status: 400 }
      );
    }

    return NextResponse.json({ invite });
  } catch (error) {
    console.error("Erro ao buscar convite:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
