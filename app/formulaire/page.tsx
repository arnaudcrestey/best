"use client";

import SiteShell from "../../components/best/SiteShell";
import { useRef, useState } from "react";
import type { PublicResult } from "../../lib/best/service";

export default function FormulairePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicResult | null>(null);
  const [error, setError] = useState("");
  const [confirmationUncertain, setConfirmationUncertain] = useState(false);
  const submitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting.current || confirmationUncertain) return;
    submitting.current = true;
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      nom: formData.get("nom"),
      prenom: formData.get("prenom"),
      email: formData.get("email"),
      description: formData.get("description"),
      consent: formData.get("consent") === "on",
      website: formData.get("website") || "",
    };

    let attemptUncertain = false;
    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(130000),
      });
      const payload = await response.json();
      if (!response.ok) {
        if (response.status >= 500 && payload.status !== "error") {
          attemptUncertain = true;
          setConfirmationUncertain(true);
        }
        setError(typeof payload.message === "string" ? payload.message : "Le service est momentanément indisponible.");
        return;
      }
      if (!["sent", "review", "pending"].includes(payload.status) || typeof payload.message !== "string" || typeof payload.reference !== "string") throw new Error("invalid_response");
      setResult(payload);
      form.reset();
    } catch {
      attemptUncertain = true;
      setConfirmationUncertain(true);
      setError("La confirmation n’a pas pu être reçue. Votre demande a peut-être été prise en compte : ne la renvoyez pas. Vérifiez votre boîte email. Pour une première information juridique, vous pouvez contacter un Point-justice.");
    } finally {
      submitting.current = attemptUncertain;
      setLoading(false);
    }
  };

 if (result) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#edf4ff_100%)] px-4 py-6 sm:px-6">
      <section className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white px-6 py-8 shadow-[0_20px_60px_rgba(37,99,235,0.08)] sm:px-10 sm:py-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            {result.status === "sent" ? "Demande transmise" : "Point sur votre demande"}
          </p>

          <h1 className="mt-4 text-[2rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2.4rem]">
            {result.status === "sent" ? "Votre demande a bien été envoyée" : result.status === "review" ? "Votre demande nécessite une vérification" : "Votre demande est à vérifier"}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:max-w-xl sm:text-lg">
            {result.status === "sent"
              ? "Merci pour votre message. Une première orientation adaptée à votre situation vient de vous être envoyée par email."
              : result.status === "review"
                ? "Merci pour votre confiance. Votre situation mérite l’avis d’un professionnel. Aucun email automatique n’a été envoyé. Un Point-justice peut vous aider à faire le point sur vos droits et vos démarches."
                : "Merci pour votre message. Nous ne pouvons pas encore confirmer son traitement. Ne renvoyez pas votre demande : vérifiez votre boîte email. Si vous avez besoin d’un premier conseil juridique, vous pouvez contacter un Point-justice."}
          </p>

          <div className="mt-8 w-full rounded-2xl bg-slate-50 px-5 py-5 text-left text-sm leading-7 text-slate-600">
            <p className="font-semibold text-slate-900">
              Informations utiles
            </p>

            {result.status === "sent" && (
              <p className="mt-3">
                Pensez à vérifier votre boîte email ainsi que vos courriers
                indésirables.
              </p>
            )}

            {result.status !== "sent" && (
              <p className="mt-3">
                <a className="font-medium text-blue-700 underline underline-offset-4" href="https://www.service-public.gouv.fr/particuliers/vosdroits/F20706" target="_blank" rel="noopener noreferrer">
                  Consulter les possibilités d’aide juridique gratuite
                </a>
              </p>
            )}

            <p className="mt-3">
              BEST fournit une information juridique et une orientation pour les
              salariés. Ce service ne remplace pas un avocat ni un avis juridique
              individualisé.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <section className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Demande d'analyse
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Formulaire confidentiel
          </h1>

          <p className="mt-4 text-slate-600">
            Prenez le temps de décrire votre situation. Plus votre message est
            précis, plus l'analyse sera utile.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Site témoin : la réponse est réellement préparée par IA et envoyée
            par email. Aucun dossier de suivi n’est créé sur le site.
          </p>
        </section>

        <section className="mx-auto mt-10 max-w-3xl card p-6 sm:p-8">
          <div className="mb-6 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Avant de commencer</p>
            <p className="mt-1">
              Indiquez les faits, dates, personnes impliquées et impacts
              observés. Cela améliore la qualité de l'orientation.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Nom (optionnel)</span>
                <input
                  type="text"
                  name="nom"
                  maxLength={150}
                  autoComplete="family-name"
                  className="input-field"
                  placeholder="Votre nom"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Prénom (optionnel)</span>
                <input
                  type="text"
                  name="prenom"
                  maxLength={150}
                  autoComplete="given-name"
                  className="input-field"
                  placeholder="Votre prénom"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Email</span>
              <input
                type="email"
                name="email"
                maxLength={254}
                autoComplete="email"
                required
                className="input-field"
                placeholder="vous@exemple.fr"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Description de la situation</span>
              <textarea
                name="description"
                maxLength={12000}
                required
                rows={8}
                className="input-field"
                placeholder="Expliquez les faits, les dates importantes, les échanges déjà réalisés et vos attentes."
              />
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" name="consent" required className="mt-1" />
              <span>
                J'ai compris que BEST fournit une orientation informative et ne
                remplace pas un avocat. J’accepte le traitement de ma demande
                pour préparer et recevoir cette réponse, avec l’aide d’une IA.
              </span>
            </label>

            <p className="rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand">
              Seuls votre prénom et votre description sont transmis à OpenAI
              pour préparer la réponse à l’aide de notre bibliothèque. Évitez
              les noms de tiers et les données sensibles inutiles. Une copie de
              la réponse est conservée par l’équipe BEST.
            </p>

            <div className="hidden" aria-hidden="true">
              <label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
            {loading && (
              <div role="status" aria-live="polite" className="flex items-center gap-3 text-sm text-slate-600">
                <span aria-hidden="true" className="h-5 w-5 shrink-0 rounded-full border-2 border-brand/20 border-t-brand motion-safe:animate-spin" />
                <span>Préparation de votre réponse…</span>
              </div>
            )}

            <button
              type="submit"
              className="button-primary w-full sm:w-auto"
              disabled={loading || confirmationUncertain}
            >
              {loading ? "Traitement en cours..." : confirmationUncertain ? "Vérifiez votre boîte email" : "Envoyer ma demande"}
            </button>
          </form>
        </section>
      </main>
    </SiteShell>
  );
}
