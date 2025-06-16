import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PlanLimitWarningProps {
  resourceType: "orçamentos" | "usuários" | "clientes" | "produtos";
  currentUsage: number;
  maxQuota: number | null;
  planType: string;
  isLimit: boolean;
  className?: string;
}

export function PlanLimitWarning({
  resourceType,
  currentUsage,
  maxQuota,
  planType,
  isLimit,
  className,
}: PlanLimitWarningProps) {
  // Mapear o tipo de recurso para um nome mais amigável
  const resourceNames = {
    orçamentos: "orçamentos",
    usuários: "usuários",
    clientes: "clientes",
    produtos: "produtos",
  };

  const resourceName = resourceNames[resourceType];

  // Determinar a mensagem com base no limite
  const getMessage = () => {
    if (isLimit) {
      return `Você atingiu o limite de ${maxQuota} ${resourceName} do seu plano ${planType.toUpperCase()}.`;
    }
    return `Você está utilizando ${currentUsage} de ${
      maxQuota === null ? "ilimitado" : maxQuota
    } ${resourceName} disponíveis no seu plano ${planType.toUpperCase()}.`;
  };

  return (
    <Card
      className={cn(
        "mb-4 border",
        isLimit
          ? "border-destructive/50 bg-destructive/10"
          : "border-muted bg-muted/50",
        className
      )}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {isLimit ? (
            <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />
          ) : (
            <InfoCircledIcon className="h-5 w-5 text-muted-foreground" />
          )}
          <p
            className={cn(
              "text-sm",
              isLimit ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {getMessage()}
          </p>
        </div>
        {isLimit && (
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/planos">Atualizar plano</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Exemplo de uso:
// <PlanLimitWarning resourceType="orçamentos" currentUsage={9} maxQuota={10} planType="Basic" isLimit={false} />
// <PlanLimitWarning resourceType="orçamentos" currentUsage={10} maxQuota={10} planType="Basic" isLimit={true} />
