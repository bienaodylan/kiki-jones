import { AudienceSlug } from '../types/commerce';

export interface ClassificationOption<T extends string = string> {
  value: T;
  labelFr: string;
  labelEn: string;
}

export interface BrandOption {
  slug: string;
  name: string;
  labelFr: string;
  labelEn: string;
}

export interface ProductClassificationInput {
  name?: string;
  description?: string;
  categoryName?: string;
  categoryId?: string;
  isNewDrop?: boolean;
  isFeatured?: boolean;
}

export interface ProductClassificationResult {
  audience: AudienceSlug;
  subCategory: string;
  brandSlug: string;
  brandName: string;
  collectionSlugs: string[];
}

export const AUDIENCE_OPTIONS: ClassificationOption<AudienceSlug>[] = [
  { value: 'women', labelFr: 'Femme', labelEn: 'Women' },
  { value: 'men', labelFr: 'Homme', labelEn: 'Men' },
  { value: 'girls', labelFr: 'Filles', labelEn: 'Girls' },
  { value: 'boys', labelFr: 'Garçons', labelEn: 'Boys' },
  { value: 'unisex', labelFr: 'Accessoires / Unisexe', labelEn: 'Accessories / Unisex' },
];

export const SUBCATEGORY_OPTIONS: ClassificationOption[] = [
  { value: 'dresses', labelFr: 'Robes & Jupes', labelEn: 'Dresses & Skirts' },
  { value: 'matching-sets', labelFr: 'Ensembles', labelEn: 'Matching Sets' },
  { value: 'tops', labelFr: 'Hauts, Corsets & Bodys', labelEn: 'Tops, Corsets & Bodysuits' },
  { value: 'jumpsuits', labelFr: 'Combinaisons & Combi-shorts', labelEn: 'Jumpsuits & Rompers' },
  { value: 'shirts', labelFr: 'Chemises & Polos', labelEn: 'Shirts & Polos' },
  { value: 'jeans', labelFr: 'Jeans & Denim', labelEn: 'Jeans & Denim' },
  { value: 'pants', labelFr: 'Pantalons & Cargos', labelEn: 'Pants & Cargos' },
  { value: 'bottoms', labelFr: 'Shorts & Jorts', labelEn: 'Shorts & Jorts' },
  { value: 'activewear', labelFr: 'Sport & Activewear', labelEn: 'Activewear & Sport' },
  { value: 'shoes', labelFr: 'Chaussures & Talons', labelEn: 'Shoes & Heels' },
  { value: 'bags', labelFr: 'Sacs & Pochettes', labelEn: 'Bags & Clutches' },
  { value: 'sunglasses', labelFr: 'Lunettes de soleil', labelEn: 'Sunglasses' },
  { value: 'jewelry', labelFr: 'Bijoux & Montres', labelEn: 'Jewelry & Watches' },
];

export const BRAND_OPTIONS: BrandOption[] = [
  { slug: 'kiki-luxe', name: 'Kiki Jones Premium', labelFr: 'Kiki Jones Premium (Soirée & Chic)', labelEn: 'Kiki Jones Premium (Evening & Premium)' },
  { slug: 'kiki-men', name: 'Kiki Men', labelFr: 'Kiki Men (Homme)', labelEn: 'Kiki Men (Menswear)' },
  { slug: 'kiki-sculpt', name: 'Kiki Sculpt', labelFr: 'Kiki Sculpt (Sculptant & Corsets)', labelEn: 'Kiki Sculpt (Sculpt & Shapewear)' },
  { slug: 'kiki-curve', name: 'Kiki Curve', labelFr: 'Kiki Curve (Courbes & Lounge)', labelEn: 'Kiki Curve (Curve & Lounge)' },
  { slug: 'kiki-sport', name: 'Kiki Sport', labelFr: 'Kiki Sport (Activewear)', labelEn: 'Kiki Sport (Activewear)' },
  { slug: 'kiki-kids', name: 'Kiki Kids', labelFr: 'Kiki Kids (Filles & Garçons)', labelEn: 'Kiki Kids (Girls & Boys)' },
];

export const COLLECTION_OPTIONS: ClassificationOption[] = [
  { value: 'kiki-jones-doupi', labelFr: 'Kiki Jones Doupi (Atelier 3D · Premium)', labelEn: 'Kiki Jones Doupi (3D Atelier · Premium)' },
  { value: 'after-dark', labelFr: 'After Dark (Soirée)', labelEn: 'After Dark (Evening)' },
  { value: 'formal', labelFr: 'Gala & Cérémonie', labelEn: 'Formal & Gala' },
  { value: 'sport', labelFr: 'Sport & Studio', labelEn: 'Sport & Studio' },
  { value: 'essentials', labelFr: 'Les Essentiels', labelEn: 'Essentials' },
  { value: 'street-collection', labelFr: 'Streetwear', labelEn: 'Street Collection' },
  { value: 'summer-drop', labelFr: 'Drop Été & Soleil', labelEn: 'Summer Drop' },
  { value: 'exclusive-drop', labelFr: 'Drop Exclusif', labelEn: 'Exclusive Drop' },
];

/**
 * Bilingual (FR + EN) keyword aliases used by storefront mega-menu sub-routes.
 * All values are normalized (lowercase, no accents).
 */
export const SUBCATEGORY_ALIASES: Record<string, string[]> = {
  tops: [
    'top', 'haut', 'corset', 'bustier', 'body', 'bodysuit', 'tee', 't-shirt', 'tshirt',
    'debardeur', 'marcel', 'caraco', 'crop', 'knit', 'maille', 'pull', 'cardigan', 'gilet',
    'blouse', 'shirt', 'chemise', 'chemisier', 'sweat', 'hoodie', 'tank', 'camisole', 'halter',
  ],
  't-shirts': [
    'tee', 't-shirt', 'tshirt', 'jersey', 'maillot', 'polo', 'debardeur', 'muscle', 'tank', 'marcel',
  ],
  polos: ['polo', 'knit polo', 'polo maille', 'shirt', 'chemise', 'chemisette', 'tee'],
  shirts: [
    'shirt', 'chemise', 'chemisette', 'chemisier', 'poplin', 'popeline', 'overshirt',
    'surchemise', 'blouse', 'tunique', 'polo', 'satin', 'camp',
  ],
  blouses: ['blouse', 'chemisier', 'chemise', 'shirt', 'top', 'haut', 'tunique'],
  dresses: [
    'dress', 'robe', 'robette', 'gown', 'robe longue', 'robe courte', 'robe midi',
    'slip', 'nuisette', 'kaftan', 'caftan', 'skirt', 'jupe', 'bodycon', 'sundress',
  ],
  jumpsuits: [
    'romper', 'jumpsuit', 'playsuit', 'catsuit', 'combinaison', 'combishort', 'combi-short',
    'combi', 'salopette',
  ],
  activewear: [
    'biker', 'sport', 'active', 'activewear', 'tricot', 'seamless', 'fitness', 'gym',
    'yoga', 'running', 'legging', 'cycliste', 'brassiere', 'jogging', 'survetement', 'tracksuit',
  ],
  bottoms: [
    'jort', 'short', 'bermuda', 'skirt', 'jupe', 'micro', 'mini short', 'bas',
  ],
  jeans: ['jean', 'denim', 'stacked', 'baggy denim'],
  pants: [
    'pant', 'pantalon', 'trouser', 'cargo', 'chino', 'jogger', 'palazzo', 'flare',
    'jean', 'denim', 'slacks',
  ],
  shorts: ['short', 'jort', 'biker', 'bermuda', 'cycliste'],
  skirts: ['skirt', 'jupe', 'minijupe', 'mini-jupe', 'dress', 'robe'],
  'matching-sets': [
    'set', 'co-ord', 'coord', 'suit', 'ensemble', 'tailleur', 'costume',
    '2 pieces', 'deux pieces', 'two piece', 'duo',
  ],
  shoes: [
    'shoe', 'chaussure', 'heel', 'talon', 'pump', 'escarpin', 'loafer', 'mocassin',
    'sneaker', 'basket', 'sandal', 'sandale', 'stiletto', 'boot', 'botte', 'bottine',
    'mule', 'claquette', 'slide', 'derby',
  ],
  bags: [
    'bag', 'sac', 'tote', 'cabas', 'crossbody', 'bandouliere', 'backpack', 'sac a dos',
    'clutch', 'pochette', 'sacoche', 'banane', 'handbag', 'purse', 'besace',
  ],
  sunglasses: [
    'sunglass', 'lunette', 'solaire', 'frame', 'monture', 'eyewear', 'glasses', 'shades',
  ],
  jewelry: [
    'jewelry', 'jewellery', 'bijou', 'chain', 'chaine', 'ring', 'bague', 'bracelet',
    'earring', 'boucle', 'creole', 'collier', 'necklace', 'pendentif', 'montre', 'watch',
  ],
  watches: ['watch', 'montre', 'chrono', 'horlogerie'],
};

export function normalizeText(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasKeyword(normalizedText: string, keywords: string[]): boolean {
  if (!normalizedText) return false;
  for (const rawKw of keywords) {
    const kw = normalizeText(rawKw);
    if (!kw) continue;
    if (kw.includes(' ') || kw.includes('-')) {
      const pattern = new RegExp(`(^|[\\s-])${escapeRegExp(kw)}(s|x|es)?($|[\\s-])`);
      if (pattern.test(normalizedText)) return true;
    } else {
      const pattern = new RegExp(`(^|[\\s-])${escapeRegExp(kw)}(s|x|es)?($|[\\s-])`);
      if (pattern.test(normalizedText)) return true;
    }
  }
  return false;
}

export function getBrandNameBySlug(slug?: string): string {
  const found = BRAND_OPTIONS.find((b) => b.slug === slug);
  return found ? found.name : 'Kiki Jones Premium';
}

/**
 * Bilingual (French + English) automatic product classifier.
 * Inspects category, title, and description to infer Audience, Sub-Category,
 * KIKI JONES Brand Line, and Editorial Collections.
 */
export function classifyProductBilingual(
  input: ProductClassificationInput
): ProductClassificationResult {
  const catText = normalizeText(`${input.categoryName || ''} ${input.categoryId || ''}`);
  const titleText = normalizeText(input.name || '');
  const descText = normalizeText(input.description || '');
  const fullText = normalizeText(`${titleText} ${descText}`);
  const allText = normalizeText(`${catText} ${fullText}`);

  // 1. Detect Sub-Category (check title first for precision, then full text)
  const detectSubCategory = (text: string): string | null => {
    if (
      hasKeyword(text, [
        'chaussure', 'talon', 'escarpin', 'sandale', 'basket', 'sneaker', 'mocassin',
        'botte', 'bottine', 'mule', 'claquette', 'tong', 'derby', 'derbies', 'richelieu',
        'heel', 'pump', 'loafer', 'shoe', 'sandal', 'stiletto', 'boot', 'slide', 'footwear',
      ])
    ) {
      return 'shoes';
    }
    if (
      hasKeyword(text, [
        'lunette', 'solaire', 'monture', 'sunglass', 'eyewear', 'shades', 'glasses',
      ])
    ) {
      return 'sunglasses';
    }
    if (
      hasKeyword(text, [
        'sac', 'sacoche', 'pochette', 'cabas', 'bandouliere', 'sac a dos', 'sac a main',
        'besace', 'miniaudiere', 'bag', 'clutch', 'tote', 'crossbody', 'handbag',
        'purse', 'backpack', 'satchel',
      ])
    ) {
      return 'bags';
    }
    if (
      hasKeyword(text, [
        'bijou', 'collier', 'chaine', 'bracelet', 'bague', 'boucle d oreille', 'boucles d oreilles',
        'creole', 'pendentif', 'montre', 'parure', 'earring', 'necklace', 'chain', 'ring',
        'watch', 'jewelry', 'jewellery', 'anklet',
      ])
    ) {
      return 'jewelry';
    }
    if (
      hasKeyword(text, [
        'activewear', 'sport', 'sportwear', 'sportswear', 'fitness', 'gym', 'yoga', 'running',
        'jogging', 'survetement', 'legging', 'cycliste', 'brassiere', 'biker', 'seamless',
        'athletic', 'workout', 'training', 'tracksuit', 'active',
      ])
    ) {
      return 'activewear';
    }
    if (
      hasKeyword(text, [
        'combinaison', 'combishort', 'combi-short', 'combi', 'salopette',
        'jumpsuit', 'romper', 'playsuit', 'catsuit', 'onesie', 'overall',
      ])
    ) {
      return 'jumpsuits';
    }
    if (
      hasKeyword(text, [
        'ensemble', 'co-ord', 'coord', '2 pieces', 'deux pieces', '2-piece', 'two piece',
        'matching set', 'set', 'tailleur', 'costume', 'suit', 'duo',
      ])
    ) {
      return 'matching-sets';
    }
    if (
      hasKeyword(text, [
        'robe', 'robette', 'jupe', 'minijupe', 'mini-jupe', 'mini-robe', 'maxi-robe',
        'nuisette', 'caftan', 'kaftan', 'dress', 'gown', 'skirt', 'sundress', 'slip dress',
        'bodycon', 'pareo', 'sarong',
      ])
    ) {
      return 'dresses';
    }
    if (hasKeyword(text, ['jean', 'denim'])) {
      return 'jeans';
    }
    if (hasKeyword(text, ['jort', 'bermuda', 'micro short', 'mini short', 'short'])) {
      return 'bottoms';
    }
    if (
      hasKeyword(text, [
        'pantalon', 'cargo', 'chino', 'jogger', 'palazzo', 'flare', 'pant', 'trouser', 'slacks',
      ])
    ) {
      return 'pants';
    }
    if (
      hasKeyword(text, [
        'chemise', 'chemisette', 'chemisier', 'polo', 'surchemise', 'blouse', 'tunique',
        'shirt', 'overshirt', 'button-down', 'button up', 'camp shirt', 'resort shirt', 'poplin', 'popeline',
      ])
    ) {
      return 'shirts';
    }
    if (
      hasKeyword(text, [
        'haut', 'top', 'corset', 'bustier', 'body', 'bodysuit', 't-shirt', 'tshirt', 'tee',
        'debardeur', 'marcel', 'caraco', 'crop top', 'pull', 'maille', 'gilet', 'cardigan',
        'sweat', 'hoodie', 'maillot', 'jersey', 'tank', 'camisole', 'halter', 'tube top', 'knit',
      ])
    ) {
      return 'tops';
    }
    return null;
  };

  const subCategory = detectSubCategory(titleText) || detectSubCategory(fullText) || 'tops';

  // 2. Detect Audience (Category takes highest priority, then title/description clues)
  const detectAudience = (): AudienceSlug => {
    const isGirlsCat =
      catText.includes('cat_girls') ||
      hasKeyword(catText, ['fille', 'ado fille', 'jeune fille', 'girl', 'teen girl']);
    if (isGirlsCat) return 'girls';

    const isBoysCat =
      catText.includes('cat_boys') ||
      hasKeyword(catText, ['garcon', 'ado garcon', 'jeune garcon', 'boy', 'teen boy']);
    if (isBoysCat) return 'boys';

    const isWomenCat =
      catText.includes('cat_women') ||
      hasKeyword(catText, ['femme', 'feminin', 'women', 'woman', 'womenswear', 'dame']);
    if (isWomenCat) return 'women';

    const isMenCat =
      catText.includes('cat_men') ||
      hasKeyword(catText, ['homme', 'masculin', 'men', 'man', 'menswear']);
    if (isMenCat) return 'men';

    const isAccCat =
      catText.includes('cat_accessories') ||
      hasKeyword(catText, ['accessoire', 'accessory', 'accessories', 'unisexe', 'unisex', 'bijou', 'sac', 'lunette']);
    if (isAccCat) return 'unisex';

    // Check title & description if category is generic (e.g., "New Arrivals", "Clothing", "Nouveautés")
    if (hasKeyword(fullText, ['fille', 'jeune fille', 'ado fille', 'girl', 'teen girl'])) {
      return 'girls';
    }
    if (hasKeyword(fullText, ['garcon', 'jeune garcon', 'ado garcon', 'boy', 'teen boy'])) {
      return 'boys';
    }
    if (hasKeyword(fullText, ['homme', 'masculin', 'men', 'menswear'])) {
      return 'men';
    }
    if (hasKeyword(fullText, ['femme', 'feminin', 'women', 'womenswear'])) {
      return 'women';
    }
    if (['bags', 'sunglasses', 'jewelry'].includes(subCategory)) {
      return 'unisex';
    }
    if (['dresses', 'jumpsuits'].includes(subCategory)) {
      return 'women';
    }
    return 'women';
  };

  const audience = detectAudience();

  // 3. Detect Brand Line
  let brandSlug = 'kiki-luxe';
  if (
    subCategory === 'activewear' ||
    hasKeyword(allText, ['kiki sport', 'sport', 'fitness', 'gym', 'yoga', 'running', 'seamless', 'activewear'])
  ) {
    brandSlug = 'kiki-sport';
  } else if (
    audience === 'girls' ||
    audience === 'boys' ||
    hasKeyword(allText, ['kiki kids', 'enfant', 'junior', 'kids', 'ado'])
  ) {
    brandSlug = 'kiki-kids';
  } else if (audience === 'men' || hasKeyword(allText, ['kiki men', 'menswear'])) {
    brandSlug = 'kiki-men';
  } else if (
    hasKeyword(allText, ['kiki curve', 'curve', 'curvy', 'grande taille', 'plus size', 'lounge', 'confort'])
  ) {
    brandSlug = 'kiki-curve';
  } else if (
    hasKeyword(allText, [
      'kiki sculpt', 'sculpt', 'sculptant', 'gainant', 'corset', 'bustier',
      'body', 'bodysuit', 'bodycon', 'moulant', 'jort', 'sneaker', 'basket',
    ])
  ) {
    brandSlug = 'kiki-sculpt';
  } else {
    brandSlug = 'kiki-luxe';
  }

  const brandName = getBrandNameBySlug(brandSlug);

  // 4. Detect Editorial Collections (multi-tag)
  const collections = new Set<string>();

  if (
    subCategory === 'activewear' ||
    brandSlug === 'kiki-sport' ||
    hasKeyword(allText, ['sport', 'gym', 'yoga', 'fitness', 'running', 'active', 'biker', 'legging', 'cycliste', 'jogging'])
  ) {
    collections.add('sport');
  }

  if (
    hasKeyword(allText, [
      'soiree', 'nuit', 'club', 'fete', 'cocktail', 'satin', 'strass', 'sequin', 'paillette',
      'dos nu', 'fendu', 'mesh', 'transparent', 'after dark', 'party', 'night', 'evening',
      'velvet', 'velours', 'metallic', 'metallise', 'talon', 'escarpin', 'heel', 'stiletto', 'pochette', 'clutch',
    ])
  ) {
    collections.add('after-dark');
  }

  if (
    hasKeyword(allText, [
      'gala', 'ceremonie', 'mariage', 'chic', 'elegant', 'elegante', 'tailleur', 'costume',
      'robe longue', 'maxi', 'formal', 'gown', 'wedding', 'prom', 'blazer', 'soie', 'silk',
    ])
  ) {
    collections.add('formal');
  }

  if (
    hasKeyword(allText, [
      'street', 'streetwear', 'cargo', 'baggy', 'oversize', 'oversized', 'denim', 'jean',
      'jort', 'stacked', 'graphique', 'graphic', 'urbain', 'urban', 'sneaker', 'basket',
      'hoodie', 'sweat', 'muscle', 'debardeur', 't-shirt', 'tee',
    ])
  ) {
    collections.add('street-collection');
  }

  if (
    hasKeyword(allText, [
      'ete', 'soleil', 'plage', 'vacances', 'resort', 'lin', 'linen', 'coton', 'crochet',
      'ajoure', 'fluide', 'leger', 'legere', 'sandale', 'lunette', 'sunglass', 'short',
      'bermuda', 'caftan', 'kaftan', 'summer', 'tropical', 'vacation', 'beach', 'sundress', 'camp',
    ])
  ) {
    collections.add('summer-drop');
  }

  if (
    input.isFeatured ||
    hasKeyword(allText, ['exclusif', 'exclusive', 'edition limitee', 'limited', 'capsule', 'prestige', 'signature'])
  ) {
    collections.add('exclusive-drop');
  }

  if (
    collections.size === 0 ||
    hasKeyword(allText, ['essentiel', 'essential', 'basique', 'basic', 'quotidien', 'everyday', 'minimal', 'minimaliste', 'classique', 'classic'])
  ) {
    collections.add('essentials');
  }

  return {
    audience,
    subCategory,
    brandSlug,
    brandName,
    collectionSlugs: Array.from(collections),
  };
}
