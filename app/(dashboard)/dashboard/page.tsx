"use client";

import { StatsChart } from "@/components/dashboard/stats-chart";
import { CalendarIcon, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockData = {
  stats: {
    orcamentosRealizados: {
      value: 15,
      percentage: 5.39,
      trend: "up",
    },
    faturamento: {
      value: 10000,
      percentage: 2.29,
      trend: "up",
    },
    projetosFechados: {
      value: 9,
      percentage: 0.65,
      trend: "down",
    },
    gastosFixos: {
      value: 2000,
      percentage: 2.29,
      trend: "up",
    },
  },
  ultimosOrcamentos: [
    {
      projeto: "Casa do Sergio",
      data: "02/08/2023",
      preco: 473.18,
      analytics: "Visualizado",
      status: "Completo",
    },
    {
      projeto: "Varanda da Juana",
      data: "01/09/2023",
      preco: 473.18,
      analytics: "Não gerado",
      status: "Incompleto",
    },
    {
      projeto: "Render cozinha",
      data: "15/12/2023",
      preco: 473.18,
      analytics: "Visualizado",
      status: "Completo",
    },
    {
      projeto: "É só uma imagem",
      data: "15/12/2023",
      preco: 142.8,
      analytics: "Pendente",
      status: "Pendente",
    },
    {
      projeto: "Render fácil",
      data: "15/12/2023",
      preco: 117.25,
      analytics: "Visualizado",
      status: "Completo",
    },
  ],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          09 Feb 2024
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">
                Orçamentos realizados
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-medium">
                  {mockData.stats.orcamentosRealizados.value}
                </span>
                <span className="text-sm text-emerald-500">
                  ↑ {mockData.stats.orcamentosRealizados.percentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Faturamento</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-medium">
                  {formatCurrency(mockData.stats.faturamento.value)}
                </span>
                <span className="text-sm text-emerald-500">
                  ↑ {mockData.stats.faturamento.percentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">
                Projetos fechados
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-medium">
                  {mockData.stats.projetosFechados.value}
                </span>
                <span className="text-sm text-red-500">
                  ↓ {mockData.stats.projetosFechados.percentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <span className="text-sm text-muted-foreground">
                Gastos fixos
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-red-500">
                  <span className="text-lg">-</span>
                  <span className="text-2xl font-medium">
                    {formatCurrency(mockData.stats.gastosFixos.value).replace(
                      "-",
                      ""
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-sm">
                  <span>↑</span>
                  <span>{mockData.stats.gastosFixos.percentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Estatísticas</h2>
            <p className="text-sm text-muted-foreground">Fevereiro, 2025</p>
          </div>

          <StatsChart />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Últimos orçamentos</h2>
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Projeto</th>
                <th className="px-4 py-3 text-left font-medium">Data</th>
                <th className="px-4 py-3 text-left font-medium">Preço</th>
                <th className="px-4 py-3 text-left font-medium">Analytics</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockData.ultimosOrcamentos.map((orcamento, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    {orcamento.projeto}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {orcamento.data}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatCurrency(orcamento.preco)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {orcamento.analytics === "Visualizado" && (
                      <span className="flex items-center gap-2 text-emerald-500">
                        <CheckCircle2 className="h-4 w-4" />
                        Visualizado
                      </span>
                    )}
                    {orcamento.analytics === "Não gerado" && (
                      <span className="flex items-center gap-2 text-red-500">
                        <XCircle className="h-4 w-4" />
                        Não gerado
                      </span>
                    )}
                    {orcamento.analytics === "Pendente" && (
                      <span className="flex items-center gap-2 text-amber-500">
                        <Clock className="h-4 w-4" />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        orcamento.status === "Completo"
                          ? "bg-emerald-50 text-emerald-600"
                          : orcamento.status === "Incompleto"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {orcamento.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
