import SiteShell from "../../components/best/SiteShell";

const cards = [
  {
    title: "Mission du projet",
    content:
      "Permettre aux salariés en difficulté de mieux comprendre leurs droits, de structurer leurs démarches et d'identifier les bons relais.",
    icon: "🎯",
  },
  {
    title: "Confidentialité",
    content:
      "Le service a été pensé pour les contextes sensibles : expression libre, ton non jugeant, traitement discret des informations transmises.",
    icon: "🔐",
  },
  {
    title: "Fonctionnement",
    content:
      "Vous décrivez votre situation, l'outil réalise une analyse informative automatisée, puis propose des recommandations actionnables.",
    icon: "⚙️",
  },
  {
    title: "Limites du service",
    content:
      "BEST ne remplace pas un avocat. Pour des enjeux contentieux ou urgents, il reste essentiel de solliciter un professionnel du droit.",
    icon: "⚠️",
  },
];

const faq = [
  {
    q: "Est-ce que BEST remplace un avocat ?",
    a: "Non. BEST fournit une information juridique structurée et des pistes d'action, sans constituer un conseil juridique personnalisé.",
  },
  {
    q: "Puis-je utiliser le service en cas de harcèlement ?",
    a: "Oui, la plateforme est conçue pour vous aider à structurer les faits et identifier des relais utiles rapidement.",
  },
  {
    q: "Mes données sont-elles partagées ?",
    a: "Le service est conçu autour d'un principe de confidentialité stricte et d'un traitement respectueux des informations transmises.",
  },
];

export default function PresentationPage() {
  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Présentation du service</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Un cadre clair, sérieux et rassurant pour agir</h1>
          <p className="mt-4 text-lg text-slate-600">
            BEST accompagne les salariés qui traversent une situation professionnelle difficile en combinant pédagogie juridique,
            accessibilité et simplicité d'usage.
          </p>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <article key={card.title} className="card p-6">
              <p className="text-2xl">{card.icon}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.content}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 card p-6 sm:p-8">
          <h2 className="section-title">Questions fréquentes</h2>
          <div className="mt-5 space-y-4">
            {faq.map((item) => (
              <article key={item.q} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-900">{item.q}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.a}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
