import Link from "next/link";
import SiteShell from "../components/best/SiteShell";

const benefits = [
  {
    title: "100% confidentiel",
    text: "Vos données sont traitées avec discrétion pour vous permettre de parler librement.",
    icon: "🔒",
  },
  {
    title: "Basé sur le droit du travail",
    text: "L'analyse s'appuie sur le Code du travail et des sources juridiques reconnues.",
    icon: "⚖️",
  },
  {
    title: "Gratuit",
    text: "Un accompagnement informatif sans frais, accessible immédiatement.",
    icon: "💙",
  },
];

const steps = [
  { title: "Décrire la situation", text: "Vous expliquez simplement les faits importants, à votre rythme." },
  { title: "Analyse de votre situation", text: "Votre situation est étudiée à partir des règles du droit du travail applicables." },
  { title: "Recommandations personnalisées", text: "Vous recevez des pistes d'action claires et hiérarchisées." },
];

const situations = ["Harcèlement", "Conflit hiérarchique", "Contrat de travail", "Conditions de travail", "Santé au travail"];

const testimonials = [
  {
    quote: "Les réponses m’ont permis d’y voir plus clair et de comprendre les démarches possibles.",
    role: "Employée administrative",
  },
  {
    quote: "Le service m'a aidé à mieux préparer mon échange avec les RH et le CSE.",
    role: "Salarié secteur logistique",
  },
  {
    quote: "Clair, rapide et rassurant quand on est stressé et qu'on ne sait plus par où commencer.",
    role: "Cadre en PME",
  },
];

export default function HomePage() {
  return (
    <SiteShell>
      <main>
        <section className="hero-wrapper">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
            <div className="space-y-6">
              <p className="badge">Plateforme d'aide juridique confidentielle</p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Aide confidentielle pour les salariés en difficulté</h1>
              <p className="max-w-2xl text-lg text-slate-600">Décrivez votre situation et recevez une analyse basée sur le Code du travail.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/formulaire" className="button-primary">
                  Commencer
                </Link>
                <Link href="/presentation" className="button-secondary">
                  Comprendre le service
                </Link>
              </div>
              <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                <li>✓ Sans jargon inutile</li>
                <li>✓ Orientation concrète</li>
                <li>✓ Conçu pour les moments sensibles</li>
              </ul>
            </div>

            <aside className="card p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">Repères immédiats</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs text-slate-500">Confidentialité</p>
                  <p className="mt-1 text-sm font-semibold">Strictement respectée</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs text-slate-500">Réponse</p>
                  <p className="mt-1 text-sm font-semibold">Etude rapide de votre situation</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs text-slate-500">Positionnement</p>
                  <p className="mt-1 text-sm font-semibold">Information juridique</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs text-slate-500">Accès</p>
                  <p className="mt-1 text-sm font-semibold">Gratuit</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-14 sm:px-6 md:grid-cols-3 lg:px-8">
          {benefits.map((item) => (
            <article key={item.title} className="card p-6">
              <p className="text-2xl">{item.icon}</p>
              <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="card p-6 sm:p-8">
            <h2 className="section-title">Comment ça fonctionne</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand">Étape {index + 1}</p>
                  <h3 className="mt-2 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <h2 className="section-title">Types de situations accompagnées</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {situations.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm font-medium text-slate-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="section-title">Témoignages anonymes</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote key={item.role} className="card p-6">
                <p className="text-slate-700">“{item.quote}”</p>
                <footer className="mt-4 text-sm font-medium text-slate-500">— {item.role}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="mx-auto mb-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-brand px-6 py-10 text-center text-white shadow-soft sm:px-10">
            <h2 className="text-2xl font-semibold">Prêt(e) à faire le point sur votre situation ?</h2>
            <p className="mt-3 text-white/90">Commencez votre demande confidentielle en quelques minutes.</p>
            <Link href="/formulaire" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-brand no-underline transition hover:bg-slate-100">
              Commencer maintenant
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
