import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  teamsTable,
  teamMembersTable,
  teamInvitesTable,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { toast } from "sonner";
import { sendTeamInvite } from "@/lib/email";

// Rota para listar membros da equipe
export async function GET(req: NextRequest) {
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

    // Primeiro, verificar se o usuário já está em alguma equipe
    const teamMember = await db.query.teamMembersTable.findFirst({
      where: eq(teamMembersTable.userId, session.user.id),
      with: {
        team: true,
      },
    });

    // Se não estiver em nenhuma equipe, criar uma nova equipe com o usuário como owner
    if (!teamMember) {
      // Criar nova equipe
      const [newTeam] = await db
        .insert(teamsTable)
        .values({
          name: `Equipe ${session.user.email?.split("@")[0] || "Novo Usuário"}`,
          ownerId: session.user.id,
        })
        .returning();

      // Adicionar usuário como owner
      await db.insert(teamMembersTable).values({
        teamId: newTeam.id,
        userId: session.user.id,
        name:
          session.user.user_metadata?.name ||
          session.user.email?.split("@")[0] ||
          "Usuário",
        email: session.user.email || "",
        role: "owner",
      });

      // Retornar apenas o usuário atual como owner
      return NextResponse.json({
        teamMembers: [
          {
            id: session.user.id,
            name:
              session.user.user_metadata?.name ||
              session.user.email?.split("@")[0] ||
              "Usuário",
            email: session.user.email,
            roles: ["owner"],
          },
        ],
      });
    }

    // Buscar todos os membros da equipe
    const teamMembers = await db
      .select()
      .from(teamMembersTable)
      .where(eq(teamMembersTable.teamId, teamMember.teamId));

    // Formatar os resultados para o formato esperado pelo frontend
    const formattedMembers = teamMembers.map((member) => ({
      id: member.userId,
      name: member.name,
      email: member.email || "",
      roles: [member.role],
    }));

    return NextResponse.json({ teamMembers: formattedMembers });
  } catch (error) {
    console.error("Erro ao buscar membros da equipe:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rota para adicionar novo membro à equipe
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
    const { email, role, name } = body;

    // Verificar se o usuário atual é admin ou owner
    const currentMember = await db.query.teamMembersTable.findFirst({
      where: eq(teamMembersTable.userId, session.user.id),
      with: {
        team: true,
      },
    });

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
      return NextResponse.json(
        { error: "Sem permissão para adicionar membros" },
        { status: 403 }
      );
    }

    // Verificar se o usuário já é membro da equipe
    const existingMember = await db.query.teamMembersTable.findFirst({
      where: and(
        eq(teamMembersTable.teamId, currentMember.teamId),
        eq(teamMembersTable.email, email)
      ),
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Usuário já é membro da equipe" },
        { status: 400 }
      );
    }

    // Verificar se já existe um convite pendente
    const existingInvite = await db.query.teamInvitesTable.findFirst({
      where: and(
        eq(teamInvitesTable.teamId, currentMember.teamId),
        eq(teamInvitesTable.email, email),
        eq(teamInvitesTable.status, "pending")
      ),
    });

    if (existingInvite) {
      toast.error("Já existe um convite pendente para este email");
      return NextResponse.json(
        { error: "Já existe um convite pendente para este email" },
        { status: 400 }
      );
    }

    // Criar convite
    const [invite] = await db
      .insert(teamInvitesTable)
      .values({
        teamId: currentMember.teamId,
        email,
        name: name || email.split("@")[0],
        role: role || "member",
        invitedBy: session.user.id,
      })
      .returning();

    // Gerar link de convite
    const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/accept-invite?token=${invite.id}`;

    // Enviar email de convite
    const { success, error: emailError } = await sendTeamInvite({
      email,
      name: name || email.split("@")[0],
      teamName: currentMember.team.name,
      inviteLink,
    });

    if (!success) {
      // Se houver erro no envio do email, deletar o convite
      await db
        .delete(teamInvitesTable)
        .where(eq(teamInvitesTable.id, invite.id));

      return NextResponse.json(
        { error: "Erro ao enviar convite" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Convite enviado com sucesso",
        invite,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao adicionar membro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
