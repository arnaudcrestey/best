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

        <section className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          {!success ? (
            <>
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
            </>
          ) : (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="w-full max-w-xl rounded-[30px] border border-[rgba(255,255,255,0.10)] bg-[linear-gradient(180deg,rgba(76,45,130,0.92)_0%,rgba(43,25,92,0.96)_100%)] px-8 py-10 text-center text-white shadow-[0_30px_120px_rgba(49,25,99,0.35)]">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[22px] bg-white/20 shadow-[0_10px_30px_rgba(255,255,255,0.08)] ring-1 ring-white/10">
                  <span className="text-3xl">💌</span>
                </div>

                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Demande confirmée
                </h2>

                <p className="mt-5 text-lg text-white/90">
                  Votre demande a bien été enregistrée.
                </p>

                <p className="mt-4 text-base leading-7 text-white/70 sm:text-lg">
                  Votre analyse personnalisée vous sera envoyée très prochainement.
                </p>

                <p className="mt-10 text-sm text-white/45">
                  ✨ Pensez à vérifier votre boîte email ainsi que vos spams.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </SiteShell>
  );
}
