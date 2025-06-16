"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Lista de países
const countries = [
  { label: "Brasil", value: "BR" },
  { label: "Afeganistão", value: "AF" },
  { label: "África do Sul", value: "ZA" },
  { label: "Albânia", value: "AL" },
  { label: "Alemanha", value: "DE" },
  { label: "Andorra", value: "AD" },
  { label: "Angola", value: "AO" },
  { label: "Antígua e Barbuda", value: "AG" },
  { label: "Arábia Saudita", value: "SA" },
  { label: "Argélia", value: "DZ" },
  { label: "Argentina", value: "AR" },
  { label: "Armênia", value: "AM" },
  { label: "Austrália", value: "AU" },
  { label: "Áustria", value: "AT" },
  { label: "Azerbaijão", value: "AZ" },
  { label: "Bahamas", value: "BS" },
  { label: "Bangladesh", value: "BD" },
  { label: "Barbados", value: "BB" },
  { label: "Barein", value: "BH" },
  { label: "Bélgica", value: "BE" },
  { label: "Belize", value: "BZ" },
  { label: "Benin", value: "BJ" },
  { label: "Bielorrússia", value: "BY" },
  { label: "Bolívia", value: "BO" },
  { label: "Bósnia e Herzegovina", value: "BA" },
  { label: "Botsuana", value: "BW" },
  { label: "Brunei", value: "BN" },
  { label: "Bulgária", value: "BG" },
  { label: "Burkina Faso", value: "BF" },
  { label: "Burundi", value: "BI" },
  { label: "Butão", value: "BT" },
  { label: "Cabo Verde", value: "CV" },
  { label: "Camarões", value: "CM" },
  { label: "Camboja", value: "KH" },
  { label: "Canadá", value: "CA" },
  { label: "Catar", value: "QA" },
  { label: "Cazaquistão", value: "KZ" },
  { label: "Chade", value: "TD" },
  { label: "Chile", value: "CL" },
  { label: "China", value: "CN" },
  { label: "Chipre", value: "CY" },
  { label: "Colômbia", value: "CO" },
  { label: "Comores", value: "KM" },
  { label: "Congo", value: "CG" },
  { label: "Coreia do Norte", value: "KP" },
  { label: "Coreia do Sul", value: "KR" },
  { label: "Costa do Marfim", value: "CI" },
  { label: "Costa Rica", value: "CR" },
  { label: "Croácia", value: "HR" },
  { label: "Cuba", value: "CU" },
  { label: "Dinamarca", value: "DK" },
  { label: "Djibuti", value: "DJ" },
  { label: "Dominica", value: "DM" },
  { label: "Egito", value: "EG" },
  { label: "El Salvador", value: "SV" },
  { label: "Emirados Árabes Unidos", value: "AE" },
  { label: "Equador", value: "EC" },
  { label: "Eritreia", value: "ER" },
  { label: "Escócia", value: "SCO" },
  { label: "Eslováquia", value: "SK" },
  { label: "Eslovênia", value: "SI" },
  { label: "Espanha", value: "ES" },
  { label: "Estados Unidos", value: "US" },
  { label: "Estônia", value: "EE" },
  { label: "Etiópia", value: "ET" },
  { label: "Fiji", value: "FJ" },
  { label: "Filipinas", value: "PH" },
  { label: "Finlândia", value: "FI" },
  { label: "França", value: "FR" },
  { label: "Gabão", value: "GA" },
  { label: "Gâmbia", value: "GM" },
  { label: "Gana", value: "GH" },
  { label: "Geórgia", value: "GE" },
  { label: "Granada", value: "GD" },
  { label: "Grécia", value: "GR" },
  { label: "Guatemala", value: "GT" },
  { label: "Guiana", value: "GY" },
  { label: "Guiné", value: "GN" },
  { label: "Guiné Equatorial", value: "GQ" },
  { label: "Guiné-Bissau", value: "GW" },
  { label: "Haiti", value: "HT" },
  { label: "Holanda", value: "NL" },
  { label: "Honduras", value: "HN" },
  { label: "Hungria", value: "HU" },
  { label: "Iêmen", value: "YE" },
  { label: "Ilhas Marshall", value: "MH" },
  { label: "Ilhas Salomão", value: "SB" },
  { label: "Índia", value: "IN" },
  { label: "Indonésia", value: "ID" },
  { label: "Irã", value: "IR" },
  { label: "Iraque", value: "IQ" },
  { label: "Irlanda", value: "IE" },
  { label: "Islândia", value: "IS" },
  { label: "Israel", value: "IL" },
  { label: "Itália", value: "IT" },
  { label: "Jamaica", value: "JM" },
  { label: "Japão", value: "JP" },
  { label: "Jordânia", value: "JO" },
  { label: "Kiribati", value: "KI" },
  { label: "Kuwait", value: "KW" },
  { label: "Laos", value: "LA" },
  { label: "Lesoto", value: "LS" },
  { label: "Letônia", value: "LV" },
  { label: "Líbano", value: "LB" },
  { label: "Libéria", value: "LR" },
  { label: "Líbia", value: "LY" },
  { label: "Liechtenstein", value: "LI" },
  { label: "Lituânia", value: "LT" },
  { label: "Luxemburgo", value: "LU" },
  { label: "Macedônia do Norte", value: "MK" },
  { label: "Madagascar", value: "MG" },
  { label: "Malásia", value: "MY" },
  { label: "Malaui", value: "MW" },
  { label: "Maldivas", value: "MV" },
  { label: "Mali", value: "ML" },
  { label: "Malta", value: "MT" },
  { label: "Marrocos", value: "MA" },
  { label: "Maurício", value: "MU" },
  { label: "Mauritânia", value: "MR" },
  { label: "México", value: "MX" },
  { label: "Micronésia", value: "FM" },
  { label: "Moçambique", value: "MZ" },
  { label: "Moldávia", value: "MD" },
  { label: "Mônaco", value: "MC" },
  { label: "Mongólia", value: "MN" },
  { label: "Montenegro", value: "ME" },
  { label: "Myanmar", value: "MM" },
  { label: "Namíbia", value: "NA" },
  { label: "Nauru", value: "NR" },
  { label: "Nepal", value: "NP" },
  { label: "Nicarágua", value: "NI" },
  { label: "Níger", value: "NE" },
  { label: "Nigéria", value: "NG" },
  { label: "Noruega", value: "NO" },
  { label: "Nova Zelândia", value: "NZ" },
  { label: "Omã", value: "OM" },
  { label: "Palau", value: "PW" },
  { label: "Panamá", value: "PA" },
  { label: "Papua-Nova Guiné", value: "PG" },
  { label: "Paquistão", value: "PK" },
  { label: "Paraguai", value: "PY" },
  { label: "Peru", value: "PE" },
  { label: "Polônia", value: "PL" },
  { label: "Portugal", value: "PT" },
  { label: "Quênia", value: "KE" },
  { label: "Quirguistão", value: "KG" },
  { label: "Reino Unido", value: "GB" },
  { label: "República Centro-Africana", value: "CF" },
  { label: "República Democrática do Congo", value: "CD" },
  { label: "República Dominicana", value: "DO" },
  { label: "República Tcheca", value: "CZ" },
  { label: "Romênia", value: "RO" },
  { label: "Ruanda", value: "RW" },
  { label: "Rússia", value: "RU" },
  { label: "Samoa", value: "WS" },
  { label: "Santa Lúcia", value: "LC" },
  { label: "São Cristóvão e Nevis", value: "KN" },
  { label: "São Marino", value: "SM" },
  { label: "São Tomé e Príncipe", value: "ST" },
  { label: "São Vicente e Granadinas", value: "VC" },
  { label: "Senegal", value: "SN" },
  { label: "Serra Leoa", value: "SL" },
  { label: "Sérvia", value: "RS" },
  { label: "Seychelles", value: "SC" },
  { label: "Singapura", value: "SG" },
  { label: "Síria", value: "SY" },
  { label: "Somália", value: "SO" },
  { label: "Sri Lanka", value: "LK" },
  { label: "Suazilândia", value: "SZ" },
  { label: "Sudão", value: "SD" },
  { label: "Sudão do Sul", value: "SS" },
  { label: "Suécia", value: "SE" },
  { label: "Suíça", value: "CH" },
  { label: "Suriname", value: "SR" },
  { label: "Tailândia", value: "TH" },
  { label: "Taiwan", value: "TW" },
  { label: "Tajiquistão", value: "TJ" },
  { label: "Tanzânia", value: "TZ" },
  { label: "Timor-Leste", value: "TL" },
  { label: "Togo", value: "TG" },
  { label: "Tonga", value: "TO" },
  { label: "Trinidad e Tobago", value: "TT" },
  { label: "Tunísia", value: "TN" },
  { label: "Turcomenistão", value: "TM" },
  { label: "Turquia", value: "TR" },
  { label: "Tuvalu", value: "TV" },
  { label: "Ucrânia", value: "UA" },
  { label: "Uganda", value: "UG" },
  { label: "Uruguai", value: "UY" },
  { label: "Uzbequistão", value: "UZ" },
  { label: "Vanuatu", value: "VU" },
  { label: "Vaticano", value: "VA" },
  { label: "Venezuela", value: "VE" },
  { label: "Vietnã", value: "VN" },
  { label: "Zâmbia", value: "ZM" },
  { label: "Zimbábue", value: "ZW" },
];

// Lista de profissões
const professions = [
  { label: "Arquiteto", value: "arquiteto" },
  { label: "Engenheiro", value: "engenheiro" },
  { label: "Designer de Interiores", value: "designer_interiores" },
  { label: "Projetista", value: "projetista" },
  { label: "Corretor de Imóveis", value: "corretor_imoveis" },
  { label: "Estudante", value: "estudante" },
  { label: "Professor", value: "professor" },
  { label: "Outro", value: "outro" },
];

// Lista de canais de aquisição
const acquisitionChannels = [
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "Google", value: "google" },
  { label: "Indicação", value: "indicacao" },
  { label: "Youtube", value: "youtube" },
  { label: "Influencer", value: "influencer" },
  { label: "Outros", value: "outros" },
];

// Schema de validação para os dados pessoais - agora em etapas
const step1Schema = z.object({
  country: z.string({
    required_error: "Por favor, selecione o seu país.",
  }),
});

const step2Schema = z.object({
  profession: z.string({
    required_error: "Por favor, selecione a sua profissão.",
  }),
  otherProfession: z.string().optional().or(z.literal("")),
});

const step3Schema = z.object({
  acquisitionChannel: z.string({
    required_error: "Por favor, selecione como nos conheceu.",
  }),
  otherAcquisitionChannel: z.string().optional().or(z.literal("")),
  influencerName: z.string().optional().or(z.literal("")),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Você precisa aceitar os termos de uso.",
  }),
});

interface UserOnboardingFormProps {
  isGoogleOrFacebookLogin: boolean;
}

interface FormData {
  country: string;
  profession: string;
  otherProfession: string;
  acquisitionChannel: string;
  otherAcquisitionChannel: string;
  influencerName: string;
  termsAccepted: boolean;
}

export function UserOnboardingForm({
  isGoogleOrFacebookLogin,
}: UserOnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    country: "BR",
    profession: "",
    otherProfession: "",
    acquisitionChannel: "",
    otherAcquisitionChannel: "",
    influencerName: "",
    termsAccepted: false,
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Imagens para o carrossel (temporárias até receber as reais)
  const carouselImages = [
    "/images/onboarding-1.jpg",
    "/images/onboarding-2.jpg",
    "/images/onboarding-3.jpg",
  ];

  // Atualizar imagem ativa a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Formulários para cada etapa
  const step1Form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      country: formData.country,
    },
  });

  const step2Form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      profession: formData.profession,
      otherProfession: formData.otherProfession,
    },
  });

  const step3Form = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      acquisitionChannel: formData.acquisitionChannel,
      otherAcquisitionChannel: formData.otherAcquisitionChannel,
      influencerName: formData.influencerName,
      termsAccepted: formData.termsAccepted,
    },
  });

  // Função para verificar se o usuário já completou o onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Buscar o usuário atual
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // Se não há usuário logado, redirecione para o login
          router.push("/login");
          return;
        }

        // Verificar se o usuário já tem metadados de onboarding
        if (user.user_metadata?.onboarding_completed) {
          // Se o onboarding já foi completado, redirecione para o dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Erro ao verificar status de onboarding:", error);
      }
    };

    checkOnboardingStatus();
  }, [router, supabase]);

  // Funções para navegar entre etapas
  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Funções para lidar com cada etapa
  const handleStep1Submit = (values: z.infer<typeof step1Schema>) => {
    setFormData({
      ...formData,
      country: values.country,
    });
    nextStep();
  };

  const handleStep2Submit = (values: z.infer<typeof step2Schema>) => {
    setFormData({
      ...formData,
      profession: values.profession,
      otherProfession: values.otherProfession ?? "",
    });
    nextStep();
  };

  const handleStep3Submit = async (values: z.infer<typeof step3Schema>) => {
    try {
      setIsLoading(true);
      // Atualizar dados do formulário
      const finalFormData = {
        ...formData,
        acquisitionChannel: values.acquisitionChannel,
        otherAcquisitionChannel: values.otherAcquisitionChannel || "",
        influencerName: values.influencerName || "",
        termsAccepted: values.termsAccepted,
      };

      // Buscar o usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não encontrado");
        return;
      }

      // Atualizar metadados do usuário diretamente com o cliente do Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          country: finalFormData.country,
          profession: finalFormData.profession,
          other_profession: finalFormData.otherProfession || "",
          acquisition_channel: finalFormData.acquisitionChannel,
          other_acquisition_channel:
            finalFormData.otherAcquisitionChannel || "",
          influencer_name: finalFormData.influencerName || "",
          terms_accepted: finalFormData.termsAccepted,
          onboarding_completed: true,
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Onboarding concluído com sucesso!");

      // Redirecionar para o dashboard
      router.push("/dashboard");
    } catch (error: any) {
      toast.error("Erro ao finalizar onboarding", {
        description: error.message || "Tente novamente mais tarde",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Título e descrição de cada etapa
  const stepInfo = {
    1: {
      title: "Onde você está?",
      description:
        "Selecione seu país para que possamos personalizar sua experiência",
    },
    2: {
      title: "Qual sua profissão?",
      description:
        "Conhecer sua área de atuação nos ajuda a oferecer conteúdo relevante",
    },
    3: {
      title: "Últimos detalhes",
      description: "Conte-nos como você conheceu o Limify",
    },
  };

  return (
    <div className="w-full flex flex-col h-screen p-8 md:p-12">
      {/* Cabeçalho */}
      <div className="flex-none">
        <div className="mb-4">
          {/* Logo do Limify */}
          <div className="h-8 mb-8">
            <Image
              src="/logo.png"
              alt="Limify"
              width={120}
              height={40}
              priority
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {stepInfo[step as keyof typeof stepInfo].title}
          </h2>
          <p className="text-sm text-gray-500">
            {stepInfo[step as keyof typeof stepInfo].description}
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="flex items-center gap-2 mb-6">
          <div className="text-sm text-gray-500">Etapas</div>
          <div className="flex-1 bg-gray-200 h-2 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{
                width: `${(step / 3) * 100}%`,
              }}
            ></div>
          </div>
          <div className="text-sm text-gray-500">{step} de 3</div>
        </div>
      </div>

      {/* Conteúdo do formulário - área que pode rolar se necessário */}
      <div className="flex-1 overflow-y-auto">
        {/* Etapa 1 - País */}
        {step === 1 && (
          <Form {...step1Form}>
            <form
              onSubmit={step1Form.handleSubmit(handleStep1Submit)}
              className="h-full flex flex-col"
            >
              <div className="flex-1">
                <FormField
                  control={step1Form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-lg">
                            <SelectValue placeholder="Selecione seu país" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem
                              key={country.value}
                              value={country.value}
                            >
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex-none mt-auto pt-6">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  Próximo
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Etapa 2 - Profissão */}
        {step === 2 && (
          <Form {...step2Form}>
            <form
              onSubmit={step2Form.handleSubmit(handleStep2Submit)}
              className="h-full flex flex-col"
            >
              <div className="flex-1">
                <FormField
                  control={step2Form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profissão</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-lg">
                            <SelectValue placeholder="Selecione sua profissão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {professions.map((profession) => (
                            <SelectItem
                              key={profession.value}
                              value={profession.value}
                            >
                              {profession.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {step2Form.watch("profession") === "outro" && (
                  <FormField
                    control={step2Form.control}
                    name="otherProfession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especifique sua profissão</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Digite sua profissão"
                            className="h-12 rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex-none mt-auto pt-6">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="w-full h-12 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium rounded-lg bg-blue-600 hover:bg-blue-700"
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}

        {/* Etapa 3 - Canal de aquisição e termos */}
        {step === 3 && (
          <Form {...step3Form}>
            <form
              onSubmit={step3Form.handleSubmit(handleStep3Submit)}
              className="h-full flex flex-col"
            >
              <div className="flex-1">
                <FormField
                  control={step3Form.control}
                  name="acquisitionChannel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Como você conheceu o Limify?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-lg">
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {acquisitionChannels.map((channel) => (
                            <SelectItem
                              key={channel.value}
                              value={channel.value}
                            >
                              {channel.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {step3Form.watch("acquisitionChannel") === "outros" && (
                  <FormField
                    control={step3Form.control}
                    name="otherAcquisitionChannel"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Especifique como nos conheceu</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Digite como nos conheceu"
                            className="h-12 rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {step3Form.watch("acquisitionChannel") === "influencer" && (
                  <FormField
                    control={step3Form.control}
                    name="influencerName"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Nome do Influencer</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Digite o nome do influencer"
                            className="h-12 rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={step3Form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          Concordo com os{" "}
                          <a href="#" className="text-blue-600 hover:underline">
                            termos de uso
                          </a>{" "}
                          e{" "}
                          <a href="#" className="text-blue-600 hover:underline">
                            política de privacidade
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex-none mt-auto pt-6">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isLoading}
                    className="w-full h-12 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-base font-medium rounded-lg bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Concluindo..." : "Concluir"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
