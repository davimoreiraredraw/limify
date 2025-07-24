import { useState } from "react";
import { toast } from "sonner";
import { Client } from "@/app/(dashboard)/dashboard/orcamentos/types";

interface ClientFormData {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  document?: string;
  additionalInfo?: string;
  photoUrl?: string;
}

// Interface para o cliente retornado da API
interface ApiClient {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  document: string | null;
  additionalInfo: string | null;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Função para converter ApiClient para o tipo Client
const mapApiClientToClient = (apiClient: ApiClient): Client => {
  return {
    id: apiClient.id,
    name: apiClient.name,
    company: apiClient.company || "",
    email: apiClient.email || undefined,
    phone: apiClient.phone || undefined,
    document: apiClient.document || undefined,
    additionalInfo: apiClient.additionalInfo || undefined,
    photoUrl: apiClient.photoUrl || undefined,
    budgetsCount: 0, // Por enquanto definimos como 0, futuramente pode ser calculado
  };
};

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todos os clientes
  const fetchClients = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/clients");

      if (!response.ok) {
        // Se a resposta for 401, tentar migrar clientes existentes
        if (response.status === 401) {
          const migrateResponse = await fetch("/api/clients/migrate", {
            method: "POST",
          });

          if (migrateResponse.ok) {
            // Tentar buscar novamente após a migração
            const retryResponse = await fetch("/api/clients");
            if (retryResponse.ok) {
              const data: ApiClient[] = await retryResponse.json();
              const mappedClients = data.map(mapApiClientToClient);
              setClients(mappedClients);
              return mappedClients;
            }
          }
        }

        throw new Error(`Erro ao buscar clientes: ${response.status}`);
      }

      const data: ApiClient[] = await response.json();
      const mappedClients = data.map(mapApiClientToClient);
      setClients(mappedClients);
      return mappedClients;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao buscar clientes";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Buscar cliente por ID
  const fetchClientById = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${id}`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar cliente: ${response.status}`);
      }

      const data: ApiClient = await response.json();
      return mapApiClientToClient(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao buscar cliente";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Criar novo cliente
  const createClient = async (formData: ClientFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Erro ao criar cliente: ${response.status}`
        );
      }

      const newClient: ApiClient = await response.json();
      const mappedClient = mapApiClientToClient(newClient);
      setClients((prev) => [...prev, mappedClient]);
      toast.success("Cliente criado com sucesso!");
      return mappedClient;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao criar cliente";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar cliente
  const updateClient = async (
    id: string,
    formData: Partial<ClientFormData>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Erro ao atualizar cliente: ${response.status}`
        );
      }

      const updatedClient: ApiClient = await response.json();
      const mappedClient = mapApiClientToClient(updatedClient);

      // Atualizar a lista de clientes
      setClients((prev) =>
        prev.map((client) => (client.id === id ? mappedClient : client))
      );

      toast.success("Cliente atualizado com sucesso!");
      return mappedClient;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao atualizar cliente";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Excluir cliente
  const deleteClient = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Erro ao excluir cliente: ${response.status}`
        );
      }

      // Remover o cliente da lista
      setClients((prev) => prev.filter((client) => client.id !== id));

      toast.success("Cliente excluído com sucesso!");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao excluir cliente";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    fetchClientById,
    createClient,
    updateClient,
    deleteClient,
  };
}
