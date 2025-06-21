"use client";

import { Bell, User, LogOut, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "@/lib/hooks/use-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const { toggle, isCollapsed } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="shadow-sm border border-input"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <Link href="/" className="flex items-center">
          <Image
            src="/short_logo.png"
            alt="Limify"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      <div className="hidden lg:block">
        <h1 className="text-lg font-medium">Eai Limifier!</h1>
        <p className="text-sm text-muted-foreground">O que vamos orçar hoje?</p>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <Link href="/dashboard/orcamentos?new=true">
          <Button variant="default" className="hidden sm:flex">
            + Novo orçamento
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="relative shadow-sm border border-input"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 overflow-hidden"
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user?.name || ""}
                  width={36}
                  height={36}
                  className="rounded-full hover:opacity-80 transition-opacity"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {user?.name?.[0] || "U"}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user?.name || ""}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium truncate max-w-[180px]">
                  {user?.name || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {user?.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <Link href="/dashboard/perfil" passHref>
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/configuracoes" passHref>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
