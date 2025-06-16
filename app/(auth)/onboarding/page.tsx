"use client";

import { UserOnboardingForm } from "@/components/auth/user-onboarding-form";
import { useSearchParams } from "next/navigation";

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const loginType = searchParams.get("type");

  // Verificar se o usuário fez login com Google ou Facebook
  const isGoogleOrFacebookLogin =
    loginType === "google" || loginType === "facebook";

  return (
    <UserOnboardingForm isGoogleOrFacebookLogin={isGoogleOrFacebookLogin} />
  );
}
