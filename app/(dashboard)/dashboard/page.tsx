"use client";

import { StatsChart } from "@/components/dashboard/stats-chart";
import { DatePicker } from "@/components/ui/date-picker";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

type Stats = {
  orcamentosRealizados: {
    value: number;
    percentage: number;
    trend: "up" | "down";
  };
  faturamento: {
    value: number;
    percentage: number;
    trend: "up" | "down";
  };
  projetosFechados: {
    value: number;
    percentage: number;
    trend: "up" | "down";
  };
  gastosFixos: {
    value: number;
    percentage: number;
    trend: "up" | "down";
  };
};

type Quote = {
  projeto: string;
  data: string;
  preco: number;
  analytics: "Visualizado" | "Não gerado" | "Pendente";
  status: "Completo" | "Em andamento" | "Pendente";
};

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-8 w-40 bg-gray-200 rounded-md animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-[200px] bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
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
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Buscar estatísticas com filtro de data
        const statsResponse = await fetch(
          `/api/dashboard/stats?date=${selectedDate.toISOString()}`
        );
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Buscar orçamentos com filtro de data
        const quotesResponse = await fetch(
          `/api/dashboard/quotes?date=${selectedDate.toISOString()}`
        );
        const quotesData = await quotesResponse.json();
        setQuotes(quotesData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  if (isLoading || !stats) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <DatePicker date={selectedDate} onDateChange={handleDateChange} />
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
                  {stats.orcamentosRealizados.value}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Faturamento</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-medium">
                  {formatCurrency(stats.faturamento.value)}
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
                  {stats.projetosFechados.value}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <span className="text-sm text-muted-foreground">
                Gastos fixos mensais
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-red-500">
                  <span className="text-lg">-</span>
                  <span className="text-2xl font-medium">
                    {formatCurrency(stats.gastosFixos.value).replace("-", "")}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Valor mensal recorrente
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Estatísticas</h2>
            <p className="text-sm text-muted-foreground">
              {selectedDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <StatsChart
            gastos={stats.gastosFixos.value}
            vendas={stats.faturamento.value}
            lucro={stats.faturamento.value - stats.gastosFixos.value}
          />
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
              {quotes.map((orcamento, index) => (
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
                          : orcamento.status === "Em andamento"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"
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
