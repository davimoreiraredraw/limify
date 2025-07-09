import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamsTable, teamMembersTable, profiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { toast } from "sonner";

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
      // Buscar perfil do usuário
      const userProfile = await db.query.profiles.findFirst({
        where: eq(profiles.id, session.user.id),
      });

      // Criar nova equipe
      const [newTeam] = await db
        .insert(teamsTable)
        .values({
          name: `Equipe ${userProfile?.name || session.user.email}`,
          ownerId: session.user.id,
        })
        .returning();

      // Adicionar usuário como owner
      await db.insert(teamMembersTable).values({
        teamId: newTeam.id,
        userId: session.user.id,
        name:
          userProfile?.name || session.user.email?.split("@")[0] || "Usuário",
        role: "owner",
      });

      // Retornar apenas o usuário atual como owner
      return NextResponse.json({
        teamMembers: [
          {
            id: session.user.id,
            name:
              userProfile?.name ||
              session.user.email?.split("@")[0] ||
              "Usuário",
            email: userProfile?.email || session.user.email,
            roles: ["owner"],
          },
        ],
      });
    }

    // Buscar todos os membros da equipe
    const teamMembers = await db
      .select({
        member: teamMembersTable,
        user: profiles,
      })
      .from(teamMembersTable)
      .leftJoin(profiles, eq(teamMembersTable.userId, profiles.id))
      .where(eq(teamMembersTable.teamId, teamMember.teamId));

    // Formatar os resultados para o formato esperado pelo frontend
    const formattedMembers = teamMembers.map((item) => ({
      id: item.user?.id || item.member.userId,
      name:
        item.member.name ||
        item.user?.name ||
        item.user?.email?.split("@")[0] ||
        "Usuário",
      email: item.member.email || item.user?.email || "",
      roles: [item.member.role],
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
    });

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
      toast.error("Sem permissão para adicionar membros");
      return NextResponse.json(
        { error: "Sem permissão para adicionar membros" },
        { status: 403 }
      );
    }

    // Buscar o usuário pelo email
    let user = await db.query.profiles.findFirst({
      where: eq(profiles.email, email),
    });

    // Se o usuário não existir, criar um novo perfil
    if (!user) {
      const [newUser] = await db
        .insert(profiles)
        .values({
          id: crypto.randomUUID(), // Gerar um ID único para o usuário
          email: email,
          name: name || email.split("@")[0], // Usar o nome fornecido ou parte do email como nome
          user_type: "professional", // Definir o tipo de usuário
          createdAt: new Date(),
        })
        .returning();

      user = newUser;
    }

    // Verificar se o usuário já é membro da equipe
    const existingMember = await db.query.teamMembersTable.findFirst({
      where: and(
        eq(teamMembersTable.teamId, currentMember.teamId),
        eq(teamMembersTable.userId, user.id)
      ),
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Usuário já é membro da equipe" },
        { status: 400 }
      );
    }

    // Adicionar novo membro
    const [newMember] = await db
      .insert(teamMembersTable)
      .values({
        teamId: currentMember.teamId,
        userId: user.id,
        name: name || email.split("@")[0],
        role: role || "member",
      })
      .returning();

    return NextResponse.json(
      {
        member: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: [newMember.role],
        },
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
