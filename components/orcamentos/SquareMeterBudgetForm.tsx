"use client";

import { useState, useEffect } from "react";
import BudgetFormFirstStep from "./BudgetFormFirstStep";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { LoaderCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import OrcamentoItemSidebar, { OrcamentoItem } from "./OrcamentoItemSidebar";
import { useRouter } from "next/navigation";

interface SquareMeterBudgetFormProps {
  budgetStep: number;
  setBudgetStep: (step: number) => void;
}

interface BudgetItem {
  id: string;
  name: string;
  description: string;
  pricePerSquareMeter: number;
  squareMeters: number;
  total: number;
}

export default function SquareMeterBudgetForm({
  budgetStep,
  setBudgetStep,
}: SquareMeterBudgetFormProps) {
  // Estados para a primeira etapa (comum a todos os tipos de orçamento)
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedClientOption, setSelectedClientOption] = useState<
    "existing" | "later" | null
  >("existing");
  const [clientId, setClientId] = useState<string | null>(null);

  // Estados específicos para orçamento por m²
  const [squareMeters, setSquareMeters] = useState<number>(0);
  const [pricePerSquareMeter, setPricePerSquareMeter] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [tipoAmbiente, setTipoAmbiente] = useState<
    "interior" | "exterior" | null
  >(null);
  const [valorComodos, setValorComodos] = useState<
    "unico" | "individuais" | null
  >(null);

  // Estados para ajuste de valor
  const [adicionalValor, setAdicionalValor] = useState<number>(0);
  const [desconto, setDesconto] = useState<number>(0);
  const [tipoDesconto, setTipoDesconto] = useState<"percentual" | "valor">(
    "percentual"
  );
  const [opcaoAjusteValor, setOpcaoAjusteValor] = useState<
    "adicionar" | "desconto" | null
  >("adicionar");

  // Estado para os itens do orçamento
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      id: "1",
      name: "Sala",
      description: "Projeto da sala completo conforme solicitado",
      pricePerSquareMeter: 150,
      squareMeters: 10,
      total: 1500,
    },
    {
      id: "2",
      name: "Fachada",
      description: "Fazer letreiro",
      pricePerSquareMeter: 150,
      squareMeters: 2,
      total: 300,
    },
    {
      id: "3",
      name: "Cozinha",
      description: "Refazer a pia",
      pricePerSquareMeter: 200,
      squareMeters: 4,
      total: 800,
    },
  ]);

  // Estados para a sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Estados para a etapa de submissão
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Atualiza o valor total quando a área ou o preço por m² mudam
  useEffect(() => {
    const calculatedTotal = squareMeters * pricePerSquareMeter;
    setTotalPrice(calculatedTotal);
  }, [squareMeters, pricePerSquareMeter]);

  // Função para lidar com a mudança de valor da área
  const handleSquareMetersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setSquareMeters(value);
  };

  // Função para lidar com a mudança de valor do preço por m²
  const handlePricePerSquareMeterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value) || 0;
    setPricePerSquareMeter(value);
  };

  // Função para calcular o total do orçamento
  const calculateTotalBudget = () => {
    const itemsTotal = budgetItems.reduce((sum, item) => sum + item.total, 0);
    let finalTotal = itemsTotal;

    if (opcaoAjusteValor === "adicionar") {
      finalTotal += adicionalValor;
    } else if (opcaoAjusteValor === "desconto") {
      if (tipoDesconto === "percentual") {
        finalTotal -= finalTotal * (desconto / 100);
      } else {
        finalTotal -= desconto;
      }
    }

    return finalTotal;
  };

  // Função para calcular o preço médio por m²
  const calculateAveragePricePerSqm = () => {
    const totalSqm = budgetItems.reduce(
      (sum, item) => sum + item.squareMeters,
      0
    );
    const totalPrice = budgetItems.reduce((sum, item) => sum + item.total, 0);

    if (totalSqm === 0) return 0;
    return totalPrice / totalSqm;
  };

  // Função para verificar se o botão "Próximo" deve estar desabilitado
  const isNextButtonDisabled = () => {
    if (budgetStep === 1) {
      // Verificações da primeira etapa
      if (selectedClientOption === "existing" && !clientId) {
        return true;
      }
      if (!projectName.trim()) {
        return true;
      }
    } else if (budgetStep === 2) {
      // Verificações da segunda etapa
      if (!tipoAmbiente || !valorComodos) {
        return true;
      }
    } else if (budgetStep === 3) {
      // Verificações da terceira etapa
      if (budgetItems.length === 0) {
        return true;
      }
    }
    return false;
  };

  // Função para avançar para a próxima etapa
  const handleNextStep = () => {
    if (budgetStep === 1) {
      setBudgetStep(2);
      toast.success("Informações básicas salvas");
    } else if (budgetStep === 2) {
      setBudgetStep(3);
      toast.success("Preferências salvas");
    } else if (budgetStep === 3) {
      setBudgetStep(4);
      toast.success("Itens adicionados com sucesso");
    }
  };

  // Função para voltar para a etapa anterior
  const handlePreviousStep = () => {
    setBudgetStep(budgetStep - 1);
  };

  // Funções para manipulação dos itens do orçamento
  const addNewItem = () => {
    setEditingItem(null);
    setIsSidebarOpen(true);
  };

  const editItem = (item: BudgetItem) => {
    setEditingItem(item);
    setIsSidebarOpen(true);
  };

  const removeItem = (id: string) => {
    setBudgetItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removido com sucesso");
  };

  const handleSaveItem = (item: OrcamentoItem) => {
    const newItem: BudgetItem = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      name: item.nome,
      description: item.descricao,
      pricePerSquareMeter: item.valorM2,
      squareMeters: item.quantidadeM2,
      total: item.total,
    };

    if (editingItem) {
      setBudgetItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? newItem : i))
      );
      toast.success("Item atualizado com sucesso");
    } else {
      setBudgetItems((prev) => [...prev, newItem]);
      toast.success("Item adicionado com sucesso");
    }

    setIsSidebarOpen(false);
    setEditingItem(null);
  };

  // Função para enviar o orçamento
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: projectName,
        description: projectDescription,
        client_id:
          selectedClientOption === "existing" && clientId ? clientId : null,
        model: tipoAmbiente,
        budget_type: "m2",
        value_type: valorComodos,
        total: calculateTotalBudget(),
        average_price_per_m2: calculateAveragePricePerSqm(),
        discount: opcaoAjusteValor === "desconto" ? desconto : 0,
        discount_type: tipoDesconto,
        items: budgetItems.map((item) => ({
          name: item.name,
          description: item.description,
          pricePerSquareMeter: item.pricePerSquareMeter,
          squareMeters: item.squareMeters,
          total: item.total,
        })),
      };

      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSubmitted(true);
        toast.success("Orçamento criado com sucesso!");
        router.push("/dashboard/orcamentos");
      } else {
        setError(data.error || "Erro ao criar orçamento");
        toast.error(data.error || "Erro ao criar orçamento");
      }
    } catch (err) {
      setError("Erro ao criar orçamento");
      toast.error("Erro ao criar orçamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para renderizar o conteúdo da etapa atual
  const renderStepContent = () => {
    switch (budgetStep) {
      case 1:
        return (
          <BudgetFormFirstStep
            clientName={clientName}
            setClientName={setClientName}
            projectName={projectName}
            setProjectName={setProjectName}
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
            selectedClientOption={selectedClientOption}
            setSelectedClientOption={setSelectedClientOption}
            clientId={clientId}
            setClientId={setClientId}
          />
        );
      case 2:
        return (
          <div className="space-y-8">
            {/* Card informativo */}
            <Card className="bg-white overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  Tipo de ambiente e valores
                </h2>
                <p className="text-gray-600">
                  Selecione o tipo de ambiente e como deseja definir os valores.
                  <span className="block mt-2 text-indigo-600">
                    Você poderá ajustar os valores na próxima etapa.
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* Seleção do tipo de ambiente */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base">Tipo de ambiente</Label>
                    <RadioGroup
                      value={tipoAmbiente || ""}
                      onValueChange={(value) =>
                        setTipoAmbiente(value as "interior" | "exterior")
                      }
                      className="grid grid-cols-2 gap-4 mt-3"
                    >
                      <div>
                        <RadioGroupItem
                          value="interior"
                          id="interior"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="interior"
                          className={cn(
                            "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer"
                          )}
                        >
                          <svg
                            className="mb-3 h-6 w-6 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          <div className="mb-1 text-lg font-semibold">
                            Interiores
                          </div>
                          <div className="text-sm text-gray-500 text-center">
                            Ambientes internos como salas, quartos, cozinhas,
                            etc.
                          </div>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="exterior"
                          id="exterior"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="exterior"
                          className={cn(
                            "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer"
                          )}
                        >
                          <svg
                            className="mb-3 h-6 w-6 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                          <div className="mb-1 text-lg font-semibold">
                            Exteriores
                          </div>
                          <div className="text-sm text-gray-500 text-center">
                            Ambientes externos como fachadas, jardins, etc.
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base">Valores dos cômodos</Label>
                    <RadioGroup
                      value={valorComodos || ""}
                      onValueChange={(value) =>
                        setValorComodos(value as "unico" | "individuais")
                      }
                      className="grid grid-cols-2 gap-4 mt-3"
                    >
                      <div>
                        <RadioGroupItem
                          value="unico"
                          id="unico"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="unico"
                          className={cn(
                            "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer"
                          )}
                        >
                          <svg
                            className="mb-3 h-6 w-6 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <div className="mb-1 text-lg font-semibold">
                            Valor único
                          </div>
                          <div className="text-sm text-gray-500 text-center">
                            Mesmo valor por m² para todos os ambientes
                          </div>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="individuais"
                          id="individuais"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="individuais"
                          className={cn(
                            "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer"
                          )}
                        >
                          <svg
                            className="mb-3 h-6 w-6 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                          </svg>
                          <div className="mb-1 text-lg font-semibold">
                            Valores individuais
                          </div>
                          <div className="text-sm text-gray-500 text-center">
                            Valores diferentes para cada ambiente
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            {/* Card informativo */}
            <Card className="bg-white overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  Adicione os ambientes
                </h2>
                <p className="text-gray-600">
                  Adicione os ambientes que serão contemplados no orçamento.
                  <span className="block mt-2 text-indigo-600">
                    Você poderá editar os valores posteriormente.
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* Lista de ambientes */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Ambientes</h3>
                    <Button
                      onClick={addNewItem}
                      className="bg-indigo-700 hover:bg-indigo-800"
                    >
                      Adicionar ambiente
                    </Button>
                  </div>

                  {budgetItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum ambiente adicionado ainda.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {budgetItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-500">
                              {item.description}
                            </p>
                            <div className="mt-1 text-sm text-gray-600">
                              {item.squareMeters} m² × R${" "}
                              {item.pricePerSquareMeter} = R$ {item.total}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editItem(item)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ajuste de valor */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base">Ajuste de valor</Label>
                    <RadioGroup
                      value={opcaoAjusteValor || ""}
                      onValueChange={(value) =>
                        setOpcaoAjusteValor(value as "adicionar" | "desconto")
                      }
                      className="grid grid-cols-2 gap-4 mt-3"
                    >
                      <div>
                        <RadioGroupItem
                          value="adicionar"
                          id="adicionar"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="adicionar"
                          className={cn(
                            "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer"
                          )}
                        >
                          <svg
                            className="mb-3 h-6 w-6 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          <div className="mb-1 text-lg font-semibold">
                            Adicionar valor
                          </div>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="desconto"
                          id="desconto"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="desconto"
                          className={cn(
                            "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer"
                          )}
                        >
                          <svg
                            className="mb-3 h-6 w-6 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                          <div className="mb-1 text-lg font-semibold">
                            Aplicar desconto
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {opcaoAjusteValor === "adicionar" && (
                    <div>
                      <Label htmlFor="adicionalValor">Valor adicional</Label>
                      <div className="mt-1.5">
                        <Input
                          type="number"
                          id="adicionalValor"
                          value={adicionalValor}
                          onChange={(e) =>
                            setAdicionalValor(parseFloat(e.target.value) || 0)
                          }
                          className="max-w-[180px]"
                        />
                      </div>
                    </div>
                  )}

                  {opcaoAjusteValor === "desconto" && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base">Tipo de desconto</Label>
                        <RadioGroup
                          value={tipoDesconto}
                          onValueChange={(value) =>
                            setTipoDesconto(value as "percentual" | "valor")
                          }
                          className="grid grid-cols-2 gap-4 mt-3"
                        >
                          <div>
                            <RadioGroupItem
                              value="percentual"
                              id="percentual"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="percentual"
                              className={cn(
                                "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer"
                              )}
                            >
                              <div className="mb-1 text-lg font-semibold">
                                Percentual
                              </div>
                            </Label>
                          </div>

                          <div>
                            <RadioGroupItem
                              value="valor"
                              id="valor"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="valor"
                              className={cn(
                                "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer"
                              )}
                            >
                              <div className="mb-1 text-lg font-semibold">
                                Valor fixo
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label htmlFor="desconto">
                          {tipoDesconto === "percentual"
                            ? "Percentual de desconto"
                            : "Valor do desconto"}
                        </Label>
                        <div className="mt-1.5">
                          <Input
                            type="number"
                            id="desconto"
                            value={desconto}
                            onChange={(e) =>
                              setDesconto(parseFloat(e.target.value) || 0)
                            }
                            className="max-w-[180px]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 4:
        return (
          <div className="mb-12">
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6">
                Revise seu orçamento
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div className="border rounded-lg p-5 bg-indigo-50 border-indigo-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-5 h-5 rounded-full border border-indigo-600 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                    </div>
                    <div>
                      <h4 className="font-medium">Informações do projeto</h4>
                      <p className="text-sm text-gray-500">
                        Revise os dados do projeto
                      </p>
                    </div>
                  </div>

                  <div className="pl-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Cliente</p>
                        <p className="font-medium">
                          {clientName || "Cliente a definir"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Projeto</p>
                        <p className="font-medium">{projectName}</p>
                      </div>
                      {projectDescription && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Descrição</p>
                          <p>{projectDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-5 bg-indigo-50 border-indigo-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-5 h-5 rounded-full border border-indigo-600 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                    </div>
                    <div>
                      <h4 className="font-medium">Detalhes do orçamento</h4>
                      <p className="text-sm text-gray-500">
                        Revise os valores e itens
                      </p>
                    </div>
                  </div>

                  <div className="pl-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Tipo de ambiente
                        </p>
                        <p className="font-medium">
                          {tipoAmbiente === "interior"
                            ? "Interior"
                            : "Exterior"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Tipo de valoração
                        </p>
                        <p className="font-medium">
                          {valorComodos === "unico"
                            ? "Valor único"
                            : "Valores individuais"}
                        </p>
                      </div>
                    </div>

                    {/* Tabela de itens */}
                    <div className="mt-6">
                      <div className="grid grid-cols-12 gap-4 pb-3 text-sm font-medium text-gray-600 border-b">
                        <div className="col-span-5">Nome</div>
                        <div className="col-span-2 text-right">Valor m²</div>
                        <div className="col-span-2 text-right">
                          Quantidade de m²
                        </div>
                        <div className="col-span-2 text-right">Total</div>
                        <div className="col-span-1 text-right">Ações</div>
                      </div>

                      {budgetItems.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-4 py-6 border-b items-center"
                        >
                          <div className="col-span-5">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.description}
                            </div>
                          </div>
                          <div className="col-span-2 text-right">
                            {formatCurrency(item.pricePerSquareMeter)}
                          </div>
                          <div className="col-span-2 text-right">
                            {item.squareMeters} m²
                          </div>
                          <div className="col-span-2 text-right font-bold">
                            {formatCurrency(item.total)}
                          </div>
                          <div className="col-span-1 flex justify-end space-x-3">
                            <button
                              className="text-red-500"
                              onClick={() => removeItem(item.id)}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM4.5 5C4.77614 5 5 5.22386 5 5.5V10.5C5 10.7761 4.77614 11 4.5 11C4.22386 11 4 10.7761 4 10.5V5.5C4 5.22386 4.22386 5 4.5 5ZM7.5 5C7.77614 5 8 5.22386 8 5.5V10.5C8 10.7761 7.77614 11 7.5 11C7.22386 11 7 10.7761 7 10.5V5.5C7 5.22386 7.22386 5 7.5 5ZM10.5 5C10.7761 5 11 5.22386 11 5.5V10.5C11 10.7761 10.7761 11 10.5 11C10.2239 11 10 10.7761 10 10.5V5.5C10 5.22386 10.2239 5 10.5 5Z"
                                  fill="currentColor"
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            </button>
                            <button
                              className="text-indigo-600"
                              onClick={() => editItem(item)}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                                  fill="currentColor"
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resumo de valores */}
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">
                          Valor total estimado:
                        </span>
                        <span className="text-xl font-bold text-indigo-700">
                          {formatCurrency(calculateTotalBudget())}
                        </span>
                      </div>
                      {valorComodos === "unico" && (
                        <div className="text-sm text-gray-500 mt-1">
                          {squareMeters} m² × R${" "}
                          {pricePerSquareMeter.toFixed(2)} por m²
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de finalização */}
            <div className="flex justify-center mt-10">
              {!isSubmitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Criando orçamento...
                    </>
                  ) : (
                    "Criar orçamento"
                  )}
                </Button>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center text-green-600 mb-2">
                    <CheckCircle2 className="h-6 w-6 mr-2" />
                    <span className="font-medium">
                      Orçamento criado com sucesso!
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Você pode visualizá-lo na lista de orçamentos.
                  </p>
                </div>
              )}
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="flex items-center justify-center text-red-600 mt-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
          </div>
        );
      default:
        return <div>Etapa não encontrada</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Conteúdo da etapa atual */}
      {renderStepContent()}

      {/* Botões de navegação */}
      <div className="flex justify-between items-center">
        {budgetStep > 1 && (
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            className="flex items-center gap-2"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
            >
              <path
                d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
            Voltar
          </Button>
        )}
        {budgetStep < 4 && (
          <Button
            onClick={handleNextStep}
            disabled={isNextButtonDisabled()}
            className={cn("ml-auto flex items-center gap-2", {
              "opacity-50 cursor-not-allowed": isNextButtonDisabled(),
            })}
          >
            Próximo
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
            >
              <path
                d="M6.1584 3.13514C5.95694 3.32401 5.94673 3.64042 6.13559 3.84188L9.565 7.49991L6.13559 11.1579C5.94673 11.3594 5.95694 11.6758 6.1584 11.8647C6.35986 12.0535 6.67627 12.0433 6.86513 11.8419L10.6151 7.84188C10.7954 7.64955 10.7954 7.35027 10.6151 7.15794L6.86513 3.15794C6.67627 2.95648 6.35986 2.94628 6.1584 3.13514Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </Button>
        )}
      </div>

      {/* Sidebar para adicionar/editar item */}
      <OrcamentoItemSidebar
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialItem={
          editingItem
            ? {
                id: editingItem.id,
                nome: editingItem.name,
                descricao: editingItem.description,
                valorM2: editingItem.pricePerSquareMeter,
                quantidadeM2: editingItem.squareMeters,
                total: editingItem.total,
              }
            : undefined
        }
      />
    </div>
  );
}
