"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TeamMember {
  id?: string;
  name: string;
  email: string;
  photoUrl?: string;
  roles: ("Owner" | "Admin" | "Member")[];
}

interface TeamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: TeamMember | null;
}

const ROLES = [
  { id: "owner", label: "Dono", value: "Owner" },
  { id: "admin", label: "Admin", value: "Admin" },
  { id: "member", label: "Membro", value: "Member" },
] as const;

export default function TeamFormModal({
  isOpen,
  onClose,
  member,
}: TeamFormModalProps) {
  const [photo, setPhoto] = useState<string | null>(member?.photoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para os campos do formulário
  const [name, setName] = useState(member?.name || "");
  const [email, setEmail] = useState(member?.email || "");
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(
    new Set(member?.roles || [])
  );

  // Estado para controlar o carregamento
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }

    if (!email.trim()) {
      toast.error("O email é obrigatório");
      return;
    }

    if (selectedRoles.size === 0) {
      toast.error("Selecione pelo menos um cargo");
      return;
    }

    setIsSubmitting(true);

    try {
      const memberData = {
        name,
        email,
        photoUrl: photo,
        roles: Array.from(selectedRoles) as ("Owner" | "Admin" | "Member")[],
      };

      // TODO: Implementar a lógica de salvar
      console.log("Dados do membro:", memberData);

      toast.success(
        member
          ? "Membro atualizado com sucesso!"
          : "Membro adicionado com sucesso!"
      );
      onClose();
    } catch (error) {
      console.error("Erro ao salvar membro:", error);
      toast.error("Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para lidar com a seleção de imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  // Função para alternar a seleção de cargo
  const toggleRole = (role: string) => {
    const newRoles = new Set(selectedRoles);
    if (newRoles.has(role)) {
      newRoles.delete(role);
    } else {
      newRoles.add(role);
    }
    setSelectedRoles(newRoles);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-auto flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {member ? "Editar membro" : "Crie ou edite membros da equipe"}
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
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Cargo</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedRoles.has(role.value)
                      ? "bg-[#6E2DFA] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => toggleRole(role.value)}
                  disabled={isSubmitting}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            className="bg-[#6E2DFA] hover:bg-[#6E2DFA]/90 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
