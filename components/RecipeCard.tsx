'use client';

import { useMemo, useState } from "react";
import type { GeneratedRecipe } from "../lib/recipeGenerator";

const formatDuration = (minutes?: number) => {
  if (!minutes) return null;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const segments: string[] = [];
  if (hrs) segments.push(`${hrs} h`);
  if (mins) segments.push(`${mins} min`);
  return segments.join(" ");
};

type RecipeCardProps = {
  recipe: GeneratedRecipe;
  onReset: () => void;
};

const RecipeCard = ({ recipe, onReset }: RecipeCardProps) => {
  const [copied, setCopied] = useState(false);

  const checklist = useMemo(
    () =>
      recipe.quickChecklist.map((item, index) => ({
        id: `${recipe.id}-check-${index}`,
        label: item,
      })),
    [recipe],
  );

  const printableText = useMemo(() => {
    const ingredientText = recipe.ingredientSections
      .map((section) => {
        const items = section.items
          .map((item) => `- ${item.name} : ${item.amount} ${item.unit}${item.note ? ` (${item.note})` : ""}`)
          .join("\n");
        return `## ${section.title}\n${items}`;
      })
      .join("\n\n");

    const equipmentText = recipe.equipment.map((item) => `- ${item}`).join("\n");
    const stepText = recipe.steps
      .map((step, index) => {
        const duration = formatDuration(step.durationMinutes);
        const temperature = step.temperature ? ` | Température : ${step.temperature}` : "";
        const timing = duration ? `⏱ ${duration}` : "";
        return `${index + 1}. ${step.title} — ${step.description}${timing || temperature ? ` (${[timing, temperature].filter(Boolean).join(" ")})` : ""}`;
      })
      .join("\n");

    const tips = recipe.chefTips.map((tip) => `- ${tip}`).join("\n");
    const conservation = `- Stockage : ${recipe.conservation.storage}\n- Durée : ${recipe.conservation.duration}\n- Congélation : ${recipe.conservation.freezing}\n- Service : ${recipe.conservation.service}`;
    const recap = checklist.map((item) => `- [ ] ${item.label}`).join("\n");

    return `Assistant Recette Pro\n${recipe.title} – ${recipe.servings} personnes\nCatégorie : ${recipe.category}\n\n${recipe.description}\n\nIngrédients\n${ingredientText}\n\nMatériel & équipement\n${equipmentText}\n\nPréparation\n${stepText}\n\nAstuces du chef\n${tips}\n\nConservation & service\n${conservation}\n\nRécapitulatif express\n${recap}`;
  }, [recipe, checklist]);

  const copyRecipe = async () => {
    try {
      await navigator.clipboard.writeText(printableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Impossible de copier la recette", error);
    }
  };

  const hasLongStep = recipe.steps.some((step) => (step.durationMinutes ?? 0) >= 60);

  return (
    <section className="card p-6 sm:p-10 space-y-8">
      <header className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand">Fiche technique</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            {recipe.title}
            <span className="ml-2 text-lg font-medium text-brand">({recipe.servings} pers.)</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{recipe.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand/60 hover:text-brand"
          >
            🖨️ Imprimer la recette
          </button>
          <button
            type="button"
            onClick={copyRecipe}
            className="rounded-full border border-brand/10 bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/20"
          >
            {copied ? "✅ Copié" : "📋 Copier"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand/60 hover:text-brand"
          >
            ⬅️ Revenir à l'accueil
          </button>
        </div>
      </header>

      {hasLongStep && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          ⏳ Certaines étapes dépassent 1 h. Programmez une alarme sur votre téléphone ou utilisez votre gestionnaire de
          production pour rester dans les temps.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="section-title">🧪 Ingrédients</h2>
          {recipe.ingredientSections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-800">{section.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {section.items.map((item) => (
                  <li key={`${section.title}-${item.name}`} className="flex justify-between gap-3">
                    <span>{item.name}</span>
                    <span className="text-right font-medium text-slate-800">
                      {item.amount.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} {item.unit}
                      {item.note ? <span className="ml-1 text-xs text-slate-500">({item.note})</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <h2 className="section-title">👩‍🍳 Matériel & équipement</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {recipe.equipment.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <h2 className="section-title">💡 Astuces du chef</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {recipe.chefTips.map((tip, index) => (
                <li key={`${recipe.id}-tip-${index}`} className="flex items-start gap-2">
                  <span>⭐</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <h2 className="section-title">🧊 Conservation & service</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <strong>Durée :</strong> {recipe.conservation.duration}
              </li>
              <li>
                <strong>Stockage :</strong> {recipe.conservation.storage}
              </li>
              <li>
                <strong>Congélation :</strong> {recipe.conservation.freezing}
              </li>
              <li>
                <strong>Service :</strong> {recipe.conservation.service}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-inner">
        <h2 className="section-title">📋 Préparation pas à pas</h2>
        <ol className="mt-4 space-y-6">
          {recipe.steps.map((step, index) => {
            const duration = formatDuration(step.durationMinutes);
            const isLong = (step.durationMinutes ?? 0) >= 60;
            return (
              <li key={`${recipe.id}-step-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                      {index + 1}
                    </span>
                    <p className="text-base font-semibold text-slate-900">{step.title}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                    {duration ? <span className="rounded-full bg-white px-3 py-1">⏱ {duration}</span> : null}
                    {step.temperature ? <span className="rounded-full bg-white px-3 py-1">🔥 {step.temperature}</span> : null}
                    {isLong ? <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">🔔 À programmer</span> : null}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="rounded-3xl border border-brand/20 bg-brand/5 p-6">
        <h2 className="section-title text-brand">✅ Récapitulatif express</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {checklist.map((item) => (
            <li key={item.id} className="flex items-start gap-3 rounded-2xl bg-white/80 p-3 text-sm text-slate-700 shadow">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-brand text-brand">
                ✓
              </span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default RecipeCard;
