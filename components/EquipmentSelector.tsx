'use client';

import { useMemo } from "react";

export type EquipmentOption = {
  id: string;
  label: string;
  description: string;
};

type EquipmentSelectorProps = {
  value: string[];
  onChange: (next: string[]) => void;
};

const OPTIONS: EquipmentOption[] = [
  {
    id: "robot pâtissier",
    label: "Robot pâtissier",
    description: "Idéal pour pétrir sans effort et fouetter les appareils.",
  },
  {
    id: "four traditionnel",
    label: "Four traditionnel",
    description: "Chaleur tournante ou convection naturelle pour la majorité des cuissons.",
  },
  {
    id: "barbecue",
    label: "Barbecue",
    description: "Pour des cuissons fumées ou à chaleur indirecte.",
  },
  {
    id: "micro-ondes",
    label: "Micro-ondes",
    description: "Pratique pour fondre, réchauffer rapidement ou tempérer.",
  },
  {
    id: "pierre à pizza",
    label: "Pierre à pizza",
    description: "Accumule la chaleur pour une base croustillante.",
  },
  {
    id: "laminoir",
    label: "Laminoir",
    description: "Assure un laminage homogène et rapide.",
  },
  {
    id: "four à sole",
    label: "Four à sole",
    description: "Chaleur intense idéale pour pains et pizzas.",
  },
  {
    id: "batteur mélangeur",
    label: "Batteur mélangeur",
    description: "Production en plus grande quantité, bol inox gradué.",
  },
];

const EquipmentSelector = ({ value, onChange }: EquipmentSelectorProps) => {
  const selectedSet = useMemo(() => new Set(value), [value]);

  const toggleOption = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(value.filter((item) => item !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => {
          const isSelected = selectedSet.has(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleOption(option.id)}
              className={`group relative overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 ${
                isSelected
                  ? "border-brand bg-brand text-white shadow-soft"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand/50"
              }`}
            >
              <span>{option.label}</span>
              <span className="pointer-events-none absolute left-1/2 top-full z-10 w-56 -translate-x-1/2 translate-y-2 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs text-slate-600 opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        Astuce : combinez plusieurs équipements pour affiner l'organisation de la production.
      </p>
    </div>
  );
};

export default EquipmentSelector;
