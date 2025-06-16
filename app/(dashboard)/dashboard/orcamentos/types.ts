// Interface para orçamentos
export interface Budget {
  id: string;
  project: string;
  company: string;
  client: string;
  date: string;
  cost: number;
  price: number;
  profit: number;
  status:
    | "Visualizado"
    | "Não gerado"
    | "Pendente"
    | "Completo"
    | "Fechado"
    | "Vencido";
  column: "NÃO FINALIZADO" | "GERADO" | "FECHADOS";
}

// Interface para colunas
export interface Column {
  id: string;
  title: string;
  count: number;
  totalValue?: number;
  budgetIds: string[];
}

// Interface para o cliente
export interface Client {
  id: string;
  name: string;
  company: string;
  photoUrl?: string;
  budgetsCount: number;
  email?: string;
  phone?: string;
  document?: string;
  additionalInfo?: string;
}

// Interface para tipos de orçamento
export interface BudgetType {
  id: string;
  title: string;
  description: string;
}

// Mock de dados para orçamentos
export const mockBudgets: Budget[] = [
  {
    id: "1",
    project: "Real Estate Agent",
    company: "SoftShift",
    client: "Emma Johnson",
    date: "10/01/24",
    cost: 825,
    price: 825,
    profit: 825,
    status: "Visualizado",
    column: "NÃO FINALIZADO",
  },
  {
    id: "2",
    project: "Surgeon",
    company: "FlowVolt",
    client: "Elizabeth Jones",
    date: "10/01/24",
    cost: 754,
    price: 754,
    profit: 754,
    status: "Não gerado",
    column: "NÃO FINALIZADO",
  },
  {
    id: "3",
    project: "Customer Service",
    company: "Solar Streams",
    client: "Ryan Martinez",
    date: "10/01/24",
    cost: 804,
    price: 804,
    profit: 804,
    status: "Pendente",
    column: "NÃO FINALIZADO",
  },
  {
    id: "4",
    project: "Auditor",
    company: "Alpha Automation",
    client: "Madison Thompson",
    date: "10/01/24",
    cost: 107,
    price: 107,
    profit: 107,
    status: "Visualizado",
    column: "NÃO FINALIZADO",
  },
  {
    id: "5",
    project: "Registered Nurse",
    company: "BrightKeeper",
    client: "Abigail Thomas",
    date: "10/01/24",
    cost: 207,
    price: 207,
    profit: 207,
    status: "Visualizado",
    column: "NÃO FINALIZADO",
  },
];

// Mock de dados para clientes
export const mockClients: Client[] = [
  {
    id: "1",
    name: "Real Estate Agent",
    company: "SoftShift",
    photoUrl: "https://i.pravatar.cc/150?u=emma",
    budgetsCount: 1,
    email: "emma@softshift.com",
    phone: "(11) 98765-4321",
    document: "123.456.789-00",
  },
  {
    id: "2",
    name: "Surgeon",
    company: "FlowVolt",
    photoUrl: "https://i.pravatar.cc/150?u=elizabeth",
    budgetsCount: 0,
    email: "elizabeth@flowvolt.com",
  },
  {
    id: "3",
    name: "Registered Nurse",
    company: "BrightKeeper",
    photoUrl: "https://i.pravatar.cc/150?u=abigail",
    budgetsCount: 1,
    phone: "(21) 99876-5432",
  },
  {
    id: "4",
    name: "Britnei",
    company: "Streamlined Solutions",
    photoUrl: "https://i.pravatar.cc/150?u=britnei",
    budgetsCount: 4,
    document: "98.765.432/0001-10",
    additionalInfo: "Cliente VIP com tratamento especial",
  },
];

// Lista de tipos de orçamento
export const budgetTypes: BudgetType[] = [
  {
    id: "complete",
    title: "Projeto completo",
    description: "Da planta à execução, completo",
  },
  {
    id: "m2",
    title: "Por m²",
    description: "Orçamento por metro quadrado",
  },
  {
    id: "render",
    title: "Render",
    description: "Orçamento baseado em renders",
  },
  {
    id: "modeling",
    title: "Modelagem",
    description: "Apenas a modelagem do projeto",
  },
  {
    id: "price",
    title: "Por preço da obra",
    description: "Baseado no Sinduscon, precifique tudo",
  },
];
