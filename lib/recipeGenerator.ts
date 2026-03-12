export type RecipeInput = {
  recipeType: string;
  servings: number;
  equipment: string[];
};

export type Ingredient = {
  name: string;
  amount: number;
  unit: string;
  note?: string;
};

export type IngredientSection = {
  title: string;
  items: Ingredient[];
};

export type RecipeStep = {
  title: string;
  description: string;
  durationMinutes?: number;
  temperature?: string;
};

export type ConservationInfo = {
  storage: string;
  duration: string;
  freezing: string;
  service: string;
};

export type GeneratedRecipe = {
  id: string;
  title: string;
  servings: number;
  category: string;
  description: string;
  ingredientSections: IngredientSection[];
  equipment: string[];
  steps: RecipeStep[];
  chefTips: string[];
  conservation: ConservationInfo;
  quickChecklist: string[];
};

type BaseRecipeProfile = {
  id: string;
  category: string;
  keywords: string[];
  displayName: string;
  description: string;
  baseServings: number;
  ingredientSections: IngredientSection[];
  steps: RecipeStep[];
  equipment: string[];
  chefTips: string[];
  conservation: ConservationInfo;
  quickChecklist: string[];
};

const PROFILES: BaseRecipeProfile[] = [
  {
    id: "viennoiserie",
    category: "Viennoiserie",
    keywords: ["croissant", "pain au chocolat", "brioche", "kouign", "chausson"],
    displayName: "Croissants pur beurre",
    description:
      "Pâte levée feuilletée beurrée, lamination précise et cuisson dorée pour un résultat croustillant et fondant.",
    baseServings: 12,
    ingredientSections: [
      {
        title: "Détrempe",
        items: [
          { name: "Farine T45", amount: 500, unit: "g" },
          { name: "Eau froide", amount: 260, unit: "ml" },
          { name: "Lait entier", amount: 60, unit: "ml" },
          { name: "Levure boulangère fraîche", amount: 25, unit: "g" },
          { name: "Sucre", amount: 50, unit: "g" },
          { name: "Sel fin", amount: 10, unit: "g" },
          { name: "Beurre pommade", amount: 40, unit: "g" },
        ],
      },
      {
        title: "Tourage",
        items: [{ name: "Beurre de tourage", amount: 250, unit: "g", note: "bien froid" }],
      },
      {
        title: "Dorure",
        items: [{ name: "Œufs", amount: 2, unit: "pcs", note: "battus avec une pincée de sel" }],
      },
    ],
    steps: [
      {
        title: "Pétrissage de la détrempe",
        description:
          "Mélanger farine, sucre et sel, incorporer liquides puis levure, et pétrir en vitesse moyenne jusqu'à obtention d'une pâte lisse.",
        durationMinutes: 15,
        temperature: "24 °C",
      },
      {
        title: "Pointage",
        description: "Former une boule, filmer au contact et laisser pousser jusqu'à 50 % de volume.",
        durationMinutes: 45,
        temperature: "24 °C",
      },
      {
        title: "Repos au froid",
        description: "Dégazer légèrement, abaisser en rectangle, filmer serré et réserver au froid.",
        durationMinutes: 120,
        temperature: "4 °C",
      },
      {
        title: "Tourage",
        description:
          "Envelopper le beurre dans la détrempe, réaliser deux tours simples puis un tour double en respectant les temps de repos au froid.",
        durationMinutes: 90,
        temperature: "4 °C",
      },
      {
        title: "Façonnage",
        description: "Abaisser à 3 mm, découper triangles, rouler en croissants et disposer sur plaques.",
        durationMinutes: 25,
      },
      {
        title: "Pousse finale",
        description: "Laisser lever sous cloche ou en étuve jusqu'à 1,5 fois le volume.",
        durationMinutes: 90,
        temperature: "26 – 28 °C",
      },
      {
        title: "Cuisson",
        description: "Dorer deux fois, enfourner sur plaque chaude et cuire jusqu'à coloration ambrée.",
        durationMinutes: 18,
        temperature: "200 °C",
      },
    ],
    equipment: [
      "Laminoir ou rouleau", "Thermomètre sonde", "Plaques perforées", "Papier cuisson", "Chambre de pousse ou four à basse température",
    ],
    chefTips: [
      "Préparer un beurre de tourage bien rectangulaire pour un laminage régulier.",
      "Ne pas dépasser 26 °C au pétrissage pour préserver le feuilletage.",
      "Vaporiser légèrement les croissants d'eau avant pousse pour éviter le dessèchement.",
    ],
    conservation: {
      storage: "Boîte hermétique ou sac à pain perforé",
      duration: "24 h à température ambiante, 48 h au froid",
      freezing: "Congélation possible après cuisson et complet refroidissement",
      service: "Régénérer 4 min à 170 °C pour retrouver le croustillant",
    },
    quickChecklist: [
      "Pesée précise de tous les ingrédients",
      "Respect des temps de repos au froid",
      "Tours réalisés en angle droit et régulièrement",
      "Croissants alignés et espacés sur plaque",
      "Pousse finale contrôlée (pas de beurre qui fuit)",
    ],
  },
  {
    id: "boulangerie",
    category: "Boulangerie",
    keywords: ["baguette", "pain", "levain", "campagne", "tradition"],
    displayName: "Baguette de tradition",
    description: "Pâte à pain à fermentation contrôlée avec bassinage progressif et cuisson vapeur.",
    baseServings: 4,
    ingredientSections: [
      {
        title: "Pâte",
        items: [
          { name: "Farine T65", amount: 500, unit: "g" },
          { name: "Eau", amount: 350, unit: "ml" },
          { name: "Levure fraîche", amount: 12, unit: "g" },
          { name: "Sel", amount: 10, unit: "g" },
        ],
      },
      {
        title: "Finition",
        items: [{ name: "Farine de saupoudrage", amount: 15, unit: "g" }],
      },
    ],
    steps: [
      {
        title: "Autolyse",
        description: "Mélanger farine et 90 % d'eau, laisser reposer couvert.",
        durationMinutes: 30,
      },
      {
        title: "Pétrissage",
        description: "Incorporer levure et sel, pétrir puis ajouter progressivement l'eau restante.",
        durationMinutes: 12,
        temperature: "23 °C",
      },
      {
        title: "Pointage",
        description: "Laisser pousser, réaliser deux rabats espacés de 30 min.",
        durationMinutes: 120,
        temperature: "24 °C",
      },
      {
        title: "Division et détente",
        description: "Diviser, bouler légèrement et laisser détendre sous film.",
        durationMinutes: 20,
      },
      {
        title: "Façonnage",
        description: "Façonner en baguettes serrées et placer dans un couchage fariné.",
        durationMinutes: 15,
      },
      {
        title: "Apprêt",
        description: "Laisser pousser jusqu'à 70 % d'augmentation de volume.",
        durationMinutes: 45,
        temperature: "26 °C",
      },
      {
        title: "Scarification et cuisson",
        description: "Grigner avec lame, cuire avec vapeur en sole bien chaude.",
        durationMinutes: 22,
        temperature: "245 °C",
      },
    ],
    equipment: [
      "Cul-de-poule", "Coupe pâte", "Lame de boulanger", "Pierre ou plaque réfractaire", "Générateur de vapeur ou lèchefrite",
    ],
    chefTips: [
      "Utiliser une farine riche en protéines pour une meilleure tenue.",
      "Humidifier légèrement le four avant d'enfourner pour un croustillant optimal.",
      "Effectuer un pointage au froid pour développer les arômes si possible.",
    ],
    conservation: {
      storage: "Sac en lin ou torchon",
      duration: "24 h pour un croustillant optimal",
      freezing: "Congeler dès refroidissement, régénérer 8 min à 200 °C",
      service: "Servir tiède pour sublimer la croûte",
    },
    quickChecklist: [
      "Température de pâte à 24 °C",
      "Deux rabats effectués",
      "Baguettes bien soudées",
      "Scarification nette et régulière",
      "Vapeur présente au four",
    ],
  },
  {
    id: "patisserie",
    category: "Pâtisserie",
    keywords: ["flan", "tarte", "entremets", "mousse", "cheesecake"],
    displayName: "Flan parisien vanille",
    description:
      "Appareil crémeux infusé à la vanille, pâte sucrée croustillante et cuisson maîtrisée pour une texture fondante.",
    baseServings: 8,
    ingredientSections: [
      {
        title: "Pâte sucrée",
        items: [
          { name: "Farine T55", amount: 250, unit: "g" },
          { name: "Beurre doux", amount: 125, unit: "g" },
          { name: "Sucre glace", amount: 90, unit: "g" },
          { name: "Poudre d'amande", amount: 30, unit: "g" },
          { name: "Œuf entier", amount: 1, unit: "pcs" },
          { name: "Sel fin", amount: 2, unit: "g" },
        ],
      },
      {
        title: "Appareil à flan",
        items: [
          { name: "Lait entier", amount: 800, unit: "ml" },
          { name: "Crème liquide 35 %", amount: 200, unit: "ml" },
          { name: "Sucre", amount: 180, unit: "g" },
          { name: "Jaunes d'œufs", amount: 6, unit: "pcs" },
          { name: "Maïzena", amount: 80, unit: "g" },
          { name: "Gousse de vanille", amount: 1, unit: "pcs", note: "grains grattés" },
        ],
      },
    ],
    steps: [
      {
        title: "Pâte sucrée",
        description: "Crémer beurre et sucre, ajouter poudre d'amande, œuf puis farine et sel, fraiser et filmer.",
        durationMinutes: 20,
      },
      {
        title: "Repos pâte",
        description: "Réserver la pâte au froid avant fonçage.",
        durationMinutes: 60,
        temperature: "4 °C",
      },
      {
        title: "Fonçage",
        description: "Abaisser, foncer un cercle de 22 cm, piquer et remettre au froid.",
        durationMinutes: 25,
      },
      {
        title: "Appareil",
        description:
          "Bouillir lait, crème et vanille, verser sur mélange jaunes, sucre et maïzena puis cuire comme une crème pâtissière.",
        durationMinutes: 15,
        temperature: "82 °C",
      },
      {
        title: "Cuisson",
        description: "Verser appareil, cuire jusqu'à surface bien caramélisée.",
        durationMinutes: 45,
        temperature: "180 °C",
      },
      {
        title: "Refroidissement",
        description: "Laisser reposer 4 h minimum avant découpe pour fixer la texture.",
        durationMinutes: 240,
        temperature: "4 °C",
      },
    ],
    equipment: [
      "Robot pâtissier ou batteur", "Cercle à tarte haut", "Thermomètre laser ou sonde", "Maryse", "Plaque perforée et tapis micro-perforé",
    ],
    chefTips: [
      "Foncer sur pâte très froide pour éviter le retrait à la cuisson.",
      "Mixer l'appareil avant cuisson pour éliminer les grumeaux.",
      "Cuire en chaleur tournante puis 5 min en grill pour une coloration maîtrisée.",
    ],
    conservation: {
      storage: "Au réfrigérateur dans une boîte hermétique",
      duration: "48 h maximum",
      freezing: "Déconseillée pour préserver la texture",
      service: "Servir à 8 °C pour une tenue idéale",
    },
    quickChecklist: [
      "Pâte bien reposée",
      "Fonçage régulier",
      "Appareil lisse sans grumeaux",
      "Cuisson à cœur contrôlée",
      "Repos complet avant service",
    ],
  },
  {
    id: "pizza",
    category: "Pizza & snacking",
    keywords: ["pizza", "focaccia", "pinsa", "pate", "napolitaine"],
    displayName: "Pâte à pizza artisanale",
    description: "Hydratation élevée, fermentation longue et cuisson vive pour une pâte alvéolée et digeste.",
    baseServings: 4,
    ingredientSections: [
      {
        title: "Pâte",
        items: [
          { name: "Farine spéciale pizza", amount: 500, unit: "g" },
          { name: "Eau", amount: 325, unit: "ml" },
          { name: "Levure fraîche", amount: 5, unit: "g" },
          { name: "Sel", amount: 12, unit: "g" },
          { name: "Huile d'olive", amount: 20, unit: "ml" },
        ],
      },
      {
        title: "Garniture de base",
        items: [
          { name: "Pulpe de tomate", amount: 320, unit: "g" },
          { name: "Mozzarella fior di latte", amount: 300, unit: "g" },
          { name: "Basilic frais", amount: 6, unit: "feuilles" },
          { name: "Huile d'olive", amount: 15, unit: "ml" },
        ],
      },
    ],
    steps: [
      {
        title: "Mise en place",
        description: "Mélanger farine et eau, laisser reposer 20 min (autolyse).",
        durationMinutes: 20,
      },
      {
        title: "Pétrissage",
        description: "Ajouter levure puis sel et huile, pétrir jusqu'à pâte lisse et élastique.",
        durationMinutes: 10,
        temperature: "24 °C",
      },
      {
        title: "Pointage",
        description: "Laisser pousser 1 h à température ambiante puis 18 h au froid.",
        durationMinutes: 1140,
        temperature: "4 °C",
      },
      {
        title: "Boulage",
        description: "Diviser en pâtons de 250 g, bouler serré et reposer 2 h.",
        durationMinutes: 120,
      },
      {
        title: "Façonnage",
        description: "Étaler délicatement à la main sans dégazer les bords.",
        durationMinutes: 15,
      },
      {
        title: "Garnissage & cuisson",
        description: "Garnir légèrement, cuire sur pierre bien chaude ou dans four à pizza.",
        durationMinutes: 8,
        temperature: "320 °C (ou maximum four domestique)",
      },
    ],
    equipment: [
      "Bac de fermentation", "Raclette à pizza", "Pierre ou acier", "Pelle à enfourner", "Boîtes de stockage pâtons",
    ],
    chefTips: [
      "Sortir les pâtons 2 h avant cuisson pour revenir à 18 °C.",
      "Hydrater légèrement les bords pour une corniche bien développée.",
      "Cuire sur pierre préchauffée minimum 45 min.",
    ],
    conservation: {
      storage: "Pâtons au froid, filmés individuellement",
      duration: "48 h pour une fermentation maîtrisée",
      freezing: "Pâtons crus congelables 1 mois",
      service: "Servir immédiatement après cuisson, huiler légèrement la corniche",
    },
    quickChecklist: [
      "Pâtons détendus",
      "Four/pierre préchauffés",
      "Garnissage équilibré",
      "Cuisson rapide et vive",
      "Repos 2 min sur grille avant service",
    ],
  },
];

const DEFAULT_PROFILE: BaseRecipeProfile = {
  id: "signature",
  category: "Création maison",
  keywords: [],
  displayName: "Recette signature",
  description:
    "Base professionnelle modulable : structurez votre recette en étapes nettes et ingrédients pesés.",
  baseServings: 6,
  ingredientSections: [
    {
      title: "Préparation principale",
      items: [
        { name: "Ingrédient de base", amount: 400, unit: "g" },
        { name: "Liquide", amount: 220, unit: "ml" },
        { name: "Agent levant ou liant", amount: 12, unit: "g" },
        { name: "Assaisonnement", amount: 8, unit: "g" },
      ],
    },
    {
      title: "Finitions",
      items: [
        { name: "Element aromatique", amount: 30, unit: "g" },
        { name: "Garniture", amount: 120, unit: "g" },
      ],
    },
  ],
  steps: [
    {
      title: "Organisation",
      description:
        "Mettre en place le poste de travail, peser tous les ingrédients et préparer le matériel.",
      durationMinutes: 15,
    },
    {
      title: "Mélange",
      description: "Réaliser l'appareil principal en respectant l'ordre d'incorporation professionnel.",
      durationMinutes: 20,
    },
    {
      title: "Repos ou pousse",
      description: "Adapter le temps de repos selon la texture recherchée.",
      durationMinutes: 60,
    },
    {
      title: "Cuisson / Finition",
      description: "Cuire ou dresser en contrôlant texture, température et esthétique.",
      durationMinutes: 30,
    },
  ],
  equipment: ["Balance de précision", "Maryse", "Thermomètre", "Plaques ou moules adaptés"],
  chefTips: [
    "Respecter l'ordre des pesées pour gagner en efficacité.",
    "Noter chaque variation pour consolider votre fiche technique.",
    "Privilégier des ingrédients de même température pour une émulsion stable.",
  ],
  conservation: {
    storage: "Conditionnement hermétique adapté",
    duration: "Selon la préparation : vérifier l'activité de l'eau",
    freezing: "Tester la congélation sur petite quantité avant production",
    service: "Mettre en température juste avant service",
  },
  quickChecklist: [
    "Mise en place complète",
    "Contrôle texture et cuisson",
    "Nettoyage poste de travail",
    "Etiquetage et traçabilité",
  ],
};

const EQUIPMENT_TIPS: Record<string, string> = {
  "robot pâtissier":
    "Utiliser le crochet pour les pâtes levées et la feuille pour les appareils crémeux, ne pas dépasser vitesse 2 pour préserver le réseau glutineux.",
  "four traditionnel":
    "Préchauffer 30 min à l'avance et utiliser une pierre ou plaque épaisse pour une chaleur plus stable.",
  barbecue:
    "Privilégier la cuisson indirecte avec couvercle fermé et surveiller la température avec une sonde.",
  "micro-ondes":
    "Utiliser en mode décongélation douce ou pour liquéfier des préparations, jamais pour dorer.",
  "pierre à pizza":
    "Préchauffer la pierre au moins 45 min pour garantir un choc thermique efficace.",
  "four à sole":
    "Enfourner avec coup de buée pour favoriser le développement et la coloration.",
  "batteur mélangeur":
    "Racler régulièrement la cuve pour une émulsion homogène.",
  "laminoir":
    "Fariner légèrement les bords et alterner sens de passage pour un laminage uniforme.",
};

const formatTitle = (value: string) => {
  if (!value) return "Recette signature";
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const interpolate = (text: string, replacements: Record<string, string>) => {
  return text.replace(/\{\{(.*?)\}\}/g, (_, key) => replacements[key.trim()] ?? "");
};

const scaleAmount = (amount: number, factor: number) => {
  const scaled = amount * factor;
  if (scaled >= 100) {
    return Math.round(scaled);
  }
  if (scaled >= 10) {
    return Math.round(scaled * 10) / 10;
  }
  return Math.round(scaled * 100) / 100;
};

const findProfile = (recipeType: string): BaseRecipeProfile => {
  const normalized = recipeType.toLowerCase();
  for (const profile of PROFILES) {
    if (profile.keywords.some((keyword) => normalized.includes(keyword))) {
      return profile;
    }
  }
  return DEFAULT_PROFILE;
};

export const generateRecipe = (input: RecipeInput): GeneratedRecipe => {
  const { recipeType, servings, equipment } = input;
  const safeServings = Math.max(1, servings || DEFAULT_PROFILE.baseServings);
  const profile = findProfile(recipeType || DEFAULT_PROFILE.displayName);
  const factor = safeServings / profile.baseServings;
  const recipeTitle = formatTitle(recipeType || profile.displayName);

  const ingredientSections = profile.ingredientSections.map((section) => ({
    title: section.title,
    items: section.items.map((item) => ({
      ...item,
      amount: scaleAmount(item.amount, factor),
    })),
  }));

  const replacements = {
    recipe: recipeTitle,
    category: profile.category,
  };

  const steps = profile.steps.map((step) => ({
    ...step,
    description: interpolate(step.description, replacements),
    title: interpolate(step.title, replacements),
  }));

  const baseTips = profile.chefTips.map((tip) => interpolate(tip, replacements));

  const extraTips = equipment
    .map((item) => EQUIPMENT_TIPS[item.toLowerCase()])
    .filter((tip): tip is string => Boolean(tip));

  const uniqueEquipment = Array.from(
    new Set([
      ...profile.equipment,
      ...equipment.map((item) => formatTitle(item)),
    ]),
  );

  const quickChecklist = profile.quickChecklist.map((item) => interpolate(item, replacements));

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: recipeTitle,
    servings: safeServings,
    category: profile.category,
    description: profile.description,
    ingredientSections,
    equipment: uniqueEquipment,
    steps,
    chefTips: [...baseTips, ...extraTips],
    conservation: profile.conservation,
    quickChecklist,
  };
};
