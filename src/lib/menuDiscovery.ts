import { DivisionKey, MegaMenuKey } from './navigationData';
import { normalizeText } from './productClassifier';
import { Product, StorefrontConfig } from '../types/commerce';

export interface FashionSubTaxonomyRule {
  slug: string;
  labelFr: string;
  labelEn: string;
  descFr: string;
  descEn: string;
  parentMegaMenuKey: MegaMenuKey;
  divisions: DivisionKey[];
  keywords: string[];
  /** Optional parent subCategory constraint so e.g. 'flare' doesn't false-match non-bottoms */
  requireSubCategories?: string[];
}

export interface DynamicSubMenu {
  id: string;
  slug: string;
  labelFr: string;
  labelEn: string;
  href: string;
  parentMegaMenuKey: MegaMenuKey;
}

export interface MenuSuggestion {
  slug: string;
  labelFr: string;
  labelEn: string;
  href: string;
  parentMegaMenuKey: MegaMenuKey;
  divisions: DivisionKey[];
  matchedCount: number;
  sampleProducts: string[];
  reasonFr: string;
  reasonEn: string;
  source: 'taxonomy' | 'ai';
}

/**
 * Curated warm-climate fashion micro-taxonomy (FR + EN) for automatic inventory-to-menu discovery.
 * Detects granular garment cuts, silhouettes, and styles (flare jeans, baggy, cargo, maxi dresses,
 * corsets, rompers, kaftans, satin, loafers, biker shorts, etc.) missing from static menus.
 */
export const FASHION_SUB_TAXONOMY: FashionSubTaxonomyRule[] = [
  // JEANS & DENIM CUTS
  {
    slug: 'flare-jeans',
    labelFr: 'Jeans Flare & Évasés',
    labelEn: 'Flare Jeans',
    descFr: 'Jeans évasés et coupes flare contemporaines pour une silhouette élancée.',
    descEn: 'Contemporary flare and bootcut denim silhouettes.',
    parentMegaMenuKey: 'bottoms',
    divisions: ['women', 'men', 'curve'],
    keywords: ['flare jean', 'jean flare', 'jeans flare', 'flared denim', 'stacked flare', 'evase'],
    requireSubCategories: ['jeans', 'pants'],
  },
  {
    slug: 'stacked-jeans',
    labelFr: 'Jeans Stacked',
    labelEn: 'Stacked Jeans',
    descFr: 'Denim coupe stacked à plis structurés sur la cheville.',
    descEn: 'Structured stacked denim with elongated ankle folds.',
    parentMegaMenuKey: 'bottoms',
    divisions: ['men', 'women', 'kids'],
    keywords: ['stacked', 'stacked jean', 'stacked denim'],
    requireSubCategories: ['jeans', 'pants'],
  },
  {
    slug: 'baggy-jeans',
    labelFr: 'Jeans Baggy & Larges',
    labelEn: 'Baggy & Wide Jeans',
    descFr: 'Jeans coupes amples, baggy et wide-leg respirants.',
    descEn: 'Relaxed baggy and wide-leg denim silhouettes.',
    parentMegaMenuKey: 'bottoms',
    divisions: ['women', 'men', 'curve', 'kids'],
    keywords: ['baggy', 'wide leg jean', 'jean large', 'loose jean', 'boyfriend jean', 'slouchy'],
    requireSubCategories: ['jeans', 'pants'],
  },
  {
    slug: 'straight-jeans',
    labelFr: 'Jeans Droits',
    labelEn: 'Straight Leg Jeans',
    descFr: 'Jeans coupe droite intemporelle.',
    descEn: 'Timeless straight-leg denim essentials.',
    parentMegaMenuKey: 'bottoms',
    divisions: ['women', 'men', 'curve'],
    keywords: ['straight leg', 'straight jean', 'jean droit', 'coupe droite'],
    requireSubCategories: ['jeans'],
  },
  {
    slug: 'denim-jorts',
    labelFr: 'Jorts en Denim',
    labelEn: 'Denim Jorts',
    descFr: 'Jorts en denim esprit années 90 et coupes cargo estivales.',
    descEn: '90s-inspired denim jorts and warm-weather cargo shorts.',
    parentMegaMenuKey: 'bottoms',
    divisions: ['women', 'men', 'curve'],
    keywords: ['jort', 'jorts', 'denim short', 'short denim', 'short en jean'],
    requireSubCategories: ['bottoms', 'shorts', 'jeans'],
  },

  // PANTS & TROUSERS CUTS
  {
    slug: 'cargo-pants',
    labelFr: 'Pantalons Cargo',
    labelEn: 'Cargo Pants',
    descFr: 'Pantalons cargo utilitaires à poches plaquées.',
    descEn: 'Utilitarian multi-pocket cargo trousers.',
    parentMegaMenuKey: 'bottoms',
    divisions: ['women', 'men', 'kids'],
    keywords: ['cargo', 'pantalon cargo', 'cargo pant', 'cargo short', 'cargo denim'],
  },
  {
    slug: 'waxed-pants',
    labelFr: 'Pantalons Cirés & Enduits',
    labelEn: 'Waxed & Coated Pants',
    descFr: 'Pantalons finition cirée et enduite pour le soir.',
    descEn: 'Coated and waxed finish trousers built for night out.',
    parentMegaMenuKey: 'bottoms',
    divisions: ['men', 'women'],
    keywords: ['waxed', 'cire', 'enduit', 'coated', 'faux leather pant', 'similicuir'],
    requireSubCategories: ['pants', 'jeans'],
  },
  {
    slug: 'palazzo-pants',
    labelFr: 'Pantalons Fluides & Palazzo',
    labelEn: 'Palazzo & Wide Pants',
    descFr: 'Pantalons fluides et plissés pensés pour les climats chauds.',
    descEn: 'Breezy wide-leg and pleated trousers for warm weather.',
    parentMegaMenuKey: 'bottoms',
    divisions: ['women', 'curve'],
    keywords: ['palazzo', 'wide leg pant', 'pantalon fluide', 'pantalon plisse', 'pleated pant'],
  },
  {
    slug: 'jogger-pants',
    labelFr: 'Pantalons Jogger',
    labelEn: 'Jogger Pants',
    descFr: 'Joggers et pantalons détente street et sport.',
    descEn: 'Relaxed street and athletic jogger pants.',
    parentMegaMenuKey: 'bottoms',
    divisions: ['men', 'kids', 'sport'],
    keywords: ['jogger', 'jogging', 'sweatpant'],
  },

  // DRESSES BY LENGTH & STYLE
  {
    slug: 'maxi-dresses',
    labelFr: 'Robes Maxi & Longues',
    labelEn: 'Maxi Dresses',
    descFr: 'Robes longues et maxi fluides pour le soir et le resort.',
    descEn: 'Floor-skimming maxi dresses for evening and resort.',
    parentMegaMenuKey: 'dresses',
    divisions: ['women', 'curve'],
    keywords: ['maxi dress', 'robe maxi', 'robe longue', 'maxi'],
    requireSubCategories: ['dresses'],
  },
  {
    slug: 'mini-dresses',
    labelFr: 'Mini-Robes',
    labelEn: 'Mini Dresses',
    descFr: 'Mini-robes audacieuses et coupes asymétriques de sortie.',
    descEn: 'Statement mini dresses and asymmetrical going-out silhouettes.',
    parentMegaMenuKey: 'dresses',
    divisions: ['women', 'curve'],
    keywords: ['mini dress', 'mini-robe', 'mini robe', 'robe courte'],
    requireSubCategories: ['dresses'],
  },
  {
    slug: 'midi-dresses',
    labelFr: 'Robes Midi',
    labelEn: 'Midi Dresses',
    descFr: 'Robes longueur midi chic et polyvalentes.',
    descEn: 'Refined mid-length dresses for day-to-night.',
    parentMegaMenuKey: 'dresses',
    divisions: ['women', 'curve'],
    keywords: ['midi dress', 'robe midi', 'midi'],
    requireSubCategories: ['dresses'],
  },
  {
    slug: 'evening-gowns',
    labelFr: 'Robes de Gala & Bustier',
    labelEn: 'Evening Gowns',
    descFr: 'Robes de gala brodées, bustiers et silhouettes cérémonie.',
    descEn: 'Embroidered strapless gowns and formal ceremony silhouettes.',
    parentMegaMenuKey: 'dresses',
    divisions: ['women', 'curve'],
    keywords: ['gown', 'strapless gown', 'robe de gala', 'robe de soiree', 'bustier', 'rhinestone', 'strass'],
    requireSubCategories: ['dresses'],
  },
  {
    slug: 'kaftan-dresses',
    labelFr: 'Caftans & Robes Resort',
    labelEn: 'Kaftans & Resort Dresses',
    descFr: 'Caftans fluides et robes légères pour les journées ensoleillées.',
    descEn: 'Fluid satin kaftans and airy resort silhouettes.',
    parentMegaMenuKey: 'dresses',
    divisions: ['women', 'curve'],
    keywords: ['kaftan', 'caftan', 'sundress', 'resort dress', 'robe de plage', 'beach dress'],
    requireSubCategories: ['dresses'],
  },
  {
    slug: 'satin-dresses',
    labelFr: 'Robes en Satin',
    labelEn: 'Satin Dresses',
    descFr: 'Robes fluides en satin brillant et nuisettes.',
    descEn: 'Luminous satin slip and draped evening dresses.',
    parentMegaMenuKey: 'dresses',
    divisions: ['women', 'curve'],
    keywords: ['satin', 'soie', 'silk', 'slip dress', 'nuisette'],
    requireSubCategories: ['dresses'],
  },
  {
    slug: 'lace-dresses',
    labelFr: 'Robes en Dentelle',
    labelEn: 'Lace Dresses',
    descFr: 'Robes travaillées en dentelle délicate.',
    descEn: 'Delicate lace-trim and sheer evening dresses.',
    parentMegaMenuKey: 'dresses',
    divisions: ['women', 'curve'],
    keywords: ['lace', 'dentelle'],
    requireSubCategories: ['dresses'],
  },

  // TOPS, CORSETS & SHIRTS
  {
    slug: 'corset-tops',
    labelFr: 'Corsets & Bustiers',
    labelEn: 'Corsets & Bustiers',
    descFr: 'Corsets structurés et bustiers sculptants.',
    descEn: 'Structured corsets and sculpted bustier tops.',
    parentMegaMenuKey: 'tops',
    divisions: ['women', 'curve'],
    keywords: ['corset', 'bustier'],
  },
  {
    slug: 'bodysuits',
    labelFr: 'Bodys Sculptants',
    labelEn: 'Sculpting Bodysuits',
    descFr: 'Bodys seconde peau et compression sans couture.',
    descEn: 'Second-skin compression and lace bodysuits.',
    parentMegaMenuKey: 'tops',
    divisions: ['women', 'curve', 'sport'],
    keywords: ['bodysuit', 'body sculptant', 'shaping bodysuit', 'body'],
  },
  {
    slug: 'button-up-shirts',
    labelFr: 'Chemises Boutonnées',
    labelEn: 'Button-Up Shirts',
    descFr: 'Chemises fluides, plissées et imprimées pour climat chaud.',
    descEn: 'Textured, crinkle, and statement button-up shirts.',
    parentMegaMenuKey: 'tops',
    divisions: ['men', 'women'],
    keywords: ['button up', 'button-up', 'button down', 'chemise', 'crinkle', 'floral shirt'],
    requireSubCategories: ['shirts', 'tops'],
  },
  {
    slug: 'boxy-tees',
    labelFr: 'T-Shirts Boxy & Oversize',
    labelEn: 'Boxy & Graphic Tees',
    descFr: 'T-shirts coupe boxy, vintage et graphiques.',
    descEn: 'Vintage-wash boxy and graphic streetwear tees.',
    parentMegaMenuKey: 'tops',
    divisions: ['men', 'sport', 'kids'],
    keywords: ['boxy', 'graphic tee', 'vintage tee', 'oversized tee', 't-shirt', 'muscle'],
    requireSubCategories: ['tops', 't-shirts', 'shirts'],
  },
  {
    slug: 'crop-tops',
    labelFr: 'Crop Tops',
    labelEn: 'Crop Tops',
    descFr: 'Hauts courts et crop tops respirants.',
    descEn: 'Breathable cropped silhouettes for warm days.',
    parentMegaMenuKey: 'tops',
    divisions: ['women', 'sport', 'kids'],
    keywords: ['crop top', 'cropped', 'haut court'],
  },

  // MATCHING SETS & ONE-PIECES
  {
    slug: 'rompers',
    labelFr: 'Combi-Shorts',
    labelEn: 'Rompers & Playsuits',
    descFr: 'Combi-shorts ajustés en denim ou tissu fluide.',
    descEn: 'Tailored short-sleeve and denim rompers.',
    parentMegaMenuKey: 'matching-sets',
    divisions: ['women', 'curve'],
    keywords: ['romper', 'playsuit', 'combishort', 'combi-short'],
  },
  {
    slug: 'pleated-sets',
    labelFr: 'Ensembles Plissés',
    labelEn: 'Pleated Sets',
    descFr: 'Ensembles deux pièces plissés légers et raffinés.',
    descEn: 'Airy two-piece pleated pant and shirt sets.',
    parentMegaMenuKey: 'matching-sets',
    divisions: ['women', 'men', 'curve'],
    keywords: ['pleated', 'plisse', 'crinkle'],
    requireSubCategories: ['matching-sets'],
  },
  {
    slug: 'lounge-sets',
    labelFr: 'Ensembles Lounge & Détente',
    labelEn: 'Lounge Sets',
    descFr: 'Ensembles confortables deux pièces pour le quotidien.',
    descEn: 'Effortless coordinated lounge and travel sets.',
    parentMegaMenuKey: 'matching-sets',
    divisions: ['women', 'curve', 'kids'],
    keywords: ['lounge', 'detente', 'seamless set', 'zip set'],
    requireSubCategories: ['matching-sets', 'activewear'],
  },
  {
    slug: 'suit-sets',
    labelFr: 'Ensembles Tailleurs',
    labelEn: 'Tailored Suit Sets',
    descFr: 'Tailleurs structurés et jacquard pour cérémonies.',
    descEn: 'Structured two-piece tailored and jacquard suit sets.',
    parentMegaMenuKey: 'matching-sets',
    divisions: ['women', 'men'],
    keywords: ['suit set', 'tailleur', 'jacquard', 'blazer set', 'costume'],
    requireSubCategories: ['matching-sets'],
  },

  // SPORT, SHORTS & SKIRTS
  {
    slug: 'biker-shorts',
    labelFr: 'Shorts Cyclistes',
    labelEn: 'Biker Shorts',
    descFr: 'Cyclistes sans couture et shorts de studio.',
    descEn: 'Seamless sculpting biker shorts for training and street.',
    parentMegaMenuKey: 'sport',
    divisions: ['sport', 'women', 'curve'],
    keywords: ['biker short', 'cycliste', 'seamless short'],
  },
  {
    slug: 'crochet-shorts',
    labelFr: 'Pièces en Crochet',
    labelEn: 'Crochet Edit',
    descFr: 'Micro-shorts et créations ajourées en crochet.',
    descEn: 'Open-knit crochet shorts and sun-ready pieces.',
    parentMegaMenuKey: 'bottoms',
    divisions: ['women', 'curve'],
    keywords: ['crochet', 'ajoure', 'open-knit', 'open knit'],
  },
  {
    slug: 'mini-skirts',
    labelFr: 'Mini-Jupes',
    labelEn: 'Mini Skirts',
    descFr: 'Mini-jupes doublées et coupes asymétriques.',
    descEn: 'Double-lined and structured mini skirts.',
    parentMegaMenuKey: 'bottoms',
    divisions: ['women', 'curve'],
    keywords: ['mini skirt', 'skirt', 'jupe', 'mini-jupe'],
  },

  // SHOES & ACCESSORIES
  {
    slug: 'platform-heels',
    labelFr: 'Talons Plateformes & Escarpins',
    labelEn: 'Platform Heels & Pumps',
    descFr: 'Talons aiguilles plateformes et escarpins slingback.',
    descEn: 'Platform stilettos and sleek patent slingback pumps.',
    parentMegaMenuKey: 'shoes',
    divisions: ['women', 'curve'],
    keywords: ['heel', 'stiletto', 'pump', 'slingback', 'talon', 'escarpin', 'plateforme'],
    requireSubCategories: ['shoes'],
  },
  {
    slug: 'loafers',
    labelFr: 'Mocassins & Slip-Ons',
    labelEn: 'Loafers & Slip-Ons',
    descFr: 'Mocassins habillés et slip-ons contemporains.',
    descEn: 'Polished buckle and color-block slip-on loafers.',
    parentMegaMenuKey: 'shoes',
    divisions: ['men'],
    keywords: ['loafer', 'mocassin', 'slip-on', 'slip on'],
    requireSubCategories: ['shoes'],
  },
  {
    slug: 'street-sneakers',
    labelFr: 'Baskets Street',
    labelEn: 'Street Sneakers',
    descFr: 'Baskets monochromes et silhouettes double laçage.',
    descEn: 'Clean monochrome and double-lace street sneakers.',
    parentMegaMenuKey: 'shoes',
    divisions: ['women', 'men', 'sport'],
    keywords: ['sneaker', 'basket', 'trainer'],
    requireSubCategories: ['shoes'],
  },
  {
    slug: 'mini-clutches',
    labelFr: 'Mini Pochettes & Sacs Soirée',
    labelEn: 'Mini Clutches & Evening Bags',
    descFr: 'Pochettes structurées et sacs de soirée minimalistes.',
    descEn: 'Structured mini clutches and evening handbags.',
    parentMegaMenuKey: 'accessories',
    divisions: ['women', 'curve'],
    keywords: ['clutch', 'pochette', 'miniaudiere', 'mini bag', 'sac de soiree'],
    requireSubCategories: ['bags'],
  },
];

const SUBMENU_TAG_PREFIX = 'sub_menu:';

/**
 * Extracts admin-approved dynamic sub-menus stored inside storefrontConfig.galleryItems.
 */
export function extractDynamicSubMenus(config: StorefrontConfig): DynamicSubMenu[] {
  return (config.galleryItems || [])
    .filter((g) => typeof g.tag === 'string' && g.tag.startsWith(SUBMENU_TAG_PREFIX))
    .map((g) => {
      const parentKey = g.tag.slice(SUBMENU_TAG_PREFIX.length) as MegaMenuKey;
      const slug = g.id.replace(/^dyn_/, '');
      return {
        id: g.id,
        slug,
        labelFr: g.title,
        labelEn: g.caption || g.title,
        href: g.imageUrl || `/category/${slug}`,
        parentMegaMenuKey: parentKey || 'categories',
      };
    });
}

/**
 * Merges dynamic sub-menus into storefrontConfig.galleryItems while preserving
 * all custom nav items and gallery entries within Firestore's 24-item cap.
 */
export function mergeDynamicSubMenusIntoGallery(
  existingGallery: StorefrontConfig['galleryItems'],
  dynamicSubMenus: DynamicSubMenu[]
) {
  const withoutDynamic = (existingGallery || []).filter(
    (g) => !(typeof g.tag === 'string' && g.tag.startsWith(SUBMENU_TAG_PREFIX))
  );
  const availableSlots = Math.max(0, 24 - withoutDynamic.length);
  const mapped = dynamicSubMenus.slice(0, availableSlots).map((m) => ({
    id: `dyn_${m.slug}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64),
    title: m.labelFr.slice(0, 60),
    caption: m.labelEn.slice(0, 60),
    imageUrl: (m.href || `/category/${m.slug}`).slice(0, 200),
    tag: `${SUBMENU_TAG_PREFIX}${m.parentMegaMenuKey}`,
  }));
  return [...withoutDynamic, ...mapped].slice(0, 24);
}

/**
 * Checks whether a single product matches a fashion micro-taxonomy rule.
 */
export function productMatchesTaxonomyRule(
  product: Pick<Product, 'name' | 'description' | 'subCategory' | 'categoryName' | 'styleTags' | 'collectionSlugs'>,
  rule: FashionSubTaxonomyRule
): boolean {
  if (
    rule.requireSubCategories &&
    rule.requireSubCategories.length > 0 &&
    product.subCategory &&
    !rule.requireSubCategories.includes(product.subCategory)
  ) {
    return false;
  }

  const hay = normalizeText(
    [
      product.name || '',
      product.description || '',
      product.categoryName || '',
      product.subCategory || '',
      ...(product.styleTags || []),
      ...(product.collectionSlugs || []),
    ].join(' ')
  );

  return rule.keywords.some((kw) => {
    const cleanKw = normalizeText(kw);
    return cleanKw.length > 0 && hay.includes(cleanKw);
  });
}

/**
 * Scans the live product catalog to detect granular fashion sub-menus that exist in inventory
 * but are not yet published in the store's dynamic menus.
 */
export function detectMissingMenusFromInventory(
  products: Product[],
  existingDynamic: DynamicSubMenu[],
  dismissedSlugs: string[] = []
): MenuSuggestion[] {
  const activeProducts = products.filter((p) => p.status !== 'archived');
  const existingSet = new Set(existingDynamic.map((d) => d.slug.toLowerCase()));
  const dismissedSet = new Set(dismissedSlugs.map((s) => s.toLowerCase()));

  const suggestions: MenuSuggestion[] = [];

  for (const rule of FASHION_SUB_TAXONOMY) {
    if (existingSet.has(rule.slug) || dismissedSet.has(rule.slug)) continue;

    const matched = activeProducts.filter((p) => productMatchesTaxonomyRule(p, rule));
    if (matched.length === 0) continue;

    suggestions.push({
      slug: rule.slug,
      labelFr: rule.labelFr,
      labelEn: rule.labelEn,
      href: `/category/${rule.slug}`,
      parentMegaMenuKey: rule.parentMegaMenuKey,
      divisions: rule.divisions,
      matchedCount: matched.length,
      sampleProducts: matched.slice(0, 3).map((p) => p.name),
      reasonFr: `${matched.length} pièce${matched.length > 1 ? 's' : ''} détectée${matched.length > 1 ? 's' : ''} dans votre inventaire sans sous-menu dédié.`,
      reasonEn: `${matched.length} matching item${matched.length > 1 ? 's' : ''} detected in inventory with no dedicated sub-menu yet.`,
      source: 'taxonomy',
    });
  }

  return suggestions.sort((a, b) => b.matchedCount - a.matchedCount);
}

/**
 * Used by CatalogPage so clicking any dynamic menu URL (e.g. /category/flare-jeans)
 * filters the real catalog accurately.
 */
export function matchesDynamicMenuSlug(
  product: Product,
  slug: string,
  dynamicMenus: DynamicSubMenu[] = []
): boolean {
  const cleanSlug = slug.toLowerCase();
  const rule = FASHION_SUB_TAXONOMY.find((r) => r.slug === cleanSlug);
  if (rule) {
    return productMatchesTaxonomyRule(product, rule);
  }

  // Support AI-suggested or custom dynamic menu slugs by matching tokens against product text
  const custom = dynamicMenus.find((m) => m.slug.toLowerCase() === cleanSlug);
  const hay = normalizeText(
    [
      product.name,
      product.description,
      product.categoryName,
      product.subCategory || '',
      ...(product.styleTags || []),
      ...(product.collectionSlugs || []),
    ].join(' ')
  );

  const candidatePhrases = [
    normalizeText(cleanSlug.replace(/-/g, ' ')),
    custom ? normalizeText(custom.labelFr) : '',
    custom ? normalizeText(custom.labelEn) : '',
  ].filter(Boolean);

  for (const phrase of candidatePhrases) {
    if (hay.includes(phrase)) return true;
    const tokens = phrase.split(' ').filter((t) => t.length >= 3);
    if (tokens.length > 0 && tokens.every((t) => hay.includes(t))) return true;
  }

  return false;
}

export function findDynamicMenuMeta(
  slug: string,
  dynamicMenus: DynamicSubMenu[] = []
): { labelFr: string; labelEn: string; descFr: string; descEn: string } | null {
  const cleanSlug = slug.toLowerCase();
  const rule = FASHION_SUB_TAXONOMY.find((r) => r.slug === cleanSlug);
  if (rule) {
    return {
      labelFr: rule.labelFr,
      labelEn: rule.labelEn,
      descFr: rule.descFr,
      descEn: rule.descEn,
    };
  }
  const custom = dynamicMenus.find((m) => m.slug.toLowerCase() === cleanSlug);
  if (custom) {
    return {
      labelFr: custom.labelFr,
      labelEn: custom.labelEn,
      descFr: `Sélection ${custom.labelFr} issue de votre catalogue KIKI JONES.`,
      descEn: `Curated ${custom.labelEn} selection from KIKI JONES.`,
    };
  }
  return null;
}

export const PARENT_MENU_LABELS: Record<MegaMenuKey, { fr: string; en: string }> = {
  women: { fr: 'Femme', en: 'Women' },
  curve: { fr: 'Curve', en: 'Curve' },
  men: { fr: 'Homme', en: 'Men' },
  sport: { fr: 'Sport', en: 'Sport' },
  kids: { fr: 'Enfants', en: 'Kids' },
  brands: { fr: 'Marques', en: 'Brands' },
  categories: { fr: 'Catégories', en: 'Categories' },
  dresses: { fr: 'Robes', en: 'Dresses' },
  'matching-sets': { fr: 'Ensembles', en: 'Matching Sets' },
  tops: { fr: 'Hauts & Chemises', en: 'Tops & Shirts' },
  bottoms: { fr: 'Jeans & Bas', en: 'Jeans & Bottoms' },
  shoes: { fr: 'Chaussures', en: 'Shoes' },
  accessories: { fr: 'Accessoires', en: 'Accessories' },
};
