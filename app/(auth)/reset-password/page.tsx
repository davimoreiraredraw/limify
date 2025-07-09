"use client";

import Image from "next/image";
import { UserResetPasswordForm } from "@/components/auth/user-reset-password-form";
import LoginLogo from "@/public/limify_login_logo.png";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Formulário */}
      <div className="w-full lg:w-[45%] p-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image
              src={LoginLogo}
              alt="Limify"
              width={150}
              height={50}
              className="h-auto w-[150px] object-contain"
            />
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Redefinir senha
            </h1>
            <p className="text-sm text-muted-foreground">
              Digite sua nova senha abaixo
            </p>
          </div>

          {/* Formulário */}
          <UserResetPasswordForm />
        </div>
      </div>

      {/* Lado direito - Banner */}
      <div className="hidden lg:block lg:w-[55%] relative">
        <Image
          src="/banner_login.png"
          alt="Banner Login"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
