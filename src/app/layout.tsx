import type { Metadata } from "next";
import localFont from "next/font/local";
import { DemoProvider } from "@/demo/provider";
import "@/styles/globals.css";
import "@/styles/redesign.css";
import "@/styles/home.css";
import "@/styles/access.css";
import "@/styles/motion.css";
const manrope = localFont({
  src: "../../public/fonts/manrope-latin.woff2",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});

export const metadata: Metadata = {
  title: {
    default: "Conecta SINTEDORP · Portal de serviços",
    template: "%s · Conecta SINTEDORP",
  },
  description:
    "Portal de vagas, orientação e atendimento sindical para trabalhadores domésticos e empregadores de Ribeirão Preto e região.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <body>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
