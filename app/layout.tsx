import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const archivo = Archivo({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Limify - Orçamentos de Arquitetura",
  description:
    "Plataforma de orçamentos para arquitetos e designers de interiores",
  icons: {
    icon: [
      {
        url: "/short_logo.png",
        href: "/short_logo.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/short_logo.png" />
      </head>
      <body className={archivo.className}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
