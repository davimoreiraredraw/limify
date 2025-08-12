"use client";

import BudgetLandingPage from "@/components/landing/PreviewBudgetLandingPage";

interface BudgetRenderPreviewProps {
  budgetData: any;
  configData: any;
}

export default function BudgetRenderPreview({
  budgetData,
  configData,
}: BudgetRenderPreviewProps) {
  return (
    <BudgetLandingPage
      budgetData={budgetData}
      configData={configData}
      showCloseButton={false}
    />
  );
}
