import SiteShell from "../../components/best/SiteShell";

const sections = [
  {
    title: "Conseils pratiques",
    icon: "🧭",
    items: [
      "Conserver des preuves factuelles (emails, messages, comptes-rendus).",
      "Noter les dates et événements de manière chronologique.",
      "Préparer vos échanges avec RH, CSE ou manager avec des éléments précis.",
    ],
  },
  {
    title: "Actions recommandées",
    icon: "✅",
    items: [
      "Contacter la médecine du travail si la situation impacte votre santé.",
      "Solliciter l'inspection du travail en cas de situation grave.",
      "Consulter un professionnel du droit pour les cas contentieux.",
    ],
  },
  {
  title: "Contacts utiles",
  icon: "📞",
  items: [
    "Inspection du Travail : 0806 000 126",
    "Défenseur des droits (discrimination, harcèlement ou atteinte aux libertés)",
    "Service-public.fr",
    "Médecine du travail"
  ],
},
  {
    title: "Organismes officiels",
    icon: "🏛️",
    items: ["Ministère du Travail", "Code du travail numérique", "Portail officiel de l'administration française"],
  },
  {
    title: "Prévention des risques psychosociaux",
    icon: "🧠",
    items: [
      "Repérer les signaux faibles : surcharge, isolement, tensions répétées.",
      "Mettre en place des espaces de parole et de régulation collective.",
      "Orienter rapidement vers les dispositifs de soutien adaptés.",
    ],
  },
  {
    title: "En cas d'urgence",
    icon: "🚨",
    items: [
      "Si votre sécurité est menacée, contactez immédiatement les services d'urgence.",
      "En cas de crise psychologique aiguë, appelez le 3114 (numéro national de prévention du suicide).",
      "Demandez rapidement un rendez-vous médical en cas d'altération de votre santé.",
    ],
  },
];

export default function RessourcesPage() {
  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Ressources</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Ressources utiles pour agir avec méthode</h1>
          <p className="mt-4 text-slate-600">
            Retrouvez des informations vérifiées et des pistes concrètes pour sécuriser vos démarches.
          </p>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="card p-6">
              <p className="text-2xl">{section.icon}</p>
              <h2 className="mt-3 text-xl font-semibold">{section.title}</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 text-brand">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </main>
    </SiteShell>
  );
}
