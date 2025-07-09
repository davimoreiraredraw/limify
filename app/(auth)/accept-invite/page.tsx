"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";

const formSchema = z
  .object({
    password: z.string().min(6, {
      message: "Senha deve ter no mínimo 6 caracteres.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [invite, setInvite] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    async function fetchInvite() {
      try {
        const response = await fetch(`/api/teams/invites/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Convite inválido");
        }

        setInvite(data.invite);
      } catch (error) {
        toast.error("Erro ao carregar convite", {
          description:
            error instanceof Error
              ? error.message
              : "Tente novamente mais tarde",
        });
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      fetchInvite();
    } else {
      router.push("/login");
    }
  }, [token, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Criar usuário no Supabase
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: invite.email,
          password: values.password,
          options: {
            data: {
              name: invite.name,
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      // Aceitar o convite
      const response = await fetch("/api/teams/accept-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteId: token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao aceitar convite");
      }

      toast.success("Convite aceito com sucesso!");

      // Redirecionar para onboarding
      router.push("/onboarding?type=invite");
    } catch (error) {
      toast.error("Erro ao aceitar convite", {
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-[#6E2DFA]" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <img src="/logo.png" alt="Logo" className="h-8" />
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6E2DFA]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-[#6E2DFA]" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img src="/logo-white.svg" alt="Logo" className="h-8" />
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Complete seu cadastro
            </h1>
            <p className="text-sm text-muted-foreground">
              Você foi convidado para participar da equipe. Defina sua senha
              para continuar.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Sua senha"
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirme sua senha"
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  "Aceitar Convite"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
