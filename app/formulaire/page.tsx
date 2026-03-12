"use client";

import SiteShell from "../../components/best/SiteShell";
import { useState } from "react";

export default function FormulairePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    const data = {
      nom: formData.get("nom"),
      prenom: formData.get("prenom"),
      email: formData.get("email"),
      description: formData.get("description"),
    };

    try {
      await fetch("/api/analyse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      setSuccess(true);
      e.target.reset();
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

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

          {!success ? (

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>👤 Nom (optionnel)</span>
                  <input
                    type="text"
                    name="nom"
                    className="input-field"
                    placeholder="Votre nom"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>👤 Prénom (optionnel)</span>
                  <input
                    type="text"
                    name="prenom"
                    className="input-field"
                    placeholder="Votre prénom"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>📧 Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  className="input-field"
                  placeholder="vous@exemple.fr"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>📝 Description de la situation</span>
                <textarea
                  name="description"
                  required
                  rows={8}
                  className="input-field"
                  placeholder="Expliquez les faits, les dates importantes, les échanges déjà réalisés et vos attentes."
                />
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" required />
                <span>
                  J'ai compris que BEST fournit une orientation informative et
                  ne remplace pas un avocat.
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

          ) : (

            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800">
              <h3 className="text-lg font-semibold mb-2">
                ✓ Votre demande a bien été envoyée
              </h3>
              <p>
                Merci pour votre message. Nous reviendrons vers vous rapidement.
              </p>
            </div>

          )}
        </section>
      </main>
    </SiteShell>
  );
}
