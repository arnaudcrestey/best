'use client';

import { useMemo } from "react";
import type { GeneratedRecipe } from "../lib/recipeGenerator";

type HistoryEntry = {
  id: string;
  createdAt: string;
  recipe: GeneratedRecipe;
};

type HistoryPanelProps = {
  entries: HistoryEntry[];
  onSelect: (id: string) => void;
  onClear: () => void;
};

const HistoryPanel = ({ entries, onSelect, onClear }: HistoryPanelProps) => {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    [],
  );

  return (
    <aside className="card sticky top-8 flex h-fit flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Historique</h2>
          <p className="text-xs text-slate-500">Vos dernières fiches sont enregistrées localement sur cet appareil.</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
          disabled={!entries.length}
        >
          Effacer
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Aucune fiche pour le moment. Générez une recette pour commencer votre collection.
        </div>
      ) : (
        <ul className="space-y-3 text-sm text-slate-600">
          {entries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelect(entry.id)}
                className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left transition hover:border-brand/40 hover:shadow"
              >
                <p className="text-sm font-semibold text-slate-900">{entry.recipe.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatter.format(new Date(entry.createdAt))} • {entry.recipe.servings} pers.
                </p>
                <p className="mt-2 text-xs text-brand">
                  {entry.recipe.category} • {entry.recipe.equipment.slice(0, 2).join(", ")}
                  {entry.recipe.equipment.length > 2 ? "…" : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-2xl border border-brand/10 bg-brand/5 p-4 text-xs text-brand">
        ℹ️ Conseil : exportez votre recette en PDF après impression pour la partager à l'équipe.
      </div>
    </aside>
  );
};

export type { HistoryEntry };
export default HistoryPanel;
