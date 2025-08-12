"use client";

import BudgetLandingPage from "@/components/landing/PreviewBudgetLandingPage";

interface BudgetModelingPreviewProps {
  budgetData: any;
  configData: any;
}

export default function BudgetModelingPreview({
  budgetData,
  configData,
}: BudgetModelingPreviewProps) {
  return (
    <BudgetLandingPage
      budgetData={budgetData}
      configData={configData}
      showCloseButton={false}
    />
  );
}
