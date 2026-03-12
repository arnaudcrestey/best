import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BEST | Bien-être des Salariés au Travail",
  description:
    "Plateforme d'aide confidentielle pour les salariés : analyse automatique basée sur le Code du travail et ressources juridiques utiles.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
