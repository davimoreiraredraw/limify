"use client";

import { useState, useEffect, useRef } from "react";
import { Client } from "@/app/(dashboard)/dashboard/orcamentos/types";
import { useClients } from "@/app/hooks/useClients";

interface BudgetFormFirstStepProps {
  clientName: string;
  setClientName: (name: string) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
  selectedClientOption: "existing" | "later" | null;
  setSelectedClientOption: (option: "existing" | "later" | null) => void;
  clientId: string | null;
  setClientId: (id: string | null) => void;
}

export default function BudgetFormFirstStep({
  clientName,
  setClientName,
  projectName,
  setProjectName,
  projectDescription,
  setProjectDescription,
  selectedClientOption,
  setSelectedClientOption,
  clientId,
  setClientId,
}: BudgetFormFirstStepProps) {
  const { clients, fetchClients, createClient } = useClients();
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (clientSearch.length === 0) {
      setFilteredClients(clients);
    } else {
      setFilteredClients(
        clients.filter((c: Client) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase())
        )
      );
    }
  }, [clientSearch, clients]);

  const handleSelectClient = (client: Client) => {
    setClientId(client.id);
    setClientName(client.name);
    setClientSearch(client.name);
    setShowClientsModal(false);
  };

  const handleCreateClient = async (formData: any) => {
    const newClient = await createClient(formData);
    if (newClient) {
      setClientId(newClient.id);
      setClientName(newClient.name);
      setClientSearch(newClient.name);
      setShowClientsModal(false);
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <h3 className="text-xl font-semibold mb-6">
          Quem é o cliente deste orçamento?
        </h3>

        <div className="flex flex-col gap-4">
          <div
            className={`border rounded-lg p-5 cursor-pointer ${
              selectedClientOption === "existing"
                ? "bg-indigo-50 border-indigo-600"
                : "hover:border-gray-300"
            }`}
            onClick={() => setSelectedClientOption("existing")}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full border border-indigo-600 flex items-center justify-center">
                {selectedClientOption === "existing" && (
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                )}
              </div>
              <div>
                <h4 className="font-medium">Cliente existente</h4>
                <p className="text-sm text-gray-500">
                  Selecione um cliente já cadastrado
                </p>
              </div>
            </div>

            {selectedClientOption === "existing" && (
              <div className="pl-8">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    className="px-4 py-2 w-full border rounded-md text-sm"
                    placeholder="Buscar cliente..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    onClick={() => setShowClientsModal(true)}
                  />
                  {showClientsModal && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <div
                            key={client.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelectClient(client)}
                          >
                            <div className="font-medium">{client.name}</div>
                            {client.company && (
                              <div className="text-xs text-gray-500">
                                {client.company}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          Nenhum cliente encontrado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            className={`border rounded-lg p-5 cursor-pointer ${
              selectedClientOption === "later"
                ? "bg-indigo-50 border-indigo-600"
                : "hover:border-gray-300"
            }`}
            onClick={() => setSelectedClientOption("later")}
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border border-indigo-600 flex items-center justify-center">
                {selectedClientOption === "later" && (
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                )}
              </div>
              <div>
                <h4 className="font-medium">Adicionar depois</h4>
                <p className="text-sm text-gray-500">
                  Quero deixar para depois
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-6">
          Qual é o nome do projeto?
        </h3>

        <div className="border rounded-lg p-5 bg-indigo-50 border-indigo-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 rounded-full border border-indigo-600 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            </div>
            <h4 className="font-medium">Nome do projeto</h4>
          </div>

          <div className="pl-8">
            <p className="text-sm text-gray-500 mb-2">
              Nomeie para você achar depois
            </p>
            <div className="mb-4">
              <input
                type="text"
                className="px-4 py-2 w-full border rounded-md text-sm"
                placeholder="Casa do João"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Descrição do projeto</p>
              <textarea
                className="px-4 py-2 w-full border rounded-md text-sm"
                placeholder="Descrição"
                rows={3}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Caso seja necessário, descreva melhor
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
