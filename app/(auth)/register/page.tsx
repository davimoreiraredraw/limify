import { UserRegisterForm } from "@/components/auth/user-register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro",
  description: "Crie sua conta agora mesmo",
};

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { invite?: string };
}) {
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
              {searchParams.invite
                ? "Complete seu cadastro"
                : "Crie sua conta agora"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {searchParams.invite
                ? "Você foi convidado para participar de uma equipe"
                : "Preencha os dados abaixo para criar sua conta"}
            </p>
          </div>
          <UserRegisterForm inviteId={searchParams.invite} />
        </div>
      </div>
    </div>
  );
}
