import { StorefrontConfig } from '../types/commerce';
import {
  BRAND_LINES,
  EDITORIAL_COLLECTIONS,
  KJ_IMAGES,
  PRODUCT_CATEGORIES,
} from './navigationData';

export interface SectionImageSlot {
  key: string;
  labelFr: string;
  labelEn: string;
  descFr?: string;
  descEn?: string;
  defaultUrl: string;
  syncField?: 'heroImageUrl' | 'nextDropLeftImageUrl' | 'nextDropRightImageUrl';
}

export interface BannerGroupDefinition {
  id: 'homepage' | 'audiences' | 'brands' | 'collections';
  labelFr: string;
  labelEn: string;
  slots: SectionImageSlot[];
}

/**
 * Resolves the effective image URL for any storefront banner or section slot.
 * Priority: storefrontConfig.sectionImages[slotKey] > legacy synced field > fallbackUrl.
 */
export function getSectionImage(
  config: StorefrontConfig | undefined | null,
  slotKey: string,
  fallbackUrl: string
): string {
  const mapped = config?.sectionImages?.[slotKey];
  if (typeof mapped === 'string' && mapped.trim().length > 0) {
    return mapped.trim();
  }
  if (slotKey === 'hero_left' && config?.heroImageUrl) {
    return config.heroImageUrl;
  }
  if (slotKey === 'dual_left' && config?.nextDropLeftImageUrl) {
    return config.nextDropLeftImageUrl;
  }
  if (slotKey === 'dual_right' && config?.nextDropRightImageUrl) {
    return config.nextDropRightImageUrl;
  }
  return fallbackUrl;
}

/**
 * Checks whether an admin explicitly customized a specific banner slot.
 */
export function hasCustomSectionImage(
  config: StorefrontConfig | undefined | null,
  slotKey: string
): boolean {
  const mapped = config?.sectionImages?.[slotKey];
  return typeof mapped === 'string' && mapped.trim().length > 0;
}

/**
 * All homepage section slots grouped by built-in homepage section key.
 */
export const HOMEPAGE_SECTION_SLOTS: Record<string, SectionImageSlot[]> = {
  hero_split: [
    {
      key: 'hero_left',
      labelFr: 'Hero — Image principale (Gauche)',
      labelEn: 'Hero — Primary Image (Left)',
      descFr: 'Visuel principal affiché sur mobile et à gauche sur grand écran.',
      descEn: 'Primary visual displayed on mobile and left column on desktop.',
      defaultUrl: KJ_IMAGES.womenSatinEvening,
      syncField: 'heroImageUrl',
    },
    {
      key: 'hero_right',
      labelFr: 'Hero — Image secondaire (Droite)',
      labelEn: 'Hero — Secondary Image (Right)',
      descFr: 'Visuel affiché dans la colonne de droite sur grand écran.',
      descEn: 'Displayed in the right-hand split column on desktop.',
      defaultUrl: KJ_IMAGES.menEditorial,
    },
  ],
  new_arrivals_banner: [
    {
      key: 'new_arrivals_1',
      labelFr: 'Nouveautés — Visuel 1 (Gauche)',
      labelEn: 'New Arrivals — Visual 1 (Left)',
      defaultUrl: KJ_IMAGES.heroCampaign,
    },
    {
      key: 'new_arrivals_2',
      labelFr: 'Nouveautés — Visuel 2 (Centre)',
      labelEn: 'New Arrivals — Visual 2 (Center)',
      defaultUrl: KJ_IMAGES.jumpsuitsFeature,
    },
    {
      key: 'new_arrivals_3',
      labelFr: 'Nouveautés — Visuel 3 (Droite)',
      labelEn: 'New Arrivals — Visual 3 (Right)',
      defaultUrl: KJ_IMAGES.womenResortSet,
    },
  ],
  kiki_men_split: [
    {
      key: 'kiki_men_left',
      labelFr: 'Kiki Men — Visuel gauche',
      labelEn: 'Kiki Men — Left Visual',
      defaultUrl: KJ_IMAGES.menMeshShirt,
    },
    {
      key: 'kiki_men_right',
      labelFr: 'Kiki Men — Visuel droite',
      labelEn: 'Kiki Men — Right Visual',
      defaultUrl: KJ_IMAGES.menStreetDenim,
    },
  ],
  kiki_sculpt_triptych: [
    {
      key: 'kiki_sculpt_1',
      labelFr: 'Kiki Sculpt & Curve — Visuel 1 (Gauche)',
      labelEn: 'Kiki Sculpt & Curve — Visual 1 (Left)',
      defaultUrl: KJ_IMAGES.sculptFeature,
    },
    {
      key: 'kiki_sculpt_2',
      labelFr: 'Kiki Sculpt & Curve — Visuel 2 (Centre)',
      labelEn: 'Kiki Sculpt & Curve — Visual 2 (Center)',
      defaultUrl: KJ_IMAGES.sculptBodysuitFeature,
    },
    {
      key: 'kiki_sculpt_3',
      labelFr: 'Kiki Sculpt & Curve — Visuel 3 (Droite / Curve)',
      labelEn: 'Kiki Sculpt & Curve — Visual 3 (Right / Curve)',
      defaultUrl: KJ_IMAGES.curveFeature,
    },
  ],
  women_exclusive_banner: [
    {
      key: 'kiki_luxe_left',
      labelFr: 'Bannière Kiki Luxe — Visuel gauche',
      labelEn: 'Kiki Luxe Banner — Left Visual',
      descFr: 'Affiché sur la grande section Kiki Luxe de la page d’accueil.',
      descEn: 'Displayed on the main Kiki Luxe homepage banner.',
      defaultUrl: KJ_IMAGES.formalFeature,
    },
    {
      key: 'kiki_luxe_right',
      labelFr: 'Bannière Kiki Luxe — Visuel droite',
      labelEn: 'Kiki Luxe Banner — Right Visual',
      descFr: 'Deuxième colonne de la section Kiki Luxe sur grand écran.',
      descEn: 'Second column of the Kiki Luxe homepage banner on desktop.',
      defaultUrl: KJ_IMAGES.curveGownCampaign,
    },
  ],
  dual_spotlight: [
    {
      key: 'dual_left',
      labelFr: 'Double Spotlight — Kiki Kids (Filles & Garçons)',
      labelEn: 'Dual Spotlight — Kiki Kids (Girls & Boys)',
      descFr: 'Bannière gauche dédiée à Kiki Kids (Filles & Garçons).',
      descEn: 'Left block dedicated to Kiki Kids (Girls & Boys).',
      defaultUrl: KJ_IMAGES.girlsEditorial,
      syncField: 'nextDropLeftImageUrl',
    },
    {
      key: 'dual_right',
      labelFr: 'Double Spotlight — Kiki Sport',
      labelEn: 'Dual Spotlight — Kiki Sport',
      descFr: 'Bannière droite dédiée à Kiki Sport.',
      descEn: 'Right block dedicated to Kiki Sport.',
      defaultUrl: KJ_IMAGES.sportFeature,
      syncField: 'nextDropRightImageUrl',
    },
  ],
};

export const AUDIENCE_BANNER_SLOTS: SectionImageSlot[] = [
  {
    key: 'audience:women',
    labelFr: 'Catégorie Femme — Bannière',
    labelEn: 'Women Category — Banner',
    descFr: 'Affichée sur la page Femme et dans le Méga-Menu Femme.',
    descEn: 'Displayed on the Women page and Women Mega-Menu.',
    defaultUrl: KJ_IMAGES.womenEditorial,
  },
  {
    key: 'audience:men',
    labelFr: 'Catégorie Homme — Bannière',
    labelEn: 'Men Category — Banner',
    descFr: 'Affichée sur la page Homme et dans le Méga-Menu Homme.',
    descEn: 'Displayed on the Men page and Men Mega-Menu.',
    defaultUrl: KJ_IMAGES.menEditorial,
  },
  {
    key: 'audience:girls',
    labelFr: 'Catégorie Filles — Bannière',
    labelEn: 'Girls Category — Banner',
    descFr: 'Affichée sur la page Filles et dans l’univers Enfants.',
    descEn: 'Displayed on the Girls page and Kids universe.',
    defaultUrl: KJ_IMAGES.girlsEditorial,
  },
  {
    key: 'audience:boys',
    labelFr: 'Catégorie Garçons — Bannière',
    labelEn: 'Boys Category — Banner',
    descFr: 'Affichée sur la page Garçons et dans l’univers Enfants.',
    descEn: 'Displayed on the Boys page and Kids universe.',
    defaultUrl: KJ_IMAGES.boysEditorial,
  },
  {
    key: 'audience:accessories',
    labelFr: 'Catégorie Accessoires — Bannière',
    labelEn: 'Accessories Category — Banner',
    descFr: 'Affichée sur la page Accessoires et dans le Méga-Menu.',
    descEn: 'Displayed on the Accessories page and Mega-Menu.',
    defaultUrl: KJ_IMAGES.accessoriesEditorial,
  },
];

const CATEGORY_LABELS_FR: Record<string, string> = {
  dresses: 'Robes',
  'matching-sets': 'Ensembles',
  shoes: 'Chaussures',
  sunglasses: 'Lunettes de soleil',
  shirts: 'Chemises & Hauts',
  jumpsuits: 'Combinaisons',
  jeans: 'Jeans & Denim',
  bottoms: 'Shorts & Bas',
  activewear: 'Sport & Activewear',
  bags: 'Sacs & Pochettes',
  jewelry: 'Bijoux & Montres',
};

export const CATEGORY_BANNER_SLOTS: SectionImageSlot[] = PRODUCT_CATEGORIES.map((cat) => ({
  key: `category:${cat.slug}`,
  labelFr: `Catégorie — ${CATEGORY_LABELS_FR[cat.slug] || cat.name}`,
  labelEn: `Category — ${cat.name}`,
  descFr: 'Visible dans "Acheter par Catégorie" et sur la page catégories.',
  descEn: 'Visible in "Shop by Category" strip and Categories directory.',
  defaultUrl: cat.imageUrl,
}));

export const BRAND_BANNER_SLOTS: SectionImageSlot[] = BRAND_LINES.map((brand) => ({
  key: `brand:${brand.slug}`,
  labelFr: `Marque — ${brand.name}`,
  labelEn: `Brand — ${brand.name}`,
  descFr: 'Affichée dans "Acheter par Marque", la page Marques et la page de cette marque.',
  descEn: 'Displayed in "Shop by Brand", Brands page, and brand catalog.',
  defaultUrl: brand.heroImage,
}));

const COLLECTION_LABELS_FR: Record<string, string> = {
  'after-dark': 'After Dark (Soirée)',
  formal: 'Gala & Cérémonie',
  sport: 'Sport & Studio',
  essentials: 'Les Essentiels',
  'street-collection': 'Streetwear',
  'summer-drop': 'Drop Été',
  'exclusive-drop': 'Drop Exclusif',
};

export const COLLECTION_BANNER_SLOTS: SectionImageSlot[] = EDITORIAL_COLLECTIONS.map((col) => ({
  key: `collection:${col.slug}`,
  labelFr: `Collection — ${COLLECTION_LABELS_FR[col.slug] || col.title}`,
  labelEn: `Collection — ${col.title}`,
  descFr: 'Affichée dans "Collections à la une" et en bannière de collection.',
  descEn: 'Displayed in Featured Collections and collection campaign header.',
  defaultUrl: col.campaignImage,
}));

/**
 * Returns the editable image slots for any built-in homepage section key.
 */
export function getSlotsForHomepageSection(sectionKey: string): SectionImageSlot[] {
  const clean = sectionKey.replace(/^hidden:/, '');
  if (clean === 'hero' || clean === 'hero_split') return HOMEPAGE_SECTION_SLOTS.hero_split;
  if (clean === 'new_arrivals_banner' || clean === 'new_arrivals' || clean === 'new_drop') {
    return HOMEPAGE_SECTION_SLOTS.new_arrivals_banner;
  }
  if (clean === 'shop_by_category_strip' || clean === 'categories') {
    return CATEGORY_BANNER_SLOTS;
  }
  if (clean === 'kiki_men_split') return HOMEPAGE_SECTION_SLOTS.kiki_men_split;
  if (clean === 'kiki_sculpt_triptych' || clean === 'fashion_discovery') {
    return HOMEPAGE_SECTION_SLOTS.kiki_sculpt_triptych;
  }
  if (
    clean === 'women_exclusive_banner' ||
    clean === 'after_dark_banner' ||
    clean === 'trending' ||
    clean === 'featured'
  ) {
    return HOMEPAGE_SECTION_SLOTS.women_exclusive_banner;
  }
  if (clean === 'dual_spotlight' || clean === 'next_drop') {
    return HOMEPAGE_SECTION_SLOTS.dual_spotlight;
  }
  if (clean === 'shop_by_brand_strip' || clean === 'brand_intro' || clean === 'mireza_world') {
    return BRAND_BANNER_SLOTS;
  }
  if (clean === 'featured_collections_grid') {
    return COLLECTION_BANNER_SLOTS;
  }
  return [];
}

/**
 * Organized tabs for the global "Bannières & Images" view inside AdminStorefront.
 */
export const ALL_BANNER_GROUPS: BannerGroupDefinition[] = [
  {
    id: 'homepage',
    labelFr: 'Sections Accueil',
    labelEn: 'Homepage Sections',
    slots: [
      ...HOMEPAGE_SECTION_SLOTS.hero_split,
      ...HOMEPAGE_SECTION_SLOTS.new_arrivals_banner,
      ...HOMEPAGE_SECTION_SLOTS.kiki_men_split,
      ...HOMEPAGE_SECTION_SLOTS.kiki_sculpt_triptych,
      ...HOMEPAGE_SECTION_SLOTS.women_exclusive_banner,
      ...HOMEPAGE_SECTION_SLOTS.dual_spotlight,
    ],
  },
  {
    id: 'audiences',
    labelFr: 'Filles, Garçons & Catégories',
    labelEn: 'Girls, Boys & Categories',
    slots: [...AUDIENCE_BANNER_SLOTS, ...CATEGORY_BANNER_SLOTS],
  },
  {
    id: 'brands',
    labelFr: 'Marques (Kiki Luxe...)',
    labelEn: 'Brands (Kiki Luxe...)',
    slots: BRAND_BANNER_SLOTS,
  },
  {
    id: 'collections',
    labelFr: 'Collections',
    labelEn: 'Collections',
    slots: COLLECTION_BANNER_SLOTS,
  },
];

export const STOREFRONT_IMAGE_LIBRARY: string[] = Array.from(new Set(Object.values(KJ_IMAGES)));
