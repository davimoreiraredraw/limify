"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ClockIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import { HistorySidebar } from "./components/HistorySidebar";
import TeamFormModal from "./components/TeamFormModal";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  roles: ("admin" | "owner" | "member")[];
  selected?: boolean;
}

interface Activity {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
}

export default function TeamPage() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar membros da equipe
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/teams");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar membros da equipe");
      }

      setTeamMembers(data.teamMembers);
    } catch (error) {
      console.error("Erro ao buscar membros:", error);
      toast.error("Erro ao carregar membros da equipe");
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar membros ao montar o componente
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const activities: Activity[] = [
    {
      id: "1",
      user: {
        name: "Kathryn Murphy",
        avatar: "/avatars/kathryn.jpg",
      },
      action: "Criou novo orçamento",
    },
    {
      id: "2",
      user: {
        name: "James Harrid",
        avatar: "/avatars/james.jpg",
      },
      action: "Gerou um relatório",
    },
    {
      id: "3",
      user: {
        name: "Elon Melon",
        avatar: "/avatars/elon.jpg",
      },
      action: "Criou um novo orçamento",
    },
    {
      id: "4",
      user: {
        name: "Mia Smith",
        avatar: "/avatars/mia.jpg",
      },
      action: "Adicionou e editor despesas",
    },
  ];

  // Função para adicionar novo membro
  const handleAddMember = async (
    email: string,
    role: "admin" | "member",
    name?: string
  ) => {
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao adicionar membro");
      }

      // Atualizar a lista de membros
      setTeamMembers((prev) => [...prev, data.member]);
      toast.success("Membro adicionado com sucesso!");
      setIsTeamFormOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      toast.error("Erro ao adicionar membro à equipe");
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-medium text-gray-900">
            Equipe com acesso
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-[#4FD1C5] hover:bg-[#4FD1C5]/90 text-white border-0 font-medium flex items-center gap-2"
              onClick={() => setIsHistoryOpen(true)}
            >
              <ClockIcon className="w-4 h-4" />
              Histórico
            </Button>
            <Button
              className="bg-[#6E2DFA] hover:bg-[#6E2DFA]/90 text-white font-medium flex items-center gap-2"
              onClick={() => setIsTeamFormOpen(true)}
            >
              <PlusIcon className="w-4 h-4" />
              Adicionar equipe
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg">
          <div className="grid grid-cols-[48px,2fr,2fr,1fr,80px] gap-4 px-4 py-3 border-b border-gray-100">
            <div className="flex items-center">
              <Checkbox className="rounded-[4px] border-gray-300" />
            </div>
            <div className="text-sm font-medium text-gray-500">Nome</div>
            <div className="text-sm font-medium text-gray-500">Email</div>
            <div className="text-sm font-medium text-gray-500">Cargo</div>
            <div className="text-sm font-medium text-gray-500">Ações</div>
          </div>

          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Carregando...</div>
          ) : teamMembers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhum membro encontrado
            </div>
          ) : (
            teamMembers.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-[48px,2fr,2fr,1fr,80px] gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Checkbox
                    className="rounded-[4px] border-gray-300"
                    checked={member.selected}
                  />
                </div>
                <div className="flex items-center text-sm text-gray-900">
                  {member.name}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  {member.email}
                </div>
                <div className="flex items-center gap-1">
                  {member.roles.map((role, index) => (
                    <span
                      key={index}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        role === "admin"
                          ? "bg-gray-100 text-gray-700"
                          : role === "owner"
                          ? "bg-[#E6FFFA] text-[#38B2AC]"
                          : "bg-[#EBF4FF] text-[#3182CE]"
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
                <div className="flex items-center">
                  <button className="text-[#6E2DFA] text-sm font-medium hover:text-[#6E2DFA]/90">
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <TeamFormModal
        isOpen={isTeamFormOpen}
        onClose={() => setIsTeamFormOpen(false)}
        onSubmit={handleAddMember}
      />
    </>
  );
}
