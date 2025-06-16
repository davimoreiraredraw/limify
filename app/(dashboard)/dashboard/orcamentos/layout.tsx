import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orçamentos",
  description: "Gerencie seus orçamentos",
};

export default function OrcamentosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
