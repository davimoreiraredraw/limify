"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function useAuth() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Buscar usuário atual
    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Atualizar diretamente com os dados do usuário da sessão
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || "",
            user_type: session.user.user_metadata?.user_type || "client",
            image:
              session.user.user_metadata?.image ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${
                session.user.user_metadata?.name || session.user.email
              }`,
            onboarding_completed:
              session.user.user_metadata?.onboarding_completed || false,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };

    getUser();

    // Configurar listener para mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Atualizar diretamente com os dados do usuário da sessão
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || "",
          user_type: session.user.user_metadata?.user_type || "client",
          image:
            session.user.user_metadata?.image ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${
              session.user.user_metadata?.name || session.user.email
            }`,
          onboarding_completed:
            session.user.user_metadata?.onboarding_completed || false,
        });
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function signIn(email: string, password: string) {
    try {
      console.log("signIn", email, password);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("data", data);
      if (error) {
        throw error;
      }

      if (!data?.user) {
        throw new Error("Usuário não encontrado");
      }

      // Usar diretamente os dados do usuário autenticado
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || "",
        user_type: data.user.user_metadata?.user_type || "client",
        image:
          data.user.user_metadata?.image ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${
            data.user.user_metadata?.name || data.user.email
          }`,
        onboarding_completed:
          data.user.user_metadata?.onboarding_completed || false,
      });

      toast.success("Login realizado com sucesso!");

      // Verificar se o usuário já completou o onboarding
      if (!data.user.user_metadata?.onboarding_completed) {
        // Redirecionar para a página de onboarding
        router.push("/onboarding?type=email");
      } else {
        // Forçar navegação para o dashboard
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      console.error("Erro completo:", error);
      toast.error("Erro ao fazer login", {
        description: error?.message || "Tente novamente mais tarde",
      });
      throw error;
    }
  }

  async function signUp(
    email: string,
    password: string,
    name: string,
    userType: "client" | "professional"
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            user_type: userType,
            onboarding_completed: false,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.user?.id) {
        throw new Error("Erro ao criar usuário");
      }

      // O perfil será criado automaticamente pelo trigger do Supabase
      toast.success("Conta criada com sucesso!", {
        description: "Verifique seu email para confirmar sua conta.",
      });

      router.push("/login");
    } catch (error: any) {
      toast.error("Erro ao criar conta", {
        description: error?.message || "Tente novamente mais tarde",
      });
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      setUser(null);
      window.location.href = "/login";
    } catch (error: any) {
      toast.error("Erro ao sair", {
        description: error?.message || "Tente novamente mais tarde",
      });
    }
  }

  return {
    user,
    signIn,
    signUp,
    signOut,
  };
}
