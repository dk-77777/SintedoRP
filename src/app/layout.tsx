import type { Metadata } from "next";
import { DemoProvider } from "@/demo/provider";
import "@/styles/globals.css";
import "@/styles/redesign.css";
import "@/styles/home.css";

export const metadata: Metadata = {
  title: {
    default: "Conecta SINTEDORP · Trabalho com respeito",
    template: "%s · Conecta SINTEDORP",
  },
  description:
    "Oportunidades para trabalhadores domésticos, com diálogo, respeito e mediação sindical.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
