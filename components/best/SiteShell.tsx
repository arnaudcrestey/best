import Link from "next/link";
import { ReactNode } from "react";

type SiteShellProps = {
  children: ReactNode;
};

const navigation = [
  { href: "/", label: "Accueil" },
  { href: "/presentation", label: "Le service" },
  { href: "/formulaire", label: "Formulaire" },
  { href: "/ressources", label: "Ressources" },
];

export default function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>

      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-lg text-white shadow-soft">⚖️</span>
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-900">B.E.S.T</p>
              <p className="text-xs text-slate-500">Bien-être des Salariés au Travail</p>
            </div>
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-5 md:flex">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition hover:text-brand">
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/formulaire" className="button-primary px-5 py-2 text-sm">
            Commencer
          </Link>
        </div>

        <nav aria-label="Navigation mobile" className="border-t border-slate-200 md:hidden">
          <div className="scrollbar-none mx-auto flex w-full max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-600"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <div id="contenu">{children}</div>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 text-sm text-slate-500 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} B.E.S.T — Information juridique et orientation pour les salariés.</p>
          <p>Service d'information : ne remplace pas un avocat ni un avis juridique individualisé.</p>
        </div>
      </footer>
    </div>
  );
}
