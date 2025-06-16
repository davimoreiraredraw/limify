"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Client } from "@/app/(dashboard)/dashboard/orcamentos/types";
import ClientFormModal from "@/components/orcamentos/ClientFormModal";
import { useClients } from "@/lib/hooks/useClients";
import { toast } from "sonner";

interface ClientsModalProps {
  isClientModalOpen: boolean;
  setIsClientModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ClientsModal({
  isClientModalOpen,
  setIsClientModalOpen,
}: ClientsModalProps) {
  // Estados para o modal de cadastro/edição de cliente
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Hook de clientes
  const { clients, loading, error, fetchClients, deleteClient } = useClients();

  // Buscar clientes quando o componente montar (apenas uma vez)
  useEffect(
    () => {
      // Flag para controlar se o componente ainda está montado
      let isMounted = true;

      const loadClients = async () => {
        try {
          await fetchClients();
        } catch (error) {
          if (isMounted) {
            console.error("Erro ao carregar clientes:", error);
          }
        }
      };

      loadClients();

      // Cleanup function para evitar memory leaks
      return () => {
        isMounted = false;
      };
    },
    [
      /* sem dependências */
    ]
  );

  // Filtrar clientes com base no termo de busca
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para abrir o modal de cadastro de novo cliente
  const handleAddClient = () => {
    setEditingClient(null);
    setIsClientFormOpen(true);
  };

  // Função para abrir o modal de edição de cliente
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientFormOpen(true);
  };

  // Função para excluir cliente
  const handleDeleteClient = async (client: Client) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o cliente "${client.name}"?`
      )
    ) {
      try {
        await deleteClient(client.id);
        // fetchClients é chamado automaticamente pelo hook após a deleção
      } catch (error) {
        toast.error("Erro ao excluir cliente. Tente novamente.");
      }
    }
  };

  // Função para fechar o modal de formulário e atualizar a lista
  const handleCloseForm = () => {
    setIsClientFormOpen(false);
    fetchClients(); // Atualiza a lista após adicionar/editar
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Editar clientes</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsClientModalOpen(false)}
              className="rounded-full h-8 w-8"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Button>
          </div>

          <div className="p-6 flex-1 overflow-auto">
            <div className="relative mb-6">
              <input
                type="search"
                className="block w-full p-3 pl-10 text-sm border rounded-lg bg-background"
                placeholder="Buscar cliente"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                <p className="text-gray-500 text-sm">Carregando clientes</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>Erro ao carregar clientes. Tente novamente.</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum cliente encontrado</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 text-sm font-medium p-4 border-b bg-gray-50">
                  <div className="col-span-2">Foto</div>
                  <div className="col-span-4">Nome</div>
                  <div className="col-span-3 text-center">Orçamentos</div>
                  <div className="col-span-3 text-right">Ações</div>
                </div>

                <div className="divide-y">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="grid grid-cols-12 items-center p-4 hover:bg-gray-50"
                    >
                      <div className="col-span-2">
                        {client.photoUrl ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={client.photoUrl}
                              alt={client.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                            {client.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="col-span-4">
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-gray-500">
                          {client.company}
                        </div>
                        {client.email && (
                          <div className="text-xs text-gray-500">
                            {client.email}
                          </div>
                        )}
                      </div>
                      <div className="col-span-3 text-center">
                        {client.budgetsCount || 0}
                      </div>
                      <div className="col-span-3 text-right flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-indigo-600"
                          onClick={() => handleEditClient(client)}
                          title="Editar cliente"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDeleteClient(client)}
                          title="Excluir cliente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsClientModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleAddClient}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar cliente
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Cadastro/Edição de Cliente */}
      {isClientFormOpen && (
        <ClientFormModal
          isOpen={isClientFormOpen}
          onClose={handleCloseForm}
          client={editingClient}
        />
      )}
    </>
  );
}
