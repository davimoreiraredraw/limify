"use client";

import { useState } from "react";
import { Client } from "@/app/(dashboard)/dashboard/orcamentos/types";
import { toast } from "sonner";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      // Simulando uma chamada de API para buscar clientes
      // Em produção, você substituiria isso por uma chamada real à API
      const mockClients: Client[] = [
        {
          id: "1",
          name: "João Silva",
          company: "Empresa A",
          photoUrl: "https://i.pravatar.cc/150?u=joao",
          budgetsCount: 2,
          email: "joao@empresaa.com",
          phone: "(11) 98765-4321",
        },
        {
          id: "2",
          name: "Maria Oliveira",
          company: "Empresa B",
          photoUrl: "https://i.pravatar.cc/150?u=maria",
          budgetsCount: 1,
          email: "maria@empresab.com",
        },
        {
          id: "3",
          name: "Carlos Souza",
          company: "Empresa C",
          photoUrl: "https://i.pravatar.cc/150?u=carlos",
          budgetsCount: 3,
          phone: "(21) 99876-5432",
        },
      ];

      setClients(mockClients);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setIsLoading(false);
    }
  };

  const createClient = async (formData: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    document?: string;
    additionalInfo?: string;
  }) => {
    setIsLoading(true);
    try {
      // Simulando uma chamada de API para criar um cliente
      // Em produção, você substituiria isso por uma chamada real à API
      const newClient: Client = {
        id: `temp-${Date.now()}`,
        name: formData.name,
        company: formData.company || "",
        photoUrl: `https://i.pravatar.cc/150?u=${formData.name.replace(
          " ",
          ""
        )}`,
        budgetsCount: 0,
        email: formData.email,
        phone: formData.phone,
        document: formData.document,
        additionalInfo: formData.additionalInfo,
      };

      setClients((prev) => [...prev, newClient]);
      toast.success("Cliente criado com sucesso!");
      return newClient;
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast.error("Erro ao criar cliente");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    isLoading,
    fetchClients,
    createClient,
  };
}
