'use client';

import { FormEvent, useState } from "react";
import EquipmentSelector from "./EquipmentSelector";
import type { RecipeInput } from "../lib/recipeGenerator";

type RecipeFormProps = {
  onGenerate: (input: RecipeInput) => void;
  isGenerating?: boolean;
};

const RecipeForm = ({ onGenerate, isGenerating }: RecipeFormProps) => {
  const [recipeType, setRecipeType] = useState("Croissant");
  const [servings, setServings] = useState(10);
  const [equipment, setEquipment] = useState<string[]>(["robot pâtissier", "four traditionnel"]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onGenerate({
      recipeType,
      servings: Number(servings) || 1,
      equipment,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Assistant Recette Pro</h2>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            Mode simulateur
          </span>
        </div>
        <p className="text-sm text-slate-600">
          Renseignez le type de préparation, le nombre de convives et le matériel disponible. Une fiche professionnelle sera
          générée instantanément.
        </p>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
          <strong className="font-semibold">Astuce débutant :</strong> pesez tout avant de commencer (principe de la mise en
          place) et gardez la fiche sous les yeux pour suivre les étapes sans stress.
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Quel type de recette voulez-vous ?</span>
          <input
            type="text"
            required
            placeholder="ex. pâte à pizza napolitaine"
            value={recipeType}
            onChange={(event) => setRecipeType(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <span className="text-xs text-slate-500">Exemples : baguette tradition, flan vanille, brioche filante…</span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Pour combien de personnes ?</span>
          <input
            type="number"
            min={1}
            max={200}
            value={servings}
            onChange={(event) => setServings(Number(event.target.value))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <span className="text-xs text-slate-500">Les grammages seront automatiquement recalculés.</span>
        </label>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Matériel utilisé</span>
        <EquipmentSelector value={equipment} onChange={setEquipment} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-2xl border border-brand/10 bg-brand/5 px-4 py-3 text-xs text-brand">
          💡 Astuce pro : ajoutez votre fiche au planning et programmez une alerte quand une étape dépasse 1 h.
        </div>
        <button type="submit" className="button-primary" disabled={isGenerating}>
          {isGenerating ? "Génération…" : "Générer la recette"}
        </button>
      </div>
    </form>
  );
};

export default RecipeForm;
