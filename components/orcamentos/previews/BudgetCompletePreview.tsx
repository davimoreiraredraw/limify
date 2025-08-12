"use client";

import BudgetLandingPage from "@/components/landing/PreviewBudgetLandingPage";

interface BudgetCompletePreviewProps {
  budgetData: any;
  configData: any;
}

export default function BudgetCompletePreview({
  budgetData,
  configData,
}: BudgetCompletePreviewProps) {
  return (
    <BudgetLandingPage
      budgetData={budgetData}
      configData={configData}
      showCloseButton={false}
    />
  );
}
