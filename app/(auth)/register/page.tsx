import { Metadata } from "next";
import Link from "next/link";
import { UserRegisterForm } from "@/components/auth/user-register-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta para começar",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Criar uma conta
        </h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados abaixo para criar sua conta
        </p>
      </div>
      <UserRegisterForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="hover:text-brand underline underline-offset-4"
        >
          Já tem uma conta? Entre aqui
        </Link>
      </p>
    </div>
  );
}
