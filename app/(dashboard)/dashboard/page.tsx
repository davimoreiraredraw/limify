"use client";

import { StatsChart } from "@/components/dashboard/stats-chart";
import { CalendarIcon, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

interface Orcamento {
  projeto: string;
  data: string;
  preco: number;
  analytics: string;
  status: string;
}

interface DashboardData {
  stats: {
    orcamentosRealizados: {
      value: number;
      percentage: number;
      trend: string;
    };
    faturamento: {
      value: number;
      percentage: number;
      trend: string;
    };
    projetosFechados: {
      value: number;
      percentage: number;
      trend: string;
    };
    gastosFixos: {
      value: number;
      percentage: number;
      trend: string;
    };
  };
  ultimosOrcamentos: Orcamento[];
}

const emptyData: DashboardData = {
  stats: {
    orcamentosRealizados: {
      value: 0,
      percentage: 0,
      trend: "up",
    },
    faturamento: {
      value: 0,
      percentage: 0,
      trend: "up",
    },
    projetosFechados: {
      value: 0,
      percentage: 0,
      trend: "up",
    },
    gastosFixos: {
      value: 0,
      percentage: 0,
      trend: "up",
    },
  },
  ultimosOrcamentos: [],
};

const mockData: DashboardData = {
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
  const [dashboardData, setDashboardData] = useState<DashboardData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function checkUserAndLoadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Pegar a data de criação do usuário e converter para objeto Date
        const userCreatedAt = new Date(user.created_at);
        const now = new Date();

        // Calcular a diferença em horas
        const hoursElapsed =
          (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60);

        // Se o usuário foi criado há menos de 1 hora, mostrar dados vazios
        if (hoursElapsed < 1) {
          setDashboardData(emptyData);
        } else {
          // Aqui você pode carregar os dados reais do usuário do Supabase
          // Por enquanto vamos usar o mockData
          setDashboardData(mockData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkUserAndLoadData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          {new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
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
                  {dashboardData.stats.orcamentosRealizados.value}
                </span>
                {dashboardData.stats.orcamentosRealizados.value > 0 && (
                  <span className="text-sm text-emerald-500">
                    ↑ {dashboardData.stats.orcamentosRealizados.percentage}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Faturamento</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-medium">
                  {formatCurrency(dashboardData.stats.faturamento.value)}
                </span>
                {dashboardData.stats.faturamento.value > 0 && (
                  <span className="text-sm text-emerald-500">
                    ↑ {dashboardData.stats.faturamento.percentage}%
                  </span>
                )}
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
                  {dashboardData.stats.projetosFechados.value}
                </span>
                {dashboardData.stats.projetosFechados.value > 0 && (
                  <span className="text-sm text-red-500">
                    ↓ {dashboardData.stats.projetosFechados.percentage}%
                  </span>
                )}
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
                    {formatCurrency(
                      dashboardData.stats.gastosFixos.value
                    ).replace("-", "")}
                  </span>
                </div>
                {dashboardData.stats.gastosFixos.value > 0 && (
                  <div className="flex items-center gap-1 text-emerald-500 text-sm">
                    <span>↑</span>
                    <span>{dashboardData.stats.gastosFixos.percentage}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Estatísticas</h2>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <StatsChart />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Últimos orçamentos</h2>
        </div>

        {dashboardData.ultimosOrcamentos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum orçamento realizado ainda.
          </div>
        ) : (
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
                {dashboardData.ultimosOrcamentos.map((orcamento, index) => (
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
        )}
      </div>
    </div>
  );
}
