import { AppLanguage } from '../context/LanguageContext';
import {
  BRAND_LINES,
  BrandLine,
  DivisionKey,
  EDITORIAL_COLLECTIONS,
  EditorialCollection,
  FLOATING_SUBNAV_BY_DIVISION,
  FloatingSubNavItem,
  MEGA_MENUS,
  MegaMenuConfig,
  MegaMenuKey,
  PRODUCT_CATEGORIES,
  ProductCategoryTile,
  SUGGESTED_SEARCH_CATEGORIES,
  TRENDING_SEARCHES,
} from './navigationData';

const PRIMARY_NAV_FR: Record<string, string> = {
  women: 'Femme',
  curve: 'Curve',
  men: 'Homme',
  sport: 'Sport',
  kids: 'Enfants',
  brands: 'Marques',
  categories: 'Catégories',
};

const LABEL_MAP_FR: Record<string, string> = {
  // Divisions & Nav
  Women: 'Femme',
  Curve: 'Curve',
  Men: 'Homme',
  Sport: 'Sport',
  Kids: 'Enfants',
  Brands: 'Marques',
  Categories: 'Catégories',
  Girls: 'Filles',
  Boys: 'Garçons',
  Accessories: 'Accessoires',
  'Shop by Brand': 'Par Marque',
  'Shop by Category': 'Par Catégorie',
  'All Brands': 'Toutes les marques',
  'All Categories': 'Toutes les catégories',
  'All Collections': 'Toutes les collections',

  // Floating subnav & links
  'New In': 'Nouveautés',
  'New Arrivals': 'Nouveautés',
  Dresses: 'Robes',
  'Matching Sets': 'Ensembles',
  'Tops & Corsets': 'Hauts & Corsets',
  'Tops & Shirts': 'Hauts & Chemises',
  'Shirts & Tops': 'Chemises & Hauts',
  Jumpsuits: 'Combinaisons',
  'Jumpsuits & Rompers': 'Combinaisons & Combi-shorts',
  'Jeans & Bottoms': 'Jeans & Bas',
  'Jeans & Pants': 'Jeans & Pantalons',
  'Shorts & Bottoms': 'Shorts & Bas',
  'Activewear & Sport': 'Sport & Activewear',
  Formal: 'Soirée & Gala',
  'Formal & Gowns': 'Robes de Gala',
  'Formal & Occasion': 'Soirée & Cérémonie',
  'After Dark': 'After Dark',
  'After Dark / Going Out': 'After Dark / Sorties',
  'After Dark Edit': 'Édition After Dark',
  Shoes: 'Chaussures',
  'Shoes & Heels': 'Chaussures & Talons',
  Sunglasses: 'Lunettes de soleil',
  Bags: 'Sacs',
  'Bags & Clutches': 'Sacs & Pochettes',
  'Bags & Mini Clutches': 'Sacs & Mini Pochettes',
  Jewelry: 'Bijoux',
  Sale: 'Soldes',
  'Sale & Offers': 'Soldes & Offres',
  'All Curve': 'Tout Curve',
  'All Men': 'Tout Homme',
  'All Sport': 'Tout Sport',
  'All Kids': 'Tout Enfants',
  'All Dresses': 'Toutes les robes',
  'All Matching Sets': 'Tous les ensembles',
  'All Shirts & Tops': 'Toutes les chemises & hauts',
  'All Jeans & Pants': 'Tous les jeans & pantalons',
  'All Shorts & Bottoms': 'Tous les shorts & bas',
  'All Shoes': 'Toutes les chaussures',
  'All Activewear': 'Tout le sport',
  'All Kiki Men': 'Tout Kiki Men',
  'All Kiki Kids': 'Tout Kiki Kids',
  'Shop All Women': 'Toute la mode Femme',
  'Shop All Curve': 'Tout Kiki Curve',
  'Shop All Men': 'Toute la mode Homme',
  'Shop All Sport': 'Tout Kiki Sport',
  'Shop All Girls': 'Toute la mode Filles',
  'Shop All Boys': 'Toute la mode Garçons',
  'Shop All Shoes': 'Toutes les chaussures',
  'Shop All Accessories': 'Tous les accessoires',
  Shirts: 'Chemises',
  'Tees & Tops': 'T-Shirts & Hauts',
  Jeans: 'Jeans',
  'Pants & Shorts': 'Pantalons & Shorts',
  'Night Out': 'Soirée',
  'Street Heat': 'Street Heat',
  Activewear: 'Sport',
  'Biker Shorts': 'Cyclistes',
  'Women Sport': 'Sport Femme',
  'Men Sport': 'Sport Homme',
  Sneakers: 'Baskets',
  'Girls Sets': 'Ensembles Filles',
  'Boys Sets': 'Ensembles Garçons',
  Bottoms: 'Bas',

  // MegaMenu headings
  Clothing: 'Vêtements',
  'Women Brands': 'Marques Femme',
  'Warm-Climate Edits': 'Sélections Soleil',
  'Shoes & Accessories': 'Chaussures & Accessoires',
  'Kiki Curve Clothing': 'Vêtements Kiki Curve',
  'Featured Edits': 'Sélections Phares',
  'Finish The Look': 'Compléter le Look',
  'House Brands': 'Nos Maisons',
  'Warm-Climate Clothing': 'Prêt-à-Porter Climat Chaud',
  Collections: 'Collections',
  'By Audience': 'Par Univers',
  'Pair With': 'À Associer Avec',
  'More Labels': 'Autres Marques',
  'KIKI JONES House Brands': 'Les Maisons KIKI JONES',
  'Popular Categories': 'Catégories Populaires',
  'Shop by Audience': 'Par Public',
  Apparel: 'Prêt-à-Porter',
  'Dress Styles': 'Styles de Robes',
  'One-Pieces & Sets': 'Une-Pièce & Ensembles',
  'Complete The Look': 'Compléter la Tenue',
  Trending: 'Tendances',
  'Two-Piece Sets': 'Ensembles Deux Pièces',
  'Warm-Weather Edits': 'Sélections Chaleur',
  'Related Categories': 'Catégories Associées',
  'Women Tops': 'Hauts Femme',
  'Men Shirts & Tees': 'Chemises & T-Shirts Homme',
  Edits: 'Éditions',
  'Denim & Trousers': 'Denim & Pantalons',
  'Shorts & Warm-Weather Bottoms': 'Shorts & Bas Légers',
  Footwear: 'Chaussures',
  'By Brand': 'Par Marque',
  'Finish With': 'Finitions',
  'Curated Edits': 'Sélections',

  // MegaMenu inner links
  'Shorts & Jorts': 'Shorts & Jorts',
  'Activewear & Biker Shorts': 'Sport & Cyclistes',
  'Sun & Resort Sets': 'Ensembles Soleil & Resort',
  'Sun & Resort': 'Soleil & Resort',
  'The Essentials': 'Les Essentiels',
  'Heels & Sneakers': 'Talons & Baskets',
  'Going-Out Dresses': 'Robes de Sortie',
  'Matching Lounge Sets': 'Ensembles Détente',
  'Formal & Evening Gowns': 'Robes de Soirée & Gala',
  'Corsets & Bodysuits': 'Corsets & Bodys',
  'Active & Biker Shorts': 'Sport & Cyclistes',
  'Platform Heels': 'Talons Plateformes',
  'Mini Clutches': 'Mini Pochettes',
  'New In Men': 'Nouveautés Homme',
  'Best Sellers': 'Best-Sellers',
  'Men Sale': 'Soldes Homme',
  'Night-Out Shirts': 'Chemises de Soirée',
  'Two-Piece Sets & Shorts': 'Ensembles & Shorts',
  'Boxy & Graphic Tees': 'T-Shirts Boxy & Graphiques',
  'Stacked Flare Jeans': 'Jeans Évasés Stacked',
  'Waxed Flare Pants': 'Pantalons Cirés Évasés',
  'Men Sport & Active': 'Sport Homme',
  'Loafers & Footwear': 'Mocassins & Chaussures',
  'Active & Sport': 'Sport & Activewear',
  'Seamless Biker Shorts': 'Cyclistes Sans Couture',
  'Sport Collection': 'Collection Sport',
  'Women Activewear': 'Sport Femme',
  'Men Sport & Tees': 'Sport & T-Shirts Homme',
  'Kiki Sculpt Compression': 'Compression Kiki Sculpt',
  'Everyday Sneakers': 'Baskets du Quotidien',
  'Girls Matching Sets': 'Ensembles Filles',
  'Boys Matching Sets': 'Ensembles Garçons',
  'Kids Sale': 'Soldes Enfants',
  'Girls Pant Sets': 'Ensembles Pantalon Filles',
  'New In Girls': 'Nouveautés Filles',
  'Boys Jogger Sets': 'Ensembles Jogger Garçons',
  'New In Boys': 'Nouveautés Garçons',
  'Girls & Boys': 'Filles & Garçons',
  'Going-Out & After Dark': 'Sorties & After Dark',
  'Resort & Kaftan Dresses': 'Robes Resort & Caftans',
  'Curve Dresses': 'Robes Curve',
  'Platform Heels & Pumps': 'Talons Plateformes & Escarpins',
  'Evening Clutches': 'Pochettes de Soirée',
  'Statement Jewelry': 'Bijoux d’Exception',
  'Women Pleated & Suit Sets': 'Ensembles Plissés & Tailleurs Femme',
  'Curve Lounge Sets': 'Ensembles Détente Curve',
  'Men Crinkle & Short Sets': 'Ensembles Plissés & Shorts Homme',
  'Kids Pant & Jogger Sets': 'Ensembles Pantalon & Jogger Enfants',
  'Formal Suit Sets': 'Ensembles Tailleur Gala',
  'Night-Out Button-Up Shirts': 'Chemises Boutonnées Soirée',
  'Vintage & Boxy Tees': 'T-Shirts Vintage & Boxy',
  'Men Stacked Flare Jeans': 'Jeans Évasés Stacked Homme',
  '90s & Cargo Denim Jorts': 'Jorts Denim 90s & Cargo',
  'Shirts & Corsets': 'Chemises & Corsets',
  'Shoes & Sneakers': 'Chaussures & Baskets',
  'Women Heels & Pumps': 'Talons & Escarpins Femme',
  'Men Loafers & Slip-Ons': 'Mocassins & Slip-Ons Homme',
  'Kiki Luxe Heels': 'Talons Kiki Luxe',
  'Kiki Men Footwear': 'Chaussures Kiki Men',
  'Kiki Sculpt Sneakers': 'Baskets Kiki Sculpt',
  'Shoes, Shades & Objects': 'Chaussures, Lunettes & Objets',
  'Sunglasses & Frames': 'Lunettes de Soleil & Montures',
  'Earrings & Bracelets': 'Boucles d’Oreilles & Bracelets',
  'Men Loafers': 'Mocassins Homme',

  // Editorial MegaMenu cards
  'Women · New Season': 'Femme · Nouvelle Saison',
  'Evening & Resort Silhouettes': 'Silhouettes Soirée & Resort',
  'Shop Women': 'Découvrir Femme',
  'Kiki Curve · Confident Fit': 'Kiki Curve · Coupe Assumée',
  'After Dark & Formal Curve': 'Curve Soirée & Gala',
  'Shop Kiki Curve': 'Découvrir Kiki Curve',
  'Kiki Men · Warm Climate': 'Kiki Men · Climat Chaud',
  'Statement Shirts & Street': 'Chemises & Streetwear',
  'Shop Kiki Men': 'Découvrir Kiki Men',
  'Kiki Sport · Heat-Ready': 'Kiki Sport · Respirant',
  'Breathable Active & Studio': 'Activewear & Studio',
  'Shop Kiki Sport': 'Découvrir Kiki Sport',
  'Kiki Kids · Girls & Boys': 'Kiki Kids · Filles & Garçons',
  'Fresh Youth Street Sets': 'Ensembles Street Junior',
  'Shop Kiki Kids': 'Découvrir Kiki Kids',
  'House of Labels': 'Nos Maisons',
  '6 Signature Brands': '6 Marques Signatures',
  'Explore All Brands': 'Explorer les Marques',
  'Shop by Piece': 'Par Type de Pièce',
  'Shoes, Shades & Wardrobe': 'Chaussures, Lunettes & Garde-Robe',
  'Explore Categories': 'Explorer les Catégories',
  'Kiki Luxe · Dresses': 'Kiki Luxe · Robes',
  'Gowns, Maxis & Minis': 'Robes Longues, Maxis & Minis',
  'Shop Dresses': 'Découvrir les Robes',
  'Effortless Co-ords': 'Ensembles Coordonnés',
  'Two-Piece Matching Sets': 'Ensembles Deux Pièces',
  'Shop Matching Sets': 'Découvrir les Ensembles',
  'Sculpt & Statement': 'Sculpt & Caractère',
  'Corsets, Shirts & Tees': 'Corsets, Chemises & T-Shirts',
  'Shop Tops': 'Découvrir les Hauts',
  'Denim & Shorts': 'Denim & Shorts',
  'Stacked Jeans & Jorts': 'Jeans Stacked & Jorts',
  'Shop Bottoms': 'Découvrir les Bas',
  'Footwear Edit': 'Sélection Chaussures',
  'Stilettos, Loafers & Sneakers': 'Talons, Mocassins & Baskets',
  'Finishing Touches': 'Touches Finales',
  'Sunglasses, Clutches & Jewelry': 'Lunettes, Pochettes & Bijoux',
  'Shop Accessories': 'Découvrir les Accessoires',
};

export function translateLabel(label: string, lang: AppLanguage): string {
  if (lang === 'en') return label;
  return LABEL_MAP_FR[label] || label;
}

export function getPrimaryNavLabel(key: string, defaultLabel: string, lang: AppLanguage): string {
  if (lang === 'en') return defaultLabel;
  return PRIMARY_NAV_FR[key] || translateLabel(defaultLabel, lang);
}

export function getFloatingSubnav(division: DivisionKey, lang: AppLanguage): FloatingSubNavItem[] {
  const list = FLOATING_SUBNAV_BY_DIVISION[division] || FLOATING_SUBNAV_BY_DIVISION.women;
  if (lang === 'en') return list;
  return list.map((item) => ({
    ...item,
    label: translateLabel(item.label, lang),
  }));
}

export function getMegaMenuLocalized(key: MegaMenuKey | null, lang: AppLanguage): MegaMenuConfig | null {
  if (!key) return null;
  const cfg = MEGA_MENUS[key];
  if (!cfg) return null;
  if (lang === 'en') return cfg;
  return {
    ...cfg,
    label: translateLabel(cfg.label, lang),
    columns: cfg.columns.map((col) => ({
      heading: translateLabel(col.heading, lang),
      links: col.links.map((l) => ({
        ...l,
        label: translateLabel(l.label, lang),
      })),
    })),
    editorial: {
      ...cfg.editorial,
      eyebrow: translateLabel(cfg.editorial.eyebrow, lang),
      title: translateLabel(cfg.editorial.title, lang),
      ctaLabel: translateLabel(cfg.editorial.ctaLabel, lang),
    },
  };
}

const BRAND_FR: Record<
  string,
  { tagline: string; description: string }
> = {
  'kiki-men': {
    tagline: 'Mode Homme Audacieuse · Streetwear & Soirée Climat Chaud',
    description:
      'Chemises à col ouvert, ensembles plissés texturés, jeans évasés stacked, t-shirts boxy vintage et mocassins soignés pensés pour les climats chauds.',
  },
  'kiki-luxe': {
    tagline: 'Soirée, Gala & Resort · Robes, Combinaisons & Talons',
    description:
      'Robes de gala brodées, caftans fluides en satin, robes maxi à strass, combi-shorts ajustés, ensembles plissés, talons aiguilles et lunettes en acétate.',
  },
  'kiki-curve': {
    tagline: 'Silhouettes Assumées · Robes de Sortie & Ensembles',
    description:
      'Mini-robes asymétriques, robes longues de gala, jupes doublées et ensembles lounge sans couture conçus pour une coupe audacieuse et respirante.',
  },
  'kiki-sculpt': {
    tagline: 'Compression Seconde Peau · Corsets, Jorts & Baskets',
    description:
      'Bodys sculptants sans couture, corsets structurés en dentelle, jorts en denim 90s et baskets minimalistes pensés pour galber avec aisance.',
  },
  'kiki-sport': {
    tagline: 'Activewear Respirant · Cyclistes & Performance',
    description:
      'Shorts cyclistes sans couture, essentiels studio respirants et silhouettes street-sport légères conçues pour la chaleur et le mouvement.',
  },
  'kiki-kids': {
    tagline: 'Filles & Garçons · Ensembles Street & Quotidien Junior',
    description:
      'Ensembles deux pièces coordonnés, pantalons évasés et ensembles jogger graphiques pour filles et garçons prêts pour chaque week-end.',
  },
};

export function getLocalizedBrands(lang: AppLanguage): BrandLine[] {
  if (lang === 'en') return BRAND_LINES;
  return BRAND_LINES.map((b) => ({
    ...b,
    tagline: BRAND_FR[b.slug]?.tagline || b.tagline,
    description: BRAND_FR[b.slug]?.description || b.description,
  }));
}

const CATEGORY_FR: Record<string, { name: string; subtitle: string; description: string }> = {
  dresses: {
    name: 'Robes',
    subtitle: 'Maxi · Mini · Gala · Resort',
    description:
      'Caftans en satin, robes bustier brodées, robes maxi à strass et mini-robes asymétriques de sortie.',
  },
  'matching-sets': {
    name: 'Ensembles',
    subtitle: 'Ensembles Deux Pièces & Tailleurs',
    description:
      'Ensembles pantalons plissés, ensembles jacquard fleuris, ensembles homme plissés, ensembles zippés et tenues enfants.',
  },
  shoes: {
    name: 'Chaussures',
    subtitle: 'Talons · Mocassins · Baskets',
    description:
      'Talons plateformes aiguilles, escarpins vernis, mocassins à boucle soignés et baskets street monochromes.',
  },
  sunglasses: {
    name: 'Lunettes de soleil',
    subtitle: 'Solaires & Montures',
    description:
      'Lunettes de soleil en acétate sombre et montures architecturales épurées pour les journées ensoleillées.',
  },
  shirts: {
    name: 'Chemises & Hauts',
    subtitle: 'Chemises · Corsets · T-Shirts',
    description:
      'Chemises à col ouvert, corsets structurés, bodys sculptants et t-shirts street coupe boxy.',
  },
  jumpsuits: {
    name: 'Combinaisons & Combi-shorts',
    subtitle: 'Manches Courtes & Denim',
    description:
      'Combi-shorts ajustés à manches courtes, combinaisons denim cintrées et pièces uniques légères.',
  },
  jeans: {
    name: 'Jeans & Pantalons',
    subtitle: 'Stacked · Évasé · Tailleur',
    description:
      'Jeans évasés stacked coupe slim, pantalons cirés plissés et bas streetwear contemporains.',
  },
  bottoms: {
    name: 'Shorts & Bas',
    subtitle: 'Jorts Denim · Crochet · Jupes',
    description:
      'Jorts denim années 90, shorts cargo en denim, micro-shorts en crochet et mini-jupes doublées.',
  },
  activewear: {
    name: 'Sport & Activewear',
    subtitle: 'Cyclistes · Studio · Athlétique',
    description:
      'Cyclistes sans couture, shorts lounge en tricot et t-shirts actifs respirants pour climats chauds.',
  },
  bags: {
    name: 'Sacs',
    subtitle: 'Pochettes & Bandoulières',
    description: 'Mini pochettes structurées en similicuir et sacs de soirée minimalistes.',
  },
  jewelry: {
    name: 'Bijoux',
    subtitle: 'Boucles d’Oreilles & Bracelets',
    description: 'Boucles d’oreilles sculpturales et ensembles de bracelets conçus pour sublimer chaque tenue.',
  },
};

export function getLocalizedCategories(lang: AppLanguage): ProductCategoryTile[] {
  if (lang === 'en') return PRODUCT_CATEGORIES;
  return PRODUCT_CATEGORIES.map((c) => ({
    ...c,
    name: CATEGORY_FR[c.slug]?.name || c.name,
    subtitle: CATEGORY_FR[c.slug]?.subtitle || c.subtitle,
    description: CATEGORY_FR[c.slug]?.description || c.description,
  }));
}

const COLLECTION_FR: Record<
  string,
  { seasonTag: string; title: string; shortTitle: string; subtitle: string; description: string }
> = {
  'after-dark': {
    seasonTag: 'Édition 01 · Soirée & Nuit',
    title: 'Édition After Dark',
    shortTitle: 'After Dark',
    subtitle: 'Robes maxi à strass, corsets en dentelle, pantalons cirés et chemises audacieuses.',
    description:
      'Des pièces de soirée à fort impact pensées pour les nuits chaudes — robes Kiki Luxe, mini-robes Kiki Curve, corsets Kiki Sculpt et silhouettes Kiki Men.',
  },
  formal: {
    seasonTag: 'Édition 02 · Gala & Cérémonie',
    title: 'Soirée & Cérémonie',
    shortTitle: 'Gala',
    subtitle: 'Robes bustier brodées, ensembles tailleurs jacquard, caftans satin et talons.',
    description:
      'Robes longues de gala, tailleurs deux pièces et accessoires raffinés sélectionnés pour les mariages, galas et réceptions.',
  },
  sport: {
    seasonTag: 'Édition 03 · Sport & Studio',
    title: 'Kiki Sport & Activewear',
    shortTitle: 'Sport',
    subtitle: 'Cyclistes sans couture, pièces lounge légères et t-shirts street-sport respirants.',
    description:
      'Une ligne activewear légère et respirante conçue pour le mouvement sous la chaleur, entre Kiki Sport et Kiki Sculpt.',
  },
  essentials: {
    seasonTag: 'Édition 04 · Essentiels Soleil',
    title: 'Collection Essentiels',
    shortTitle: 'Les Essentiels',
    subtitle: 'Bodys sculptants sans couture, ensembles plissés, combi-shorts et chaussures épurées.',
    description:
      'Des bases quotidiennes impeccables conçues pour les climats ensoleillés — chemises fluides, combinaisons ajustées et ensembles polyvalents.',
  },
  'street-collection': {
    seasonTag: 'Édition 05 · Street Urbain',
    title: 'Collection Street Heat',
    shortTitle: 'Street Heat',
    subtitle: 'Jeans stacked évasés, jorts 90s, t-shirts boxy, baskets double laçage et ensembles kids.',
    description:
      'Un streetwear contemporain réunissant Kiki Men, Kiki Sculpt, Kiki Sport et Kiki Kids avec des coupes affirmées et respirantes.',
  },
  'summer-drop': {
    seasonTag: 'Édition 06 · Soleil & Resort',
    title: 'Ensembles Soleil & Resort',
    shortTitle: 'Soleil & Resort',
    subtitle: 'Caftans en satin fluide, micro-shorts crochet, chemises décontractées et lunettes sombres.',
    description:
      'Des silhouettes resort faciles à porter et des ensembles coordonnés pour les journées chaudes, escapades côtières et fins de journée.',
  },
  'exclusive-drop': {
    seasonTag: 'Édition 07 · Touches Finales',
    title: 'Chaussures, Lunettes & Objets',
    shortTitle: 'Accessoires',
    subtitle: 'Talons aiguilles plateformes, mocassins vernis, lunettes en acétate, pochettes et bijoux.',
    description:
      'Des accessoires et chaussures de caractère conçus pour parfaire chaque silhouette Kiki Luxe, Kiki Men, Kiki Curve et Kiki Sculpt.',
  },
};

export function getLocalizedCollections(lang: AppLanguage): EditorialCollection[] {
  if (lang === 'en') return EDITORIAL_COLLECTIONS;
  return EDITORIAL_COLLECTIONS.map((col) => ({
    ...col,
    seasonTag: COLLECTION_FR[col.slug]?.seasonTag || col.seasonTag,
    title: COLLECTION_FR[col.slug]?.title || col.title,
    shortTitle: COLLECTION_FR[col.slug]?.shortTitle || col.shortTitle,
    subtitle: COLLECTION_FR[col.slug]?.subtitle || col.subtitle,
    description: COLLECTION_FR[col.slug]?.description || col.description,
  }));
}

export function getTrendingSearches(lang: AppLanguage): string[] {
  if (lang === 'en') return TRENDING_SEARCHES;
  return [
    'Kiki Men',
    'Kiki Luxe',
    'Kiki Sport',
    'Kiki Curve',
    'Robes',
    'Combinaison',
    'Cyclistes',
    'Chaussures',
    'Lunettes',
    'Jeans Stacked',
  ];
}

export function getSuggestedSearchCategories(lang: AppLanguage) {
  if (lang === 'en') return SUGGESTED_SEARCH_CATEGORIES;
  return [
    { label: 'Acheter par Marque', href: '/brands', countHint: 'Men, Luxe, Curve, Sculpt, Sport, Kids' },
    { label: 'Acheter par Catégorie', href: '/categories', countHint: 'Robes, Ensembles, Combinaisons, Chaussures' },
    { label: 'Soirée & Cérémonie', href: '/collection/formal', countHint: 'Robes de Gala, Tailleurs & Talons' },
    { label: 'Kiki Sport', href: '/brand/kiki-sport', countHint: 'Cyclistes & Activewear Respirant' },
    { label: 'Chaussures', href: '/category/shoes', countHint: 'Talons, Mocassins & Baskets' },
    { label: 'Lunettes de soleil', href: '/category/sunglasses', countHint: 'Acétate Sombre & Optique' },
  ];
}

export function localizeAudienceLabel(audience: string, lang: AppLanguage): string {
  const lower = audience.toLowerCase();
  if (lang === 'en') {
    if (lower === 'women') return 'Women';
    if (lower === 'men') return 'Men';
    if (lower === 'girls') return 'Girls';
    if (lower === 'boys') return 'Boys';
    if (lower === 'accessories') return 'Accessories';
    if (lower === 'unisex') return 'Unisex';
    return audience;
  }
  if (lower === 'women') return 'Femme';
  if (lower === 'men') return 'Homme';
  if (lower === 'girls') return 'Filles';
  if (lower === 'boys') return 'Garçons';
  if (lower === 'accessories') return 'Accessoires';
  if (lower === 'unisex') return 'Unisexe';
  return audience;
}
