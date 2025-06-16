import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userPlansTable } from "@/lib/db/schema";

export interface UserPlanInfo {
  id: string;
  planType: "free" | "basic" | "expert" | "business";
  status: string;
  maxBudgets: number;
  maxUsers: number;
  maxClients: number;
  maxProducts?: number;
  error: string | null;
}

// Planos padrão
export const DEFAULT_PLANS = {
  free: {
    maxBudgets: 5,
    maxUsers: 2,
    maxClients: 10,
    maxProducts: 20,
  },
  basic: {
    maxBudgets: 20,
    maxUsers: 5,
    maxClients: 50,
    maxProducts: 100,
  },
  expert: {
    maxBudgets: 50,
    maxUsers: 10,
    maxClients: 100,
    maxProducts: 200,
  },
  business: {
    maxBudgets: 100,
    maxUsers: 20,
    maxClients: 200,
    maxProducts: 500,
  },
};

export function useUserPlan() {
  const [userPlan, setUserPlan] = useState<UserPlanInfo>({
    id: "",
    planType: "free",
    status: "active",
    maxBudgets: DEFAULT_PLANS.free.maxBudgets,
    maxUsers: DEFAULT_PLANS.free.maxUsers,
    maxClients: DEFAULT_PLANS.free.maxClients,
    maxProducts: DEFAULT_PLANS.free.maxProducts,
    error: null,
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserPlan = useCallback(async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("Usuário não autenticado, usando plano gratuito padrão");
        setUserPlan({
          id: "free-default",
          planType: "free",
          status: "active",
          maxBudgets: DEFAULT_PLANS.free.maxBudgets,
          maxUsers: DEFAULT_PLANS.free.maxUsers,
          maxClients: DEFAULT_PLANS.free.maxClients,
          maxProducts: DEFAULT_PLANS.free.maxProducts,
          error: null,
        });
        setIsLoading(false);
        return;
      }

      const userPlanResult = await db
        .select()
        .from(userPlansTable)
        .where(eq(userPlansTable.userId, user.id))
        .limit(1);

      if (userPlanResult.length === 0) {
        console.log("Criando plano gratuito para o usuário autenticado");
        try {
          const response = await fetch("/api/auth/create-user-plan", {
            method: "POST",
          });

          if (response.ok) {
            const newPlanResult = await db
              .select()
              .from(userPlansTable)
              .where(eq(userPlansTable.userId, user.id))
              .limit(1);

            if (newPlanResult.length > 0) {
              const plan = newPlanResult[0];
              setUserPlan({
                id: plan.id,
                planType: plan.planType,
                status: plan.status || "active",
                maxBudgets:
                  plan.quotaOrçamentos || DEFAULT_PLANS.free.maxBudgets,
                maxUsers: plan.quotaUsuários || DEFAULT_PLANS.free.maxUsers,
                maxClients: plan.quotaClientes || DEFAULT_PLANS.free.maxClients,
                maxProducts: DEFAULT_PLANS.free.maxProducts,
                error: null,
              });
              // Redirecionar para a página de planos com parâmetro de consulta
              router.push("/dashboard/planos?plan_created=true");
              return;
            }
          } else {
            // Fallback para plano gratuito padrão em caso de erro
            setUserPlan({
              id: "free-default",
              planType: "free",
              status: "active",
              maxBudgets: DEFAULT_PLANS.free.maxBudgets,
              maxUsers: DEFAULT_PLANS.free.maxUsers,
              maxClients: DEFAULT_PLANS.free.maxClients,
              maxProducts: DEFAULT_PLANS.free.maxProducts,
              error: null,
            });
          }
        } catch (error) {
          console.error("Erro ao criar plano gratuito:", error);
          // Fallback para plano gratuito padrão em caso de erro
          setUserPlan({
            id: "free-default",
            planType: "free",
            status: "active",
            maxBudgets: DEFAULT_PLANS.free.maxBudgets,
            maxUsers: DEFAULT_PLANS.free.maxUsers,
            maxClients: DEFAULT_PLANS.free.maxClients,
            maxProducts: DEFAULT_PLANS.free.maxProducts,
            error: null,
          });
        }
      } else {
        const plan = userPlanResult[0];
        const planType = plan.planType as
          | "free"
          | "basic"
          | "expert"
          | "business";

        setUserPlan({
          id: plan.id,
          planType: planType,
          status: plan.status || "active",
          maxBudgets:
            plan.quotaOrçamentos || DEFAULT_PLANS[planType].maxBudgets,
          maxUsers: plan.quotaUsuários || DEFAULT_PLANS[planType].maxUsers,
          maxClients: plan.quotaClientes || DEFAULT_PLANS[planType].maxClients,
          maxProducts: DEFAULT_PLANS[planType].maxProducts,
          error: null,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar plano do usuário:", error);
      setUserPlan({
        id: "error",
        planType: "free",
        status: "error",
        maxBudgets: DEFAULT_PLANS.free.maxBudgets,
        maxUsers: DEFAULT_PLANS.free.maxUsers,
        maxClients: DEFAULT_PLANS.free.maxClients,
        maxProducts: DEFAULT_PLANS.free.maxProducts,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserPlan();
  }, [fetchUserPlan]);

  // Função para atualizar o plano manualmente
  const refreshUserPlan = useCallback(() => {
    fetchUserPlan();
  }, [fetchUserPlan]);

  /**
   * Verifica se o usuário ainda tem cota disponível para um determinado recurso
   */
  const hasQuotaFor = (
    resourceType: "orçamentos" | "alterações" | "usuários" | "clientes",
    currentUsage: number
  ) => {
    const quotas = {
      orçamentos: userPlan.maxBudgets,
      alterações: userPlan.maxUsers,
      usuários: userPlan.maxUsers,
      clientes: userPlan.maxClients,
    };

    const quota = quotas[resourceType];

    // Se a cota for null, significa ilimitado
    if (quota === null) return true;

    // Caso contrário, verifica se o uso atual é menor que a cota
    return currentUsage < quota;
  };

  /**
   * Retorna o número máximo permitido para um determinado recurso
   */
  const getMaxQuota = (
    resourceType: "orçamentos" | "alterações" | "usuários" | "clientes"
  ) => {
    const quotas = {
      orçamentos: userPlan.maxBudgets,
      alterações: userPlan.maxUsers,
      usuários: userPlan.maxUsers,
      clientes: userPlan.maxClients,
    };

    return quotas[resourceType];
  };

  /**
   * Retorna uma mensagem amigável sobre o limite do plano
   */
  const getPlanLimitMessage = (
    resourceType: "orçamentos" | "alterações" | "usuários" | "clientes"
  ) => {
    const quota = getMaxQuota(resourceType);

    if (quota === null)
      return `Seu plano ${userPlan.planType} tem ${resourceType} ilimitados`;

    return `Seu plano ${userPlan.planType} permite até ${quota} ${resourceType}`;
  };

  /**
   * Verifica se o plano do usuário tem acesso a um determinado recurso
   */
  const canAccessFeature = (featureName: string) => {
    // Todos os planos têm acesso a funções básicas
    const basicFeatures = ["dashboard", "clients", "budgets"];
    if (basicFeatures.includes(featureName)) return true;

    // Recursos por plano
    const featuresByPlan: Record<string, string[]> = {
      free: [], // O plano gratuito só tem acesso às funções básicas
      basic: ["reports"], // Básico tem acesso à relatórios básicos
      expert: ["reports", "analytics", "ai"], // Expert tem acesso a analytics e IA
      business: ["reports", "analytics", "ai", "customization"], // Business tem tudo
    };

    // Verifica se o plano atual tem acesso ao recurso
    return featuresByPlan[userPlan.planType]?.includes(featureName) || false;
  };

  // Verificar se o usuário atingiu o limite para um determinado recurso
  const checkResourceLimit = useCallback(
    (
      resourceType: "orçamentos" | "usuários" | "clientes" | "produtos",
      currentUsage: number
    ) => {
      if (!userPlan) return { isLimit: false, maxQuota: 0 };

      const quotas = {
        orçamentos: userPlan.maxBudgets,
        usuários: userPlan.maxUsers,
        clientes: userPlan.maxClients,
        produtos: userPlan.maxProducts || 0,
      };

      const maxQuota = quotas[resourceType];
      // Se maxQuota for null, significa que é ilimitado
      const isLimit = maxQuota !== null && currentUsage >= maxQuota;

      return { isLimit, maxQuota: maxQuota || 0 };
    },
    [userPlan]
  );

  // Verificar se o usuário tem acesso a um recurso baseado no plano
  const hasAccessTo = useCallback(
    (resourceType: "orçamentos" | "usuários" | "clientes" | "produtos") => {
      if (!userPlan) return false;

      const quotas = {
        orçamentos: userPlan.maxBudgets,
        usuários: userPlan.maxUsers,
        clientes: userPlan.maxClients,
        produtos: userPlan.maxProducts || 0,
      };

      // Se a quota for null, significa acesso ilimitado
      // Se for 0, significa sem acesso
      return quotas[resourceType] !== 0;
    },
    [userPlan]
  );

  return {
    ...userPlan,
    hasQuotaFor,
    getMaxQuota,
    getPlanLimitMessage,
    canAccessFeature,
    isPlanActive: userPlan.status === "active",
    isUnlimited: (
      resource: "orçamentos" | "alterações" | "usuários" | "clientes"
    ) => {
      return getMaxQuota(resource) === null;
    },
    checkResourceLimit,
    hasAccessTo,
    isLoading,
    refreshUserPlan,
  };
}
