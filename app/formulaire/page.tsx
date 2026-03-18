"use client";

import SiteShell from "../../components/best/SiteShell";
import { useState } from "react";

export default function FormulairePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      nom: formData.get("nom"),
      prenom: formData.get("prenom"),
      email: formData.get("email"),
      description: formData.get("description"),
    };

    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du formulaire");
      }

      setSuccess(true);
      form.reset();
    } catch (error) {
      console.error(error);
      alert("L'envoi a échoué. Veuillez réessayer dans quelques instants.");
    } finally {
      setLoading(false);
    }
  };

 if (success) {
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
            Demande transmise
          </p>

          <h1 className="mt-4 text-[2rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2.4rem]">
            Votre demande a bien été envoyée
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:max-w-xl sm:text-lg">
            Merci pour votre message. Notre équipe reviendra vers vous rapidement
            avec une première orientation adaptée à votre situation.
          </p>

          <div className="mt-8 w-full rounded-2xl bg-slate-50 px-5 py-5 text-left text-sm leading-7 text-slate-600">
            <p className="font-semibold text-slate-900">
              Informations utiles
            </p>

            <p className="mt-3">
              Pensez à vérifier votre boîte email ainsi que vos courriers
              indésirables.
            </p>

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
                  className="input-field"
                  placeholder="Votre nom"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Prénom (optionnel)</span>
                <input
                  type="text"
                  name="prenom"
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
                required
                className="input-field"
                placeholder="vous@exemple.fr"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Description de la situation</span>
              <textarea
                name="description"
                required
                rows={8}
                className="input-field"
                placeholder="Expliquez les faits, les dates importantes, les échanges déjà réalisés et vos attentes."
              />
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" required className="mt-1" />
              <span>
                J'ai compris que BEST fournit une orientation informative et ne
                remplace pas un avocat.
              </span>
            </label>

            <p className="rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand">
              Votre message est traité de façon strictement confidentielle.
            </p>

            <button
              type="submit"
              className="button-primary w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Envoi en cours..." : "Envoyer ma demande"}
            </button>
          </form>
        </section>
      </main>
    </SiteShell>
  );
}
