import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamInvitesTable, teamMembersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
    const { inviteId } = body;

    // Buscar o convite
    const invite = await db.query.teamInvitesTable.findFirst({
      where: eq(teamInvitesTable.id, inviteId),
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Convite não encontrado" },
        { status: 404 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "Convite já foi processado" },
        { status: 400 }
      );
    }

    if (invite.email !== session.user.email) {
      return NextResponse.json(
        { error: "Este convite não é para você" },
        { status: 403 }
      );
    }

    // Adicionar usuário como membro da equipe
    const [member] = await db
      .insert(teamMembersTable)
      .values({
        teamId: invite.teamId,
        userId: session.user.id,
        name: invite.name,
        email: invite.email,
        role: invite.role,
      })
      .returning();

    // Atualizar status do convite
    await db
      .update(teamInvitesTable)
      .set({ status: "accepted" })
      .where(eq(teamInvitesTable.id, inviteId));

    return NextResponse.json(
      {
        message: "Convite aceito com sucesso",
        member,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao aceitar convite:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
