"use client";

import BudgetLandingPage from "@/components/landing/PreviewBudgetLandingPage";

interface BudgetM2PreviewProps {
  budgetData: any;
  configData: any;
}

export default function BudgetM2Preview({
  budgetData,
  configData,
}: BudgetM2PreviewProps) {
  return (
    <BudgetLandingPage
      budgetData={budgetData}
      configData={configData}
      showCloseButton={false}
    />
  );
}
