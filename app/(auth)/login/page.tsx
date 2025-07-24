"use client";

import Image from "next/image";
import { UserLoginForm } from "@/components/auth/user-login-form";
import { UserRegisterForm } from "@/components/auth/user-register-form";
import { UserForgotPasswordForm } from "@/components/auth/user-forgot-password-form";
import { useState } from "react";
import LoginLogo from "@/public/limify_login_logo.png";

type FormType = "login" | "register" | "forgot-password";

export default function LoginPage() {
  const [formType, setFormType] = useState<FormType>("login");

  const formTitles = {
    login: "Faça login",
    register: (
      <>
        Crie uma conta <span className="text-primary">grátis</span> agora!
      </>
    ),
    "forgot-password": "Recuperar senha",
  };

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
              {formTitles[formType]}
            </h1>
          </div>

          {/* Formulário */}
          {formType === "login" && <UserLoginForm />}
          {formType === "register" && <UserRegisterForm />}
          {formType === "forgot-password" && <UserForgotPasswordForm />}

          {/* Links */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground text-center">
              {formType === "login" && (
                <>
                  <button
                    onClick={() => setFormType("forgot-password")}
                    className="text-primary hover:underline"
                  >
                    Esqueceu sua senha?
                  </button>
                  <p>
                    Você não tem uma conta?{" "}
                    <button
                      onClick={() => setFormType("register")}
                      className="text-primary hover:underline"
                    >
                      Criar agora
                    </button>
                  </p>
                </>
              )}
              {formType === "register" && (
                <p>
                  Você já tem conta?{" "}
                  <button
                    onClick={() => setFormType("login")}
                    className="text-primary hover:underline"
                  >
                    Faça login
                  </button>
                </p>
              )}
              {formType === "forgot-password" && (
                <p>
                  Lembrou sua senha?{" "}
                  <button
                    onClick={() => setFormType("login")}
                    className="text-primary hover:underline"
                  >
                    Voltar para o login
                  </button>
                </p>
              )}
            </div>

            {formType === "login" && (
              <>
                {/* <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      ou
                    </span>
                  </div>
                </div> */}

                {/* Botões de login social */}
                {/* <div className="flex gap-2">
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
                </div> */}
              </>
            )}
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
