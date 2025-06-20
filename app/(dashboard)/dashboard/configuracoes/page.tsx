"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

export default function ConfiguracoesPage() {
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "Alexandre Silva",
    email: "alexandre@email.com",
    phone: "(11) 99999-9999",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implementar a lógica de alterar senha
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulando uma requisição
      toast.success("Senha alterada com sucesso!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Erro ao alterar senha");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileForm.name || !profileForm.email) {
      toast.error("Nome e email são obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implementar a lógica de atualizar perfil
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulando uma requisição
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium text-gray-900 mb-6">Configurações</h1>

      <div className="grid grid-cols-1 gap-6">
        {/* Seção de Perfil */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Informações do Perfil
          </h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome completo
              </label>
              <input
                type="text"
                id="name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full p-3 text-sm border rounded-md bg-background"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full p-3 text-sm border rounded-md bg-background"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full p-3 text-sm border rounded-md bg-background"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#6E2DFA] hover:bg-[#6E2DFA]/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </div>

        {/* Seção de Senha */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Alterar Senha
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha atual
              </label>
              <input
                type="password"
                id="currentPassword"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="w-full p-3 text-sm border rounded-md bg-background"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nova senha
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="w-full p-3 text-sm border rounded-md bg-background"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmar nova senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full p-3 text-sm border rounded-md bg-background"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#6E2DFA] hover:bg-[#6E2DFA]/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Alterando..." : "Alterar senha"}
              </Button>
            </div>
          </form>
        </div>

        {/* Seção de Preferências */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Preferências
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Notificações por email
                </h3>
                <p className="text-sm text-gray-500">
                  Receba atualizações sobre suas atividades
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6E2DFA]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6E2DFA]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Notificações push
                </h3>
                <p className="text-sm text-gray-500">
                  Receba notificações no navegador
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6E2DFA]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6E2DFA]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
