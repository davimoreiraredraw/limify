"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Pencil2Icon, UploadIcon } from "@radix-ui/react-icons";

export default function PortfolioPage() {
  const [tab, setTab] = useState("marca");
  const [logoBgWhite, setLogoBgWhite] = useState(true);

  // Switch customizado
  function SwitchCustom({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
  }) {
    return (
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          checked ? "bg-primary" : "bg-muted"
        }`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <span className="sr-only">Alternar fundo</span>
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-6">Ajustes do portfólio</h1>
      <Tabs value={tab} onValueChange={setTab} className="mb-8">
        <TabsList className="bg-muted p-1 rounded-lg flex gap-2 w-fit">
          <TabsTrigger
            value="marca"
            className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-md"
          >
            Marca
          </TabsTrigger>
          <TabsTrigger value="projetos" className="px-4 py-2 rounded-md">
            Projetos
          </TabsTrigger>
          <TabsTrigger value="depoimentos" className="px-4 py-2 rounded-md">
            Depoimentos
          </TabsTrigger>
          <TabsTrigger value="apresentacao" className="px-4 py-2 rounded-md">
            Apresentação
          </TabsTrigger>
          <TabsTrigger value="outros" className="px-4 py-2 rounded-md">
            Outros
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Perfil do escritório */}
      <section className="bg-white rounded-xl p-6 mb-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-base">
            Seu perfil ou perfil do escritório
          </span>
          <Button variant="ghost" size="icon">
            <Pencil2Icon className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/40 rounded-lg w-32 h-32 cursor-pointer bg-muted">
            <UploadIcon className="w-8 h-8 text-primary mb-2" />
            <span className="text-xs text-muted-foreground text-center">
              Arraste ou clique para buscar
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="font-semibold text-lg">Anna Jones</span>
            <span className="text-sm text-muted-foreground">Arquiteta</span>
            <span className="font-semibold text-sm mt-2">Sobre</span>
            <span className="text-sm text-muted-foreground">
              Ullamco veniam culpa excepteur id duis aliquip enim esse veniam.
            </span>
          </div>
        </div>
      </section>

      {/* Logo */}
      <section className="bg-white rounded-xl p-6 mb-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-base">Logo</span>
          <Button variant="ghost" size="icon">
            <Pencil2Icon className="w-5 h-5" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground mb-2">
          Adicione sua logo para o fundo branco e preto
        </span>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/40 rounded-lg w-32 h-32 cursor-pointer bg-muted">
            <UploadIcon className="w-8 h-8 text-primary mb-2" />
            <span className="text-xs text-muted-foreground text-center">
              Arraste ou clique para buscar
            </span>
          </div>
          <div className="flex gap-2 items-center ml-4">
            <SwitchCustom checked={logoBgWhite} onChange={setLogoBgWhite} />
            <div
              className={`w-16 h-12 rounded-lg border flex items-center justify-center ${
                logoBgWhite ? "bg-white" : "bg-black"
              }`}
            >
              {/* Imagem da logo preview */}
              <span className="text-xs text-muted-foreground">
                {logoBgWhite ? "Branco" : "Preto"}
              </span>
            </div>
            <div
              className={`w-16 h-12 rounded-lg border flex items-center justify-center ${
                !logoBgWhite ? "bg-white" : "bg-black"
              }`}
            >
              {/* Imagem da logo preview */}
              <span className="text-xs text-muted-foreground">
                {!logoBgWhite ? "Branco" : "Preto"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <section className="bg-white rounded-xl p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-base">Rodapé</span>
          <Button variant="ghost" size="icon">
            <Pencil2Icon className="w-5 h-5" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground mb-2">
          Informações do rodapé
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            disabled
            placeholder="Nome completo do cliente"
            className="bg-muted"
          />
          <Input
            disabled
            placeholder="Telefone do cliente"
            className="bg-muted"
          />
          <Input disabled placeholder="999.999.999-99" className="bg-muted" />
          <Input disabled placeholder="Link" className="bg-muted" />
        </div>
      </section>
    </div>
  );
}
