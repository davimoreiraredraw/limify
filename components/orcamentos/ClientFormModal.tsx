"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Client } from "@/app/(dashboard)/dashboard/orcamentos/types";
import { toast } from "sonner";
import { useClients } from "@/lib/hooks/useClients";

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function ClientFormModal({
  isOpen,
  onClose,
  client,
}: ClientFormModalProps) {
  const [photo, setPhoto] = useState<string | null>(client?.photoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para os campos com máscara
  const [phone, setPhone] = useState(client?.phone || "");
  const [document, setDocument] = useState(client?.document || "");

  // Estados para os demais campos do formulário
  const [name, setName] = useState(client?.name || "");
  const [email, setEmail] = useState(client?.email || "");
  const [company, setCompany] = useState(client?.company || "");
  const [additionalInfo, setAdditionalInfo] = useState(
    client?.additionalInfo || ""
  );

  // Estado para controlar o carregamento
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook de clientes
  const { createClient, updateClient } = useClients();

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("O nome do cliente é obrigatório");
      return;
    }

    setIsSubmitting(true);

    try {
      const clientData = {
        name,
        company: company || undefined,
        email: email || undefined,
        phone: phone || undefined,
        document: document || undefined,
        additionalInfo: additionalInfo || undefined,
        photoUrl: photo || undefined,
      };

      let result;

      if (client) {
        // Atualizar cliente existente
        result = await updateClient(client.id, clientData);
      } else {
        // Criar novo cliente
        result = await createClient(clientData);
      }

      if (result) {
        toast.success(
          client
            ? "Cliente atualizado com sucesso!"
            : "Cliente criado com sucesso!"
        );
        onClose();
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast.error("Ocorreu um erro ao salvar o cliente. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para lidar com a seleção de imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar o tamanho do arquivo (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("A imagem não pode ser maior que 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para remover a foto
  const handleRemovePhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Função para aplicar máscara ao telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos

    if (value.length > 11) {
      value = value.slice(0, 11); // Limita a 11 dígitos (com DDD)
    }

    // Aplica a máscara
    if (value.length > 0) {
      // Se tiver mais de 6 dígitos, formato: (99) 99999-9999
      if (value.length > 6) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      }
      // Se tiver até 6 dígitos, formato: (99) 9999
      else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      }
      // Se tiver até 2 dígitos, formato: (9
      else {
        value = `(${value}`;
      }
    }

    setPhone(value);
  };

  // Função para aplicar máscara ao CPF/CNPJ
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos

    // Se o valor tiver mais de 11 dígitos, é CNPJ
    if (value.length > 11) {
      value = value.slice(0, 14); // Limita a 14 dígitos para CNPJ

      // Aplica a máscara de CNPJ: 99.999.999/9999-99
      if (value.length > 0) {
        value = value.replace(/^(\d{2})(\d)/, "$1.$2");
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
        value = value.replace(/(\d{4})(\d)/, "$1-$2");
      }
    } else {
      value = value.slice(0, 11); // Limita a 11 dígitos para CPF

      // Aplica a máscara de CPF: 999.999.999-99
      if (value.length > 0) {
        value = value.replace(/^(\d{3})(\d)/, "$1.$2");
        value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
        value = value.replace(/\.(\d{3})(\d)/, ".$1-$2");
      }
    }

    setDocument(value);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-auto flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {client ? "Editar cliente" : "Crie ou edite um cliente"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8"
            disabled={isSubmitting}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Seção de foto de perfil */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Foto de perfil</label>
            <div className="flex items-start gap-4">
              <div className="w-[148px] h-[148px] rounded-md bg-purple-100 overflow-hidden flex items-center justify-center relative">
                {photo ? (
                  <img
                    src={photo}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <p className="text-sm">Envie a foto de perfil</p>
                    <p className="text-xs mt-2 text-gray-500">
                      A foto precisa ser PNG ou JPEg
                    </p>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <p className="text-sm mb-2">Envie a foto de perfil</p>
                <p className="text-xs text-gray-500 mb-4">
                  A foto precisa ser PNG ou JPEg
                </p>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="px-4 py-2 h-auto text-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    Buscar imagem
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-4 py-2 h-auto text-sm"
                    onClick={handleRemovePhoto}
                    disabled={!photo || isSubmitting}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Nome completo */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium">
              Nome completo
            </label>
            <input
              type="text"
              id="fullName"
              placeholder="Nome completo do cliente"
              className="w-full p-3 text-sm border rounded-md bg-background"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email do cliente"
              className="w-full p-3 text-sm border rounded-md bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Empresa */}
          <div className="space-y-2">
            <label htmlFor="company" className="block text-sm font-medium">
              Empresa
            </label>
            <input
              type="text"
              id="company"
              placeholder="Nome da empresa"
              className="w-full p-3 text-sm border rounded-md bg-background"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium">
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              placeholder="(99) 99999-9999"
              className="w-full p-3 text-sm border rounded-md bg-background"
              value={phone}
              onChange={handlePhoneChange}
              disabled={isSubmitting}
            />
          </div>

          {/* CPF/CNPJ */}
          <div className="space-y-2">
            <label htmlFor="document" className="block text-sm font-medium">
              CPF/CNPJ
            </label>
            <input
              type="text"
              id="document"
              placeholder="999.999.999-99"
              className="w-full p-3 text-sm border rounded-md bg-background"
              value={document}
              onChange={handleDocumentChange}
              disabled={isSubmitting}
            />
          </div>

          {/* Informações adicionais */}
          <div className="space-y-2">
            <label
              htmlFor="additionalInfo"
              className="block text-sm font-medium"
            >
              Informações adicionais
            </label>
            <textarea
              id="additionalInfo"
              placeholder="Adicione as informações do seu cliente"
              className="w-full p-3 text-sm border rounded-md bg-background min-h-[80px]"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </form>

        <div className="p-6 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar cliente"}
          </Button>
        </div>
      </div>
    </div>
  );
}
