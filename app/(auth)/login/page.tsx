"use client";

import Image from "next/image";
import { UserLoginForm } from "@/components/auth/user-login-form";
import { UserRegisterForm } from "@/components/auth/user-register-form";
import { useState } from "react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Formulário */}
      <div className="w-full lg:w-[45%] p-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Limify"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-2xl font-semibold">Limify</span>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {isLogin ? (
                "Faça login"
              ) : (
                <>
                  Crie uma conta <span className="text-primary">grátis</span>{" "}
                  agora!
                </>
              )}
            </h1>
          </div>

          {/* Formulário */}
          {isLogin ? <UserLoginForm /> : <UserRegisterForm />}

          {/* Links */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {isLogin ? (
                <>
                  Você não tem uma conta?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-primary hover:underline"
                  >
                    Criar agora
                  </button>
                </>
              ) : (
                <>
                  Você já tem conta?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-primary hover:underline"
                  >
                    Faça login
                  </button>
                </>
              )}
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            {/* Botões de login social */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-accent">
                <Image
                  src="/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-accent">
                <Image
                  src="/facebook.svg"
                  alt="Facebook"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-accent">
                <Image
                  src="/github.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>
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
