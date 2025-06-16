import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Limify",
  description: "Faça login na sua conta Limify",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
