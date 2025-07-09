import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redefinir Senha | Limify",
  description: "Redefina sua senha do Limify",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
