"use client";

import { UserOnboardingForm } from "@/components/auth/user-onboarding-form";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";

const slides = [
  {
    title:
      "Transforme seu projeto em um orçamento profissional em poucos cliques",
    description:
      "Com o Limify, você cria orçamentos organizados, personalizados e prontos para enviar ao cliente.",
  },
  {
    title: "Descreva. Veja acontecer.",
    description:
      "O Limify transforma sua ideia escrita em imagens realistas ou conceituais.",
  },
  {
    title: "Automatize suas tarefas diárias",
    description:
      "Economize tempo com nossas ferramentas inteligentes de automação.",
  },
];

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const loginType = searchParams.get("type");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const isGoogleOrFacebookLogin =
    loginType === "google" || loginType === "facebook";

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <UserOnboardingForm isGoogleOrFacebookLogin={isGoogleOrFacebookLogin} />
      </div>

      <div className="relative flex-1 hidden lg:block">
        <div className="absolute inset-0">
          <Image
            src="/onboarding_background.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative h-full flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-lg mx-8 shadow-lg">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  currentSlide === index
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 hidden"
                }`}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {slide.title}
                </h2>
                <p className="text-gray-600">{slide.description}</p>
              </div>
            ))}

            <div className="flex justify-center space-x-2 mt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
