"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserPlan } from "@/lib/hooks/useUserPlan";
import { useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const BASIC_PRICE_ID = process.env.NEXT_PUBLIC_BASIC_PLAN_ID || "";
const EXPERT_PRICE_ID = process.env.NEXT_PUBLIC_EXPERT_PLAN_ID || "";
const BUSINESS_PRICE_ID = process.env.NEXT_PUBLIC_BUSINESS_PLAN_ID || "";

const handleSubscribe = async (
  priceId: string,
  setLoading: (loading: boolean) => void
) => {
  try {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      toast({
        title: "Erro ao processar pagamento",
        description: data.error || "Não foi possível iniciar o checkout",
        variant: "destructive",
      });
      setLoading(false);
    }
  } catch (error) {
    console.error("Erro ao processar checkout:", error);
    toast({
      title: "Erro ao processar pagamento",
      description: "Ocorreu um erro ao tentar iniciar o checkout",
      variant: "destructive",
    });
    setLoading(false);
  }
};

export default function PlanosPage() {
  const [tab, setTab] = useState("planos");
  const [period, setPeriod] = useState<"mensal" | "anual">("mensal");
  const [loadingBasic, setLoadingBasic] = useState(false);
  const [loadingExpert, setLoadingExpert] = useState(false);
  const [loadingBusiness, setLoadingBusiness] = useState(false);
  const searchParams = useSearchParams();
  const { planType, status, maxBudgets, isLoading } = useUserPlan();
  const isPlanActive = status === "active";

  // Verificar se o usuário voltou de um checkout com sucesso
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const planCreated = searchParams.get("plan_created");

    if (success === "true") {
      toast({
        title: "Assinatura realizada com sucesso!",
        description: "Seu plano foi atualizado. Aproveite os novos recursos!",
        variant: "default",
      });
    } else if (canceled === "true") {
      toast({
        title: "Assinatura cancelada",
        description: "Você cancelou o processo de assinatura.",
        variant: "destructive",
      });
    } else if (planCreated === "true") {
      toast({
        title: "Plano gratuito ativado!",
        description: "Seu plano gratuito foi ativado com sucesso.",
        variant: "default",
      });
    }
  }, [searchParams]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Equipe com acesso</h1>
      {/* Abas */}
      <div className="flex gap-6 border-b mb-6">
        <button
          className={`px-2 pb-2 text-base font-medium border-b-2 transition-colors ${
            tab === "planos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
          onClick={() => setTab("planos")}
        >
          Planos
        </button>
        <button
          className={`px-2 pb-2 text-base font-medium border-b-2 transition-colors ${
            tab === "pagamentos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
          onClick={() => setTab("pagamentos")}
        >
          Pagamentos e comprovantes
        </button>
      </div>

      {tab === "planos" && (
        <>
          {/* Card do plano atual */}
          <div className="border-2 border-primary rounded-xl p-6 flex items-center gap-8 mb-10 bg-white">
            <div className="flex-1 flex items-center gap-6">
              <div className="flex flex-col">
                <div className="bg-black rounded-lg px-8 py-6 flex flex-col justify-center min-w-[180px] min-h-[80px]">
                  <span className="text-white text-3xl font-bold">
                    {planType === "free"
                      ? "Grátis"
                      : planType === "basic"
                      ? "Basic"
                      : planType === "expert"
                      ? "Expert"
                      : "Business"}
                  </span>
                  <span className="text-white/80 text-sm mt-2">Sobre</span>
                  <span className="text-white/80 text-xs mt-1">
                    •{" "}
                    {maxBudgets === null
                      ? "Orçamentos ilimitados"
                      : `${maxBudgets} orçamento${maxBudgets !== 1 ? "s" : ""}`}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-8">
                  <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                      ${
                        isPlanActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isPlanActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Planos pagos */}
          <div className="mb-2">
            <h2 className="text-xl font-semibold">Planos pagos</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Confira os planos pagos e compare o melhor para você
            </p>
          </div>

          {/* Alternância mensal/anual */}
          <div className="flex gap-2 mb-8">
            <Button
              variant={period === "mensal" ? "default" : "outline"}
              className={`rounded-full px-6 font-semibold ${
                period === "mensal"
                  ? "bg-primary text-white"
                  : "bg-white text-primary border-primary"
              }`}
              onClick={() => setPeriod("mensal")}
            >
              Mensal
            </Button>
            <Button
              variant={period === "anual" ? "default" : "outline"}
              className={`rounded-full px-6 font-semibold ${
                period === "anual"
                  ? "bg-primary text-white"
                  : "bg-white text-primary border-primary"
              }`}
              onClick={() => setPeriod("anual")}
            >
              Anual
            </Button>
          </div>

          {/* Cards dos planos */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
            {/* Grátis */}
            <div className="flex-1 bg-white rounded-xl border p-8 flex flex-col items-center shadow-sm">
              <div className="text-xl font-bold mb-1">Grátis</div>
              <div className="text-muted-foreground mb-4">
                Ideal para começar
              </div>
              <div className="text-3xl font-bold mb-1">
                R$0<span className="text-base font-normal">/mês</span>
              </div>
              <ul className="text-sm text-left mb-6 mt-2 space-y-2">
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>1 orçamento limitado
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>Sem alterações
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>1 Usuário
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>2 clientes cadastrados
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>Portifólio padrão
                </li>
                <li className="flex items-center gap-2 text-gray-400 line-through">
                  <span>✘</span>Relatórios avançados
                </li>
                <li className="flex items-center gap-2 text-gray-400 line-through">
                  <span>✘</span>Insights por IA
                </li>
              </ul>
              <Button
                className="w-full bg-primary text-white rounded-md font-semibold opacity-60 cursor-not-allowed"
                disabled
              >
                Seu plano
              </Button>
            </div>
            {/* Básico */}
            <div className="flex-1 bg-white rounded-xl border p-8 flex flex-col items-center shadow-sm">
              <div className="text-xl font-bold mb-1">Basic</div>
              <div className="text-muted-foreground mb-4">
                Para quem está começando
              </div>
              <div className="text-3xl font-bold mb-1">
                R$67<span className="text-base font-normal">/mês</span>
              </div>
              <ul className="text-sm text-left mb-6 mt-2 space-y-2">
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>10 orçamentos/mês
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>4 alterações por orçamento
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>2 Usuários
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>10 clientes cadastrados
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>2 modelos de portifólio
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>Relatórios avançados
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>10 tokens Insights por IA
                </li>
              </ul>
              <Button
                className="w-full bg-primary text-white rounded-md font-semibold"
                onClick={() => handleSubscribe(BASIC_PRICE_ID, setLoadingBasic)}
                disabled={loadingBasic || planType === "basic"}
              >
                {loadingBasic ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : planType === "basic" ? (
                  "Seu plano atual"
                ) : (
                  "Assinar"
                )}
              </Button>
            </div>
            {/* Expert (recomendado) */}
            <div className="flex-1 bg-white rounded-xl border-2 border-primary p-8 flex flex-col items-center shadow-lg scale-105 relative z-10">
              <div className="absolute -top-4 right-4 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                Recomendado
              </div>
              <div className="text-xl font-bold mb-1 text-primary">Expert</div>
              <div className="text-muted-foreground mb-4">
                Para equipes pequenas
              </div>
              <div className="text-3xl font-bold mb-1">
                R$147<span className="text-base font-normal">/mês</span>
              </div>
              <ul className="text-sm text-left mb-6 mt-2 space-y-2">
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>30 orçamentos/mês
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>Alterações ilimitadas
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>3 Usuários
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>50 clientes cadastrados
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>4 modelos de portifólio
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>Relatórios avançados
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>50 tokens Insights por IA
                </li>
              </ul>
              <Button
                className="w-full bg-primary text-white rounded-md font-semibold"
                onClick={() =>
                  handleSubscribe(EXPERT_PRICE_ID, setLoadingExpert)
                }
                disabled={loadingExpert || planType === "expert"}
              >
                {loadingExpert ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : planType === "expert" ? (
                  "Seu plano atual"
                ) : (
                  "Assinar"
                )}
              </Button>
            </div>
            {/* Business */}
            <div className="flex-1 bg-white rounded-xl border p-8 flex flex-col items-center shadow-sm">
              <div className="text-xl font-bold mb-1">Business</div>
              <div className="text-muted-foreground mb-4">
                Para organizações
              </div>
              <div className="text-3xl font-bold mb-1">
                R$470<span className="text-base font-normal">/mês</span>
              </div>
              <ul className="text-sm text-left mb-6 mt-2 space-y-2">
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>Orçamentos ilimitados
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>Alterações ilimitadas
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>10 Usuários
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>Clientes ilimitados
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>Portifólio editável
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>Relatórios avançados
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <span>✔</span>200 tokens Insights por IA
                </li>
              </ul>
              <Button
                className="w-full bg-primary text-white rounded-md font-semibold"
                onClick={() =>
                  handleSubscribe(BUSINESS_PRICE_ID, setLoadingBusiness)
                }
                disabled={loadingBusiness || planType === "business"}
              >
                {loadingBusiness ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : planType === "business" ? (
                  "Seu plano atual"
                ) : (
                  "Assinar"
                )}
              </Button>
            </div>
          </div>
        </>
      )}
      {tab === "pagamentos" && (
        <div className="text-center text-muted-foreground py-20 text-lg">
          Em breve: histórico de pagamentos e comprovantes.
        </div>
      )}
    </div>
  );
}
