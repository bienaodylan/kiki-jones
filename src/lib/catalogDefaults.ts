import { AudienceSlug, Product, StorefrontConfig } from '../types/commerce';
import { KJ_IMAGES } from './navigationData';
import { classifyProductBilingual, getBrandNameBySlug } from './productClassifier';

export const KIKI_JONES_IMAGES = {
  hero: KJ_IMAGES.heroCampaign,
  brandIntro: KJ_IMAGES.bannerAfterDark,
  nextDropBanner: KJ_IMAGES.womenEditorial,
  campaignEssentials: KJ_IMAGES.heroCampaign,
  campaignStreet: KJ_IMAGES.bannerAfterDark,
  essentialsBanner: KJ_IMAGES.heroCampaign,
  streetBanner: KJ_IMAGES.menMeshShirt,
  afterDarkBanner: KJ_IMAGES.bannerAfterDark,
  bannerEssentials: KJ_IMAGES.heroCampaign,
  bannerStreet: KJ_IMAGES.bannerAfterDark,
  womenEditorial: KJ_IMAGES.womenEditorial,
  womenSatinEvening: KJ_IMAGES.womenSatinEvening,
  womenCorsetCargo: KJ_IMAGES.womenCorsetCargo,
  womenResortSet: KJ_IMAGES.womenResortSet,
  menEditorial: KJ_IMAGES.menEditorial,
  menMeshShirt: KJ_IMAGES.menMeshShirt,
  menSatinSet: KJ_IMAGES.menSatinSet,
  menStreetDenim: KJ_IMAGES.menStreetDenim,
  girlsEditorial: KJ_IMAGES.girlsEditorial,
  boysEditorial: KJ_IMAGES.boysEditorial,
  accessoriesEditorial: KJ_IMAGES.accessoriesEditorial,
  shoesFeature: KJ_IMAGES.shoesFeature,
  menShoesFeature: KJ_IMAGES.menShoesFeature,
  sunglassesFeature: KJ_IMAGES.sunglassesFeature,
  bagsFeature: KJ_IMAGES.bagsFeature,
  jewelryFeature: KJ_IMAGES.jewelryFeature,
  curveFeature: KJ_IMAGES.curveFeature,
  curveSetFeature: KJ_IMAGES.curveSetFeature,
  sculptFeature: KJ_IMAGES.sculptFeature,
  sculptBodysuitFeature: KJ_IMAGES.sculptBodysuitFeature,
  sportFeature: KJ_IMAGES.sportFeature,
  menSportFeature: KJ_IMAGES.menSportFeature,
  curveMiniCampaign: KJ_IMAGES.curveMiniCampaign,
  curveGownCampaign: KJ_IMAGES.curveGownCampaign,
  jumpsuitsFeature: KJ_IMAGES.jumpsuitsFeature,
  bottomsFeature: KJ_IMAGES.bottomsFeature,
  formalFeature: KJ_IMAGES.formalFeature,
  catWomen: KJ_IMAGES.womenEditorial,
  catMen: KJ_IMAGES.menEditorial,
  catGirls: KJ_IMAGES.girlsEditorial,
  catBoys: KJ_IMAGES.boysEditorial,
  catAccessories: KJ_IMAGES.accessoriesEditorial,
};

// Backward-compatible alias for admin tools
export const MIREZA_IMAGES = KIKI_JONES_IMAGES;

export const DEFAULT_STOREFRONT_CONFIG: StorefrontConfig = {
  cmsVersion: 9,
  heroImageUrl: KIKI_JONES_IMAGES.hero,
  heroHeadline: 'NOUVELLE SAISON',
  heroSubheadline:
    'Silhouettes contemporaines pour climats chauds signées Kiki Men, Kiki Jones Premium, Kiki Curve, Kiki Sculpt, Kiki Sport et Kiki Kids.',
  heroCtaLabel: 'Découvrir les Nouveautés',
  heroCtaHref: '/new-in',
  heroSecondaryCtaLabel: 'Par Marque',
  heroSecondaryCtaHref: '/brands',
  nextDropLeftTitle: 'Kiki Kids',
  nextDropLeftBody:
    'Ensembles coordonnés et silhouettes urbaines estivales pour filles et garçons.',
  nextDropLeftCtaLabel: 'Boutique Enfants',
  nextDropLeftCtaHref: '/brand/kiki-kids',
  nextDropLeftImageUrl: KIKI_JONES_IMAGES.girlsEditorial,
  nextDropRightTitle: 'Kiki Sport',
  nextDropRightBody:
    'Shorts cyclistes respirants, hauts de studio et essentiels sportifs légers.',
  nextDropRightCtaLabel: 'Boutique Sport',
  nextDropRightCtaHref: '/brand/kiki-sport',
  nextDropRightImageUrl: KIKI_JONES_IMAGES.sportFeature,
  brandIntroEyebrow: 'KIKI JONES · Maison de Marques',
  brandIntroTitle: 'Style Moderne. Pensé pour les Climats Chauds.',
  brandIntroBody:
    'Explorez six labels signatures — Kiki Men, Kiki Jones Premium, Kiki Curve, Kiki Sculpt, Kiki Sport et Kiki Kids — pensés pour un style sûr et sans effort.',
  brandIntroImageUrl: KIKI_JONES_IMAGES.womenResortSet,
  brandIntroCtaLabel: 'Acheter par Marque',
  brandIntroCtaHref: '/brands',
  brandIntroSecondaryCtaLabel: 'Acheter par Catégorie',
  brandIntroSecondaryCtaHref: '/categories',
  sectionOrder: [
    'hero_split',
    'new_arrivals_banner',
    'shop_by_category_strip',
    'kiki_men_split',
    'kiki_sculpt_triptych',
    'women_exclusive_banner',
    'dual_spotlight',
    'shop_by_brand_strip',
  ],
  collectionBanners: [
    {
      id: 'banner_luxe',
      title: 'Kiki Jones Premium · Soirée & Cérémonie',
      subtitle: 'Robes brodées, kaftans en satin, robes maxi à strass, ensembles plissés et talons.',
      ctaLabel: 'Découvrir Kiki Jones Premium',
      href: '/brand/kiki-luxe',
      imageUrl: KIKI_JONES_IMAGES.afterDarkBanner,
    },
  ],
  customSections: [],
  galleryItems: [
    {
      id: 'world_men',
      title: 'Kiki Men',
      caption: 'Chemises de soirée, ensembles texturés, jeans flare et mocassins.',
      imageUrl: KIKI_JONES_IMAGES.menEditorial,
      tag: 'Brand',
    },
    {
      id: 'world_luxe',
      title: 'Kiki Jones Premium',
      caption: 'Robes de soirée, combishorts, stilettos, sacs et lunettes.',
      imageUrl: KIKI_JONES_IMAGES.womenSatinEvening,
      tag: 'Brand',
    },
    {
      id: 'world_curve',
      title: 'Kiki Curve',
      caption: 'Robes courtes de sortie, robes longues et silhouettes affirmées.',
      imageUrl: KIKI_JONES_IMAGES.curveMiniCampaign,
      tag: 'Brand',
    },
    {
      id: 'world_sport',
      title: 'Kiki Sport',
      caption: 'Shorts cyclistes sans couture, tenues studio et sport respirant.',
      imageUrl: KIKI_JONES_IMAGES.sportFeature,
      tag: 'Brand',
    },
  ],
  newsletterTitle: 'Rejoindre la Liste KIKI JONES',
  newsletterBody:
    'Accès prioritaire aux nouveautés hebdomadaires et éditions exclusives Kiki Men, Kiki Jones Premium, Kiki Curve, Kiki Sculpt, Kiki Sport et Kiki Kids.',
  campaignBannerText: 'Nouvelle Collection Disponible — Livraison Standard Offerte dès 75 000 XOF',
  campaignBannerEnabled: true,
  standardShippingXof: 3500,
  expressShippingXof: 7500,
  freeShippingThresholdXof: 75000,
  supportEmail: 'care@kikijones.com',
  supportPhone: '+225 07 00 00 00 00',
};

export const INITIAL_CATEGORIES = [
  {
    id: 'cat_women',
    name: 'Women',
    slug: 'women',
    description:
      'Dresses, matching sets, corsets, bodysuits, heels, and curve styles across Kiki Jones Premium, Kiki Sculpt, and Kiki Curve.',
    imageUrl: KIKI_JONES_IMAGES.catWomen,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat_men',
    name: 'Men',
    slug: 'men',
    description:
      'Statement night-out shirts, crinkle sets, vintage boxy tees, stacked flare denim, and loafers from Kiki Men.',
    imageUrl: KIKI_JONES_IMAGES.catMen,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat_girls',
    name: 'Girls',
    slug: 'girls',
    description:
      'Coordinated flare-leg pant sets and trendy everyday youth pieces from Kiki Kids.',
    imageUrl: KIKI_JONES_IMAGES.catGirls,
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'cat_boys',
    name: 'Boys',
    slug: 'boys',
    description:
      'Graphic jogger sets and confident youth streetwear from Kiki Kids.',
    imageUrl: KIKI_JONES_IMAGES.catBoys,
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'cat_accessories',
    name: 'Accessories',
    slug: 'accessories',
    description:
      'Dark acetate sunglasses, faux-leather clutches, crossbody bags, and statement jewelry.',
    imageUrl: KIKI_JONES_IMAGES.catAccessories,
    sortOrder: 5,
    isActive: true,
  },
];

export const OBSOLETE_CATEGORY_IDS: string[] = [
  'cat_jerseys',
  'cat_bikinis',
  'cat_matching_sets',
  'cat_caps',
  'cat_tapis',
];

export interface SeedProductInput {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  sku: string;
  images: string[];
  runwayModelImageUrl?: string | null;
  colors: { name: string; hex: string }[];
  sizes: string[];
  regularPriceXof: number;
  promoPriceXof: number | null;
  lowStockThreshold: number;
  isNewDrop: boolean;
  newDropOrder: number;
  isFeatured: boolean;
  featuredOrder: number;
  isPreorder?: boolean;
  preorderEstimateDate?: string | null;
  stockMatrix: Record<string, number>;
  audience: AudienceSlug;
  subCategory: string;
  brandSlug: string;
  brandName: string;
  collectionSlugs: string[];
  styleTags: string[];
  isBestSeller?: boolean;
  isTrending?: boolean;
  materialDetails?: string[];
}

export const ALL_SEED_PRODUCTS: SeedProductInput[] = [
  {
    "id": "prod_fn2_01",
    "name": "Pleasant Floral Shirt",
    "slug": "pleasant-floral-shirt",
    "description": "These Mens Shirts are available in most sizes.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-MEN-01",
    "images": [
      "/assets/fashionnova/pleasant-floral-shirt__0.jpg",
      "/assets/fashionnova/pleasant-floral-shirt__1.jpg"
    ],
    "colors": [
      {
        "name": "Red",
        "hex": "#B82832"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "regularPriceXof": 10500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 1,
    "isFeatured": true,
    "featuredOrder": 1,
    "stockMatrix": {
      "Red-S": 8,
      "Red-M": 9,
      "Red-L": 10,
      "Red-XL": 11
    },
    "audience": "men",
    "subCategory": "shirts",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": [
      "essentials",
      "after-dark"
    ],
    "styleTags": [
      "Kiki Men",
      "Shirts"
    ],
    "isBestSeller": true,
    "isTrending": false,
    "materialDetails": [
      "Shell/Lining:100% Polyester",
      "Brand: Kiki Men",
      "Colorway: Red"
    ]
  },
  {
    "id": "prod_fn2_02",
    "name": "Live Wire Waxed Pleat Skinny Flare Pants",
    "slug": "live-wire-waxed-pleat-skinny-flare-pants",
    "description": "These Mens Pants are available in most sizes.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-MEN-02",
    "images": [
      "/assets/fashionnova/live-wire-waxed-pleat-skinny-flare-pants__0.jpg",
      "/assets/fashionnova/live-wire-waxed-pleat-skinny-flare-pants__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "regularPriceXof": 18000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 2,
    "isFeatured": false,
    "featuredOrder": 2,
    "stockMatrix": {
      "Black-S": 9,
      "Black-M": 10,
      "Black-L": 11,
      "Black-XL": 12
    },
    "audience": "men",
    "subCategory": "pants",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": [
      "essentials"
    ],
    "styleTags": [
      "Kiki Men",
      "Pants"
    ],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": [
      "Self: 70% Cotton 28% Polyester 2% Spandex",
      "Brand: Kiki Men",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_03",
    "name": "Saints And Sinners Full Button Shirt",
    "slug": "saints-and-sinners-full-button-shirt",
    "description": "These Mens Shirts are available in most sizes.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-MEN-03",
    "images": [
      "/assets/fashionnova/saints-and-sinners-full-button-shirt__0.jpg",
      "/assets/fashionnova/saints-and-sinners-full-button-shirt__1.jpg"
    ],
    "colors": [
      {
        "name": "Tan",
        "hex": "#C8B49B"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "regularPriceXof": 15000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 3,
    "isFeatured": false,
    "featuredOrder": 3,
    "stockMatrix": {
      "Tan-S": 10,
      "Tan-M": 11,
      "Tan-L": 12,
      "Tan-XL": 13
    },
    "audience": "men",
    "subCategory": "shirts",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": [
      "essentials",
      "after-dark"
    ],
    "styleTags": [
      "Kiki Men",
      "Shirts"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Shell: 100% Polyester",
      "Brand: Kiki Men",
      "Colorway: Tan"
    ]
  },
  {
    "id": "prod_fn2_04",
    "name": "Crinkle Accordion Button Up Shirt",
    "slug": "crinkle-accordion-button-up-shirt",
    "description": "These Mens Woven Tops are available in most sizes.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-MEN-04",
    "images": [
      "/assets/fashionnova/crinkle-accordion-button-up-shirt__0.jpg",
      "/assets/fashionnova/crinkle-accordion-button-up-shirt__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "regularPriceXof": 11500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 4,
    "isFeatured": true,
    "featuredOrder": 4,
    "stockMatrix": {
      "Black-S": 11,
      "Black-M": 12,
      "Black-L": 13,
      "Black-XL": 14
    },
    "audience": "men",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": [
      "essentials",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Men",
      "Matching Sets"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "40% Rayon 20% Nylon 32% Lyocell 8% Linen",
      "Brand: Kiki Men",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_05",
    "name": "Crinkle Accordion Relaxed Short",
    "slug": "crinkle-accordion-relaxed-short",
    "description": "These Mens NonDenim Shorts are available in most sizes.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-MEN-05",
    "images": [
      "/assets/fashionnova/crinkle-accordion-relaxed-short__0.jpg",
      "/assets/fashionnova/crinkle-accordion-relaxed-short__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "regularPriceXof": 8500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 5,
    "isFeatured": false,
    "featuredOrder": 5,
    "stockMatrix": {
      "Black-S": 12,
      "Black-M": 13,
      "Black-L": 14,
      "Black-XL": 15
    },
    "audience": "men",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": [
      "essentials",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Men",
      "Matching Sets"
    ],
    "isBestSeller": true,
    "isTrending": true,
    "materialDetails": [
      "Self: 40% Rayon 20% Nylon 32% Lyocell 8% Linen",
      "Brand: Kiki Men",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_06",
    "name": "Rowan Stretch Relaxed Short",
    "slug": "rowan-stretch-relaxed-short",
    "description": "These Mens NonDenim Shorts are available in most sizes.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-MEN-06",
    "images": [
      "/assets/fashionnova/rowan-stretch-relaxed-short__0.jpg",
      "/assets/fashionnova/rowan-stretch-relaxed-short__1.jpg"
    ],
    "colors": [
      {
        "name": "Beige",
        "hex": "#C8B49B"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "regularPriceXof": 10500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 6,
    "isFeatured": false,
    "featuredOrder": 6,
    "stockMatrix": {
      "Beige-S": 13,
      "Beige-M": 14,
      "Beige-L": 15,
      "Beige-XL": 16
    },
    "audience": "men",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": [
      "essentials",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Men",
      "Matching Sets"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "72% Polyester 22% Viscose 6% Spandex",
      "Brand: Kiki Men",
      "Colorway: Beige"
    ]
  },
  {
    "id": "prod_fn2_07",
    "name": "No Curfew Vintage Boxy Long Sleeve Tee",
    "slug": "no-curfew-vintage-boxy-long-sleeve-tee",
    "description": "These Mens Screen Tops are available in most sizes.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-MEN-07",
    "images": [
      "/assets/fashionnova/no-curfew-vintage-boxy-long-sleeve-tee__0.jpg",
      "/assets/fashionnova/no-curfew-vintage-boxy-long-sleeve-tee__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "regularPriceXof": 16500,
    "promoPriceXof": 14000,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 7,
    "isFeatured": true,
    "featuredOrder": 7,
    "stockMatrix": {
      "Black-S": 14,
      "Black-M": 15,
      "Black-L": 16,
      "Black-XL": 8
    },
    "audience": "men",
    "subCategory": "tops",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": [
      "essentials",
      "street-collection"
    ],
    "styleTags": [
      "Kiki Men",
      "Tops"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "100% Cotton",
      "Brand: Kiki Men",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_08",
    "name": "Creative Dept 87 Distressed Vintage Boxy Short Sleeve Tee",
    "slug": "creative-dept-87-distressed-vintage-boxy-short-sleeve-tee",
    "description": "These Mens Screen Tops are available in most sizes.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-MEN-08",
    "images": [
      "/assets/fashionnova/creative-dept-87-distressed-vintage-boxy-short-sleeve-tee__0.jpg",
      "/assets/fashionnova/creative-dept-87-distressed-vintage-boxy-short-sleeve-tee__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "regularPriceXof": 12500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 8,
    "isFeatured": false,
    "featuredOrder": 8,
    "stockMatrix": {
      "Black-S": 15,
      "Black-M": 16,
      "Black-L": 8,
      "Black-XL": 9
    },
    "audience": "men",
    "subCategory": "tops",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": [
      "essentials",
      "street-collection"
    ],
    "styleTags": [
      "Kiki Men",
      "Tops"
    ],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": [
      "100% Cotton",
      "Brand: Kiki Men",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_09",
    "name": "Undercover Slim Stacked Flare Jeans",
    "slug": "undercover-slim-stacked-flare-jeans",
    "description": "These Mens Jeans are available in most sizes.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-MEN-09",
    "images": [
      "/assets/fashionnova/undercover-slim-stacked-flare-jeans__0.jpg",
      "/assets/fashionnova/undercover-slim-stacked-flare-jeans__1.jpg"
    ],
    "colors": [
      {
        "name": "Black Wash",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "regularPriceXof": 15500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 9,
    "isFeatured": false,
    "featuredOrder": 9,
    "stockMatrix": {
      "Black Wash-S": 16,
      "Black Wash-M": 8,
      "Black Wash-L": 9,
      "Black Wash-XL": 10
    },
    "audience": "men",
    "subCategory": "jeans",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": [
      "essentials",
      "street-collection"
    ],
    "styleTags": [
      "Kiki Men",
      "Jeans"
    ],
    "isBestSeller": true,
    "isTrending": false,
    "materialDetails": [
      "75% Cotton 23% Polyester 2% Spandex",
      "Brand: Kiki Men",
      "Colorway: Black Wash"
    ]
  },
  {
    "id": "prod_fn2_10",
    "name": "Dreamy Stacked Slim Flare Jeans",
    "slug": "dreamy-stacked-slim-flare-jeans",
    "description": "These Mens Jeans are available in most sizes.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-MEN-10",
    "images": [
      "/assets/fashionnova/dreamy-stacked-slim-flare-jeans__0.jpg",
      "/assets/fashionnova/dreamy-stacked-slim-flare-jeans__1.jpg"
    ],
    "colors": [
      {
        "name": "Black Wash",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "regularPriceXof": 9500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 10,
    "isFeatured": true,
    "featuredOrder": 10,
    "stockMatrix": {
      "Black Wash-S": 8,
      "Black Wash-M": 9,
      "Black Wash-L": 10,
      "Black Wash-XL": 11
    },
    "audience": "men",
    "subCategory": "jeans",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": [
      "essentials",
      "street-collection"
    ],
    "styleTags": [
      "Kiki Men",
      "Jeans"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "67% Cotton28% Polyester 3% Viscose 2% Spandex",
      "Brand: Kiki Men",
      "Colorway: Black Wash"
    ]
  },
  {
    "id": "prod_fn2_11",
    "name": "Tassle Polished Buckle Loafer",
    "slug": "tassle-polished-buckle-loafer",
    "description": "These Mens Shoes are available in most sizes.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-MEN-11",
    "images": [
      "/assets/fashionnova/tassle-polished-buckle-loafer__0.jpg",
      "/assets/fashionnova/tassle-polished-buckle-loafer__1.jpg"
    ],
    "colors": [
      {
        "name": "Dark Brown",
        "hex": "#3F271E"
      }
    ],
    "sizes": [
      "41",
      "42",
      "43",
      "44",
      "45"
    ],
    "regularPriceXof": 24000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 11,
    "isFeatured": false,
    "featuredOrder": 11,
    "stockMatrix": {
      "Dark Brown-41": 9,
      "Dark Brown-42": 10,
      "Dark Brown-43": 11,
      "Dark Brown-44": 12,
      "Dark Brown-45": 13
    },
    "audience": "men",
    "subCategory": "shoes",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": [
      "essentials",
      "street-collection",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Men",
      "Shoes"
    ],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": [
      "Brand: Kiki Men",
      "Colorway: Dark Brown",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn2_12",
    "name": "Color Block Slip On Loafers",
    "slug": "color-block-slip-on-loafers",
    "description": "These Mens Shoes are available in most sizes.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-MEN-12",
    "images": [
      "/assets/fashionnova/color-block-slip-on-loafers__0.jpg",
      "/assets/fashionnova/color-block-slip-on-loafers__1.jpg"
    ],
    "colors": [
      {
        "name": "Black/White",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "41",
      "42",
      "43",
      "44",
      "45"
    ],
    "regularPriceXof": 24000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 12,
    "isFeatured": false,
    "featuredOrder": 12,
    "stockMatrix": {
      "Black/White-41": 10,
      "Black/White-42": 11,
      "Black/White-43": 12,
      "Black/White-44": 13,
      "Black/White-45": 14
    },
    "audience": "men",
    "subCategory": "shoes",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": [
      "essentials",
      "street-collection",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Men",
      "Shoes"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Brand: Kiki Men",
      "Colorway: Black/White",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn2_13",
    "name": "Sabina Satin Kaftan Dress",
    "slug": "sabina-satin-kaftan-dress",
    "description": "These Luxe are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-LUX-13",
    "images": [
      "/assets/fashionnova/sabina-satin-kaftan-dress__0.jpg",
      "/assets/fashionnova/sabina-satin-kaftan-dress__1.jpg"
    ],
    "colors": [
      {
        "name": "Pink",
        "hex": "#D98AA8"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "regularPriceXof": 50000,
    "promoPriceXof": 42500,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 13,
    "isFeatured": true,
    "featuredOrder": 13,
    "stockMatrix": {
      "Pink-XS": 11,
      "Pink-S": 12,
      "Pink-M": 13,
      "Pink-L": 14
    },
    "audience": "women",
    "subCategory": "dresses",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Dresses"
    ],
    "isBestSeller": true,
    "isTrending": false,
    "materialDetails": [
      "Shell : 97% Polyester 3% Spandex, Lining : 100% Polyester",
      "Brand: Kiki Jones Premium",
      "Colorway: Pink"
    ]
  },
  {
    "id": "prod_fn2_14",
    "name": "Sierra Kaftan Maxi Dress",
    "slug": "sierra-kaftan-maxi-dress",
    "description": "These Luxe are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-LUX-14",
    "images": [
      "/assets/fashionnova/sierra-kaftan-maxi-dress__0.jpg",
      "/assets/fashionnova/sierra-kaftan-maxi-dress__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "regularPriceXof": 52500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 14,
    "isFeatured": false,
    "featuredOrder": 14,
    "stockMatrix": {
      "Black-XS": 12,
      "Black-S": 13,
      "Black-M": 14,
      "Black-L": 15
    },
    "audience": "women",
    "subCategory": "dresses",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Dresses"
    ],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": [
      "60% Polyester 32% Rayon 8% Spandex",
      "Brand: Kiki Jones Premium",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_15",
    "name": "Alexis Rhinestone Maxi Dress",
    "slug": "alexis-rhinestone-maxi-dress",
    "description": "These Luxe are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-LUX-15",
    "images": [
      "/assets/fashionnova/alexis-rhinestone-maxi-dress__0.jpg",
      "/assets/fashionnova/alexis-rhinestone-maxi-dress__1.jpg"
    ],
    "colors": [
      {
        "name": "Chocolate",
        "hex": "#3F271E"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "regularPriceXof": 77000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 15,
    "isFeatured": false,
    "featuredOrder": 15,
    "stockMatrix": {
      "Chocolate-XS": 13,
      "Chocolate-S": 14,
      "Chocolate-M": 15,
      "Chocolate-L": 16
    },
    "audience": "women",
    "subCategory": "dresses",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Dresses"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Self: 93% Nylon 7% Spandex",
      "Brand: Kiki Jones Premium",
      "Colorway: Chocolate"
    ]
  },
  {
    "id": "prod_fn2_16",
    "name": "Paris Pleated Pant Set",
    "slug": "paris-pleated-pant-set",
    "description": "These Luxe are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-LUX-16",
    "images": [
      "/assets/fashionnova/paris-pleated-pant-set__0.jpg",
      "/assets/fashionnova/paris-pleated-pant-set__1.jpg"
    ],
    "colors": [
      {
        "name": "Black/White",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "regularPriceXof": 48500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 16,
    "isFeatured": true,
    "featuredOrder": 16,
    "stockMatrix": {
      "Black/White-XS": 14,
      "Black/White-S": 15,
      "Black/White-M": 16,
      "Black/White-L": 8
    },
    "audience": "women",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Matching Sets"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Top Self: 97% Polyester 3% Spandex, Pant Self: 100% Polyester, Top Lining: 100% Polyester",
      "Brand: Kiki Jones Premium",
      "Colorway: Black/White"
    ]
  },
  {
    "id": "prod_fn2_17",
    "name": "Kinsley Floral Applique Pant Set",
    "slug": "kinsley-floral-applique-pant-set",
    "description": "These Luxe are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-LUX-17",
    "images": [
      "/assets/fashionnova/kinsley-floral-applique-pant-set__0.jpg",
      "/assets/fashionnova/kinsley-floral-applique-pant-set__1.jpg"
    ],
    "colors": [
      {
        "name": "Black/Red",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "regularPriceXof": 71500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 17,
    "isFeatured": false,
    "featuredOrder": 17,
    "stockMatrix": {
      "Black/Red-XS": 15,
      "Black/Red-S": 16,
      "Black/Red-M": 8,
      "Black/Red-L": 9
    },
    "audience": "women",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Matching Sets"
    ],
    "isBestSeller": true,
    "isTrending": true,
    "materialDetails": [
      "Blazer Shell: 95% Polyester 5% Spandex, Lining: 95% Polyester 5% Spandex, Decoration: 100% Polyester, Pants Shell & Pocketing: 95% Polyester 5% Spandex",
      "Brand: Kiki Jones Premium",
      "Colorway: Black/Red"
    ]
  },
  {
    "id": "prod_fn2_18",
    "name": "Bari Patent Slingback Pumps",
    "slug": "bari-patent-slingback-pumps",
    "description": "These Shoes are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-LUX-18",
    "images": [
      "/assets/fashionnova/bari-patent-slingback-pumps__0.jpg",
      "/assets/fashionnova/bari-patent-slingback-pumps__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "37",
      "38",
      "39",
      "40",
      "41"
    ],
    "regularPriceXof": 16500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 18,
    "isFeatured": false,
    "featuredOrder": 18,
    "stockMatrix": {
      "Black-37": 16,
      "Black-38": 8,
      "Black-39": 9,
      "Black-40": 10,
      "Black-41": 11
    },
    "audience": "women",
    "subCategory": "shoes",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "street-collection",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Shoes"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Brand: Kiki Jones Premium",
      "Colorway: Black",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn2_19",
    "name": "Unmatched Energy Platform Stiletto Heels",
    "slug": "unmatched-energy-platform-stiletto-heels",
    "description": "These Shoes are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-LUX-19",
    "images": [
      "/assets/fashionnova/unmatched-energy-platform-stiletto-heels__0.jpg",
      "/assets/fashionnova/unmatched-energy-platform-stiletto-heels__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "37",
      "38",
      "39",
      "40",
      "41"
    ],
    "regularPriceXof": 19000,
    "promoPriceXof": 16000,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 19,
    "isFeatured": true,
    "featuredOrder": 19,
    "stockMatrix": {
      "Black-37": 8,
      "Black-38": 9,
      "Black-39": 10,
      "Black-40": 11,
      "Black-41": 12
    },
    "audience": "women",
    "subCategory": "shoes",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "street-collection",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Shoes"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Brand: Kiki Jones Premium",
      "Colorway: Black",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn2_20",
    "name": "Kiki Sculpt Seamless Strong Compression Zip Front Thigh Shaping Bodysuit",
    "slug": "nova-sculpt-seamless-strong-compression-zip-front-thigh-shaping-bodysuit",
    "description": "These Lingerie & Sleepwear are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-SCU-20",
    "images": [
      "/assets/fashionnova/nova-sculpt-seamless-strong-compression-zip-front-thigh-shaping-bodysuit__0.jpg",
      "/assets/fashionnova/nova-sculpt-seamless-strong-compression-zip-front-thigh-shaping-bodysuit__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "regularPriceXof": 14000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": false,
    "newDropOrder": 20,
    "isFeatured": false,
    "featuredOrder": 20,
    "stockMatrix": {
      "Black-XS": 9,
      "Black-S": 10,
      "Black-M": 11,
      "Black-L": 12
    },
    "audience": "women",
    "subCategory": "tops",
    "brandSlug": "kiki-sculpt",
    "brandName": "Kiki Sculpt",
    "collectionSlugs": [
      "essentials",
      "street-collection"
    ],
    "styleTags": [
      "Kiki Sculpt",
      "Tops"
    ],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": [
      "Self : 74% Nylon 26% Spandex",
      "Brand: Kiki Sculpt",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_21",
    "name": "Kiki Sculpt Seamless Strong Compression Strapless Thong Bodysuit",
    "slug": "nova-sculpt-seamless-strong-compression-strapless-thong-bodysuit",
    "description": "These Lingerie & Sleepwear are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-SCU-21",
    "images": [
      "/assets/fashionnova/nova-sculpt-seamless-strong-compression-strapless-thong-bodysuit__0.jpg",
      "/assets/fashionnova/nova-sculpt-seamless-strong-compression-strapless-thong-bodysuit__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "regularPriceXof": 10000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 21,
    "isFeatured": false,
    "featuredOrder": 21,
    "stockMatrix": {
      "Black-XS": 10,
      "Black-S": 11,
      "Black-M": 12,
      "Black-L": 13
    },
    "audience": "women",
    "subCategory": "tops",
    "brandSlug": "kiki-sculpt",
    "brandName": "Kiki Sculpt",
    "collectionSlugs": [
      "essentials",
      "street-collection"
    ],
    "styleTags": [
      "Kiki Sculpt",
      "Tops"
    ],
    "isBestSeller": true,
    "isTrending": false,
    "materialDetails": [
      "74% Nylon 26% Spandex",
      "Brand: Kiki Sculpt",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_22",
    "name": "Kiki Sculpt Seamless Strong Compression Thong Bodysuit",
    "slug": "nova-sculpt-seamless-strong-compression-thong-bodysuit",
    "description": "These Lingerie & Sleepwear are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-SCU-22",
    "images": [
      "/assets/fashionnova/nova-sculpt-seamless-strong-compression-thong-bodysuit__0.jpg",
      "/assets/fashionnova/nova-sculpt-seamless-strong-compression-thong-bodysuit__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "regularPriceXof": 11000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": false,
    "newDropOrder": 22,
    "isFeatured": true,
    "featuredOrder": 22,
    "stockMatrix": {
      "Black-XS": 11,
      "Black-S": 12,
      "Black-M": 13,
      "Black-L": 14
    },
    "audience": "women",
    "subCategory": "tops",
    "brandSlug": "kiki-sculpt",
    "brandName": "Kiki Sculpt",
    "collectionSlugs": [
      "essentials",
      "street-collection"
    ],
    "styleTags": [
      "Kiki Sculpt",
      "Tops"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "74% Nylon 26% Spandex",
      "Brand: Kiki Sculpt",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_23",
    "name": "Jackie Lace Strapless Corset Bodysuit",
    "slug": "jackie-lace-strapless-corset-bodysuit",
    "description": "These Bodysuits are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-SCU-23",
    "images": [
      "/assets/fashionnova/jackie-lace-strapless-corset-bodysuit__0.jpg",
      "/assets/fashionnova/jackie-lace-strapless-corset-bodysuit__1.jpg"
    ],
    "colors": [
      {
        "name": "Chocolate",
        "hex": "#3F271E"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "regularPriceXof": 16500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 23,
    "isFeatured": false,
    "featuredOrder": 23,
    "stockMatrix": {
      "Chocolate-XS": 12,
      "Chocolate-S": 13,
      "Chocolate-M": 14,
      "Chocolate-L": 15
    },
    "audience": "women",
    "subCategory": "tops",
    "brandSlug": "kiki-sculpt",
    "brandName": "Kiki Sculpt",
    "collectionSlugs": [
      "essentials",
      "street-collection"
    ],
    "styleTags": [
      "Kiki Sculpt",
      "Tops"
    ],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": [
      "Shell 1: 95% Nylon 5% Spandex, Shell 2: 85% Polyester 15% Spandex, Shell 3: 100% Polyester, Contrast 1: 88% Nylon 12% Spandex, Contrast 2: 92% Polyester 8% Spandex, Lining 1: 85% Polyester 15% Spandex, Lining 2: 100% Polyester",
      "Brand: Kiki Sculpt",
      "Colorway: Chocolate"
    ]
  },
  {
    "id": "prod_fn2_24",
    "name": "Irma Long Sleeve Corset Top",
    "slug": "irma-long-sleeve-corset-top",
    "description": "These Knit Tops are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-SCU-24",
    "images": [
      "/assets/fashionnova/irma-long-sleeve-corset-top__0.jpg",
      "/assets/fashionnova/irma-long-sleeve-corset-top__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "regularPriceXof": 16500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": false,
    "newDropOrder": 24,
    "isFeatured": false,
    "featuredOrder": 24,
    "stockMatrix": {
      "Black-XS": 13,
      "Black-S": 14,
      "Black-M": 15,
      "Black-L": 16
    },
    "audience": "women",
    "subCategory": "tops",
    "brandSlug": "kiki-sculpt",
    "brandName": "Kiki Sculpt",
    "collectionSlugs": [
      "essentials",
      "street-collection"
    ],
    "styleTags": [
      "Kiki Sculpt",
      "Tops"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Shell1: 69% Rayon 27% Nylon 4% Spandex, Shell2: 88% Nylon 12% Spandex",
      "Brand: Kiki Sculpt",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_25",
    "name": "Second Skin Double Lined Front Tie Mini Skirt",
    "slug": "second-skin-double-lined-front-tie-mini-skirt",
    "description": "These Skirts are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-CUR-25",
    "images": [
      "/assets/fashionnova/second-skin-double-lined-front-tie-mini-skirt__0.jpg",
      "/assets/fashionnova/second-skin-double-lined-front-tie-mini-skirt__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "1X",
      "2X",
      "3X"
    ],
    "regularPriceXof": 15500,
    "promoPriceXof": 13000,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 25,
    "isFeatured": true,
    "featuredOrder": 25,
    "stockMatrix": {
      "Black-1X": 14,
      "Black-2X": 15,
      "Black-3X": 16
    },
    "audience": "women",
    "subCategory": "dresses",
    "brandSlug": "kiki-curve",
    "brandName": "Kiki Curve",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Curve",
      "Dresses"
    ],
    "isBestSeller": true,
    "isTrending": false,
    "materialDetails": [
      "Shell & Lining  : 80% Nylon 20% Spandex",
      "Brand: Kiki Curve",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_26",
    "name": "Zoe Asymmetrical Lace Trim Mini Dress",
    "slug": "zoe-asymmetrical-lace-trim-mini-dress",
    "description": "These Dresses are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-CUR-26",
    "images": [
      "/assets/fashionnova/zoe-asymmetrical-lace-trim-mini-dress__0.jpg",
      "/assets/fashionnova/zoe-asymmetrical-lace-trim-mini-dress__1.jpg"
    ],
    "colors": [
      {
        "name": "Chocolate",
        "hex": "#3F271E"
      }
    ],
    "sizes": [
      "1X",
      "2X",
      "3X"
    ],
    "regularPriceXof": 18000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": false,
    "newDropOrder": 26,
    "isFeatured": false,
    "featuredOrder": 26,
    "stockMatrix": {
      "Chocolate-1X": 15,
      "Chocolate-2X": 16,
      "Chocolate-3X": 8
    },
    "audience": "women",
    "subCategory": "dresses",
    "brandSlug": "kiki-curve",
    "brandName": "Kiki Curve",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Curve",
      "Dresses"
    ],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": [
      "Self: 96% Polyester 4% Spandex, Contrast: 100% Polyester, Lining: 100% Polyester",
      "Brand: Kiki Curve",
      "Colorway: Chocolate"
    ]
  },
  {
    "id": "prod_fn2_27",
    "name": "Candace Lounge Set",
    "slug": "candace-lounge-set",
    "description": "These Matching Sets are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-CUR-27",
    "images": [
      "/assets/fashionnova/candace-lounge-set__0.jpg",
      "/assets/fashionnova/candace-lounge-set__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "1X",
      "2X",
      "3X"
    ],
    "regularPriceXof": 14000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 27,
    "isFeatured": false,
    "featuredOrder": 27,
    "stockMatrix": {
      "Black-1X": 16,
      "Black-2X": 8,
      "Black-3X": 9
    },
    "audience": "women",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-curve",
    "brandName": "Kiki Curve",
    "collectionSlugs": [
      "essentials",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Curve",
      "Matching Sets"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "100% Polyester",
      "Brand: Kiki Curve",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_28",
    "name": "All Love Seamless Zip Up Legging Set",
    "slug": "all-love-seamless-zip-up-legging-set",
    "description": "These Matching Sets are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-CUR-28",
    "images": [
      "/assets/fashionnova/all-love-seamless-zip-up-legging-set__0.jpg",
      "/assets/fashionnova/all-love-seamless-zip-up-legging-set__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "1X",
      "2X",
      "3X"
    ],
    "regularPriceXof": 10500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": false,
    "newDropOrder": 28,
    "isFeatured": true,
    "featuredOrder": 28,
    "stockMatrix": {
      "Black-1X": 8,
      "Black-2X": 9,
      "Black-3X": 10
    },
    "audience": "women",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-curve",
    "brandName": "Kiki Curve",
    "collectionSlugs": [
      "essentials",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Curve",
      "Matching Sets"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Self: 94% Polyester 6% Spandex",
      "Brand: Kiki Curve",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_29",
    "name": "Mini Paparazzi II Legging Set",
    "slug": "mini-paparazzi-ii-legging-set",
    "description": "These Kids Sets are available in most sizes.",
    "categoryId": "cat_girls",
    "categoryName": "Girls",
    "sku": "KJ-KID-29",
    "images": [
      "/assets/fashionnova/mini-paparazzi-ii-legging-set__0.jpg",
      "/assets/fashionnova/mini-paparazzi-ii-legging-set__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "6-8Y",
      "8-10Y",
      "10-12Y",
      "12-14Y"
    ],
    "regularPriceXof": 7500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 29,
    "isFeatured": false,
    "featuredOrder": 29,
    "stockMatrix": {
      "Black-6-8Y": 9,
      "Black-8-10Y": 10,
      "Black-10-12Y": 11,
      "Black-12-14Y": 12
    },
    "audience": "girls",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-kids",
    "brandName": "Kiki Kids",
    "collectionSlugs": [
      "essentials",
      "street-collection",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Kids",
      "Matching Sets"
    ],
    "isBestSeller": true,
    "isTrending": true,
    "materialDetails": [
      "Top And Bottom: 95% Cotton 5% Spandex",
      "Brand: Kiki Kids",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_30",
    "name": "Mini Be Amazing Pant Set",
    "slug": "mini-be-amazing-pant-set",
    "description": "These Kids Sets are available in most sizes.",
    "categoryId": "cat_girls",
    "categoryName": "Girls",
    "sku": "KJ-KID-30",
    "images": [
      "/assets/fashionnova/mini-be-amazing-pant-set__0.jpg",
      "/assets/fashionnova/mini-be-amazing-pant-set__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "6-8Y",
      "8-10Y",
      "10-12Y",
      "12-14Y"
    ],
    "regularPriceXof": 16500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": false,
    "newDropOrder": 30,
    "isFeatured": false,
    "featuredOrder": 30,
    "stockMatrix": {
      "Black-6-8Y": 10,
      "Black-8-10Y": 11,
      "Black-10-12Y": 12,
      "Black-12-14Y": 13
    },
    "audience": "girls",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-kids",
    "brandName": "Kiki Kids",
    "collectionSlugs": [
      "essentials",
      "street-collection",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Kids",
      "Matching Sets"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "100% Polyester",
      "Brand: Kiki Kids",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_31",
    "name": "Mini Hello Kitty Wild Side Flare Leg Pant Set",
    "slug": "mini-hello-kitty-wild-side-flare-leg-pant-set",
    "description": "These Kids Sets are available in most sizes.",
    "categoryId": "cat_girls",
    "categoryName": "Girls",
    "sku": "KJ-KID-31",
    "images": [
      "/assets/fashionnova/mini-hello-kitty-wild-side-flare-leg-pant-set__0.jpg",
      "/assets/fashionnova/mini-hello-kitty-wild-side-flare-leg-pant-set__1.jpg"
    ],
    "colors": [
      {
        "name": "Ivory",
        "hex": "#F5F2EB"
      }
    ],
    "sizes": [
      "6-8Y",
      "8-10Y",
      "10-12Y",
      "12-14Y"
    ],
    "regularPriceXof": 16500,
    "promoPriceXof": 14000,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 31,
    "isFeatured": true,
    "featuredOrder": 31,
    "stockMatrix": {
      "Ivory-6-8Y": 11,
      "Ivory-8-10Y": 12,
      "Ivory-10-12Y": 13,
      "Ivory-12-14Y": 14
    },
    "audience": "girls",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-kids",
    "brandName": "Kiki Kids",
    "collectionSlugs": [
      "essentials",
      "street-collection",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Kids",
      "Matching Sets"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Top Self: 60% Cotton 40% Polyester, Bottom Self: 60% Cotton 36% Polyester 4% Spandex",
      "Brand: Kiki Kids",
      "Colorway: Ivory"
    ]
  },
  {
    "id": "prod_fn2_32",
    "name": "Mini Rich Jogger Pant Set",
    "slug": "mini-rich-jogger-pant-set",
    "description": "These Kids Sets are available in most sizes.",
    "categoryId": "cat_boys",
    "categoryName": "Boys",
    "sku": "KJ-KID-32",
    "images": [
      "/assets/fashionnova/mini-rich-jogger-pant-set__0.jpg",
      "/assets/fashionnova/mini-rich-jogger-pant-set__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "6-8Y",
      "8-10Y",
      "10-12Y",
      "12-14Y"
    ],
    "regularPriceXof": 7500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": false,
    "newDropOrder": 32,
    "isFeatured": false,
    "featuredOrder": 32,
    "stockMatrix": {
      "Black-6-8Y": 12,
      "Black-8-10Y": 13,
      "Black-10-12Y": 14,
      "Black-12-14Y": 15
    },
    "audience": "boys",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-kids",
    "brandName": "Kiki Kids",
    "collectionSlugs": [
      "essentials",
      "street-collection",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Kids",
      "Matching Sets"
    ],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": [
      "100% Polyester",
      "Brand: Kiki Kids",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_33",
    "name": "Mini Grind Over Glory Jogger Pant Set",
    "slug": "mini-grind-over-glory-jogger-pant-set",
    "description": "These Kids Sets are available in most sizes.",
    "categoryId": "cat_boys",
    "categoryName": "Boys",
    "sku": "KJ-KID-33",
    "images": [
      "/assets/fashionnova/mini-grind-over-glory-jogger-pant-set__0.jpg",
      "/assets/fashionnova/mini-grind-over-glory-jogger-pant-set__1.jpg"
    ],
    "colors": [
      {
        "name": "Orange",
        "hex": "#DC6A2B"
      }
    ],
    "sizes": [
      "6-8Y",
      "8-10Y",
      "10-12Y",
      "12-14Y"
    ],
    "regularPriceXof": 16500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 33,
    "isFeatured": false,
    "featuredOrder": 33,
    "stockMatrix": {
      "Orange-6-8Y": 13,
      "Orange-8-10Y": 14,
      "Orange-10-12Y": 15,
      "Orange-12-14Y": 16
    },
    "audience": "boys",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-kids",
    "brandName": "Kiki Kids",
    "collectionSlugs": [
      "essentials",
      "street-collection",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Kids",
      "Matching Sets"
    ],
    "isBestSeller": true,
    "isTrending": false,
    "materialDetails": [
      "Top And Bottom: 100% Polyester",
      "Brand: Kiki Kids",
      "Colorway: Orange"
    ]
  },
  {
    "id": "prod_fn2_34",
    "name": "Mini Los Angeles Made Jogger Pant Set",
    "slug": "mini-los-angeles-made-jogger-pant-set",
    "description": "These Kids Sets are available in most sizes.",
    "categoryId": "cat_boys",
    "categoryName": "Boys",
    "sku": "KJ-KID-34",
    "images": [
      "/assets/fashionnova/mini-los-angeles-made-jogger-pant-set__0.jpg",
      "/assets/fashionnova/mini-los-angeles-made-jogger-pant-set__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "6-8Y",
      "8-10Y",
      "10-12Y",
      "12-14Y"
    ],
    "regularPriceXof": 16500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": false,
    "newDropOrder": 34,
    "isFeatured": true,
    "featuredOrder": 34,
    "stockMatrix": {
      "Black-6-8Y": 14,
      "Black-8-10Y": 15,
      "Black-10-12Y": 16,
      "Black-12-14Y": 8
    },
    "audience": "boys",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-kids",
    "brandName": "Kiki Kids",
    "collectionSlugs": [
      "essentials",
      "street-collection",
      "summer-drop"
    ],
    "styleTags": [
      "Kiki Kids",
      "Matching Sets"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "100% Polyester",
      "Brand: Kiki Kids",
      "Colorway: Black"
    ]
  },
  {
    "id": "prod_fn2_35",
    "name": "First In Line Sunglasses",
    "slug": "first-in-line-sunglasses",
    "description": "These Sunglasses are available in most sizes.",
    "categoryId": "cat_accessories",
    "categoryName": "Accessories",
    "sku": "KJ-LUX-35",
    "images": [
      "/assets/fashionnova/first-in-line-sunglasses__0.jpg",
      "/assets/fashionnova/first-in-line-sunglasses__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "ONE SIZE"
    ],
    "regularPriceXof": 4500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 35,
    "isFeatured": false,
    "featuredOrder": 35,
    "stockMatrix": {
      "Black-ONE SIZE": 15
    },
    "audience": "unisex",
    "subCategory": "sunglasses",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "summer-drop",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Sunglasses"
    ],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": [
      "Brand: Kiki Jones Premium",
      "Colorway: Black",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn2_36",
    "name": "Executive Meeting Blue Light Glasses",
    "slug": "executive-meeting-blue-light-glasses",
    "description": "These Sunglasses are available in most sizes.",
    "categoryId": "cat_accessories",
    "categoryName": "Accessories",
    "sku": "KJ-LUX-36",
    "images": [
      "/assets/fashionnova/executive-meeting-blue-light-glasses__0.jpg",
      "/assets/fashionnova/executive-meeting-blue-light-glasses__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "ONE SIZE"
    ],
    "regularPriceXof": 6000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": false,
    "newDropOrder": 36,
    "isFeatured": false,
    "featuredOrder": 36,
    "stockMatrix": {
      "Black-ONE SIZE": 16
    },
    "audience": "unisex",
    "subCategory": "sunglasses",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "summer-drop",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Sunglasses"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Brand: Kiki Jones Premium",
      "Colorway: Black",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn2_37",
    "name": "Pretty Blush Sunglasses",
    "slug": "pretty-blush-sunglasses",
    "description": "These Sunglasses are available in most sizes.",
    "categoryId": "cat_accessories",
    "categoryName": "Accessories",
    "sku": "KJ-LUX-37",
    "images": [
      "/assets/fashionnova/pretty-blush-sunglasses__0.jpg",
      "/assets/fashionnova/pretty-blush-sunglasses__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "ONE SIZE"
    ],
    "regularPriceXof": 4500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 37,
    "isFeatured": true,
    "featuredOrder": 37,
    "stockMatrix": {
      "Black-ONE SIZE": 8
    },
    "audience": "unisex",
    "subCategory": "sunglasses",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "summer-drop",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Sunglasses"
    ],
    "isBestSeller": true,
    "isTrending": false,
    "materialDetails": [
      "Brand: Kiki Jones Premium",
      "Colorway: Black",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn2_38",
    "name": "Lil' Link Mini Faux Leather Clutch",
    "slug": "lil-link-mini-faux-leather-clutch",
    "description": "These Handbags are available in most sizes.",
    "categoryId": "cat_accessories",
    "categoryName": "Accessories",
    "sku": "KJ-LUX-38",
    "images": [
      "/assets/fashionnova/lil-link-mini-faux-leather-clutch__0.jpg",
      "/assets/fashionnova/lil-link-mini-faux-leather-clutch__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "ONE SIZE"
    ],
    "regularPriceXof": 9500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": false,
    "newDropOrder": 38,
    "isFeatured": false,
    "featuredOrder": 38,
    "stockMatrix": {
      "Black-ONE SIZE": 9
    },
    "audience": "women",
    "subCategory": "bags",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Bags"
    ],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": [
      "Brand: Kiki Jones Premium",
      "Colorway: Black",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn2_39",
    "name": "Your Heart Is Safe Faux Leather Crossbody Bag",
    "slug": "your-heart-is-safe-faux-leather-crossbody-bag",
    "description": "These Handbags are available in most sizes.",
    "categoryId": "cat_accessories",
    "categoryName": "Accessories",
    "sku": "KJ-LUX-39",
    "images": [
      "/assets/fashionnova/your-heart-is-safe-faux-leather-crossbody-bag__0.jpg",
      "/assets/fashionnova/your-heart-is-safe-faux-leather-crossbody-bag__1.jpg"
    ],
    "colors": [
      {
        "name": "Brown",
        "hex": "#6C422A"
      }
    ],
    "sizes": [
      "ONE SIZE"
    ],
    "regularPriceXof": 10000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 39,
    "isFeatured": false,
    "featuredOrder": 39,
    "stockMatrix": {
      "Brown-ONE SIZE": 10
    },
    "audience": "women",
    "subCategory": "bags",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Bags"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Brand: Kiki Jones Premium",
      "Colorway: Brown",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn2_40",
    "name": "Delaney Drop Earrings",
    "slug": "delaney-drop-earrings",
    "description": "These Jewelry are available in most sizes.",
    "categoryId": "cat_accessories",
    "categoryName": "Accessories",
    "sku": "KJ-LUX-40",
    "images": [
      "/assets/fashionnova/delaney-drop-earrings__0.jpg"
    ],
    "colors": [
      {
        "name": "Gold",
        "hex": "#C8A24A"
      }
    ],
    "sizes": [
      "ONE SIZE"
    ],
    "regularPriceXof": 5000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": false,
    "newDropOrder": 40,
    "isFeatured": true,
    "featuredOrder": 40,
    "stockMatrix": {
      "Gold-ONE SIZE": 11
    },
    "audience": "unisex",
    "subCategory": "jewelry",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Jewelry"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Brand: Kiki Jones Premium",
      "Colorway: Gold",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn2_41",
    "name": "Cove Island 2 Piece Bracelet Set",
    "slug": "cove-island-2-piece-bracelet-set",
    "description": "These Jewelry are available in most sizes.",
    "categoryId": "cat_accessories",
    "categoryName": "Accessories",
    "sku": "KJ-LUX-41",
    "images": [
      "/assets/fashionnova/cove-island-2-piece-bracelet-set__0.jpg",
      "/assets/fashionnova/cove-island-2-piece-bracelet-set__1.jpg"
    ],
    "colors": [
      {
        "name": "Gold",
        "hex": "#C8A24A"
      }
    ],
    "sizes": [
      "ONE SIZE"
    ],
    "regularPriceXof": 7500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 41,
    "isFeatured": false,
    "featuredOrder": 41,
    "stockMatrix": {
      "Gold-ONE SIZE": 12
    },
    "audience": "unisex",
    "subCategory": "jewelry",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": [
      "essentials",
      "after-dark",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Jones Premium",
      "Jewelry"
    ],
    "isBestSeller": true,
    "isTrending": true,
    "materialDetails": [
      "Brand: Kiki Jones Premium",
      "Colorway: Gold",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn2_42",
    "name": "Aria Double Lace Up Sneakers",
    "slug": "aria-double-lace-up-sneakers",
    "description": "These Shoes are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-SCU-42",
    "images": [
      "/assets/fashionnova/aria-double-lace-up-sneakers__0.jpg",
      "/assets/fashionnova/aria-double-lace-up-sneakers__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "37",
      "38",
      "39",
      "40",
      "41"
    ],
    "regularPriceXof": 16500,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": false,
    "newDropOrder": 42,
    "isFeatured": false,
    "featuredOrder": 42,
    "stockMatrix": {
      "Black-37": 13,
      "Black-38": 14,
      "Black-39": 15,
      "Black-40": 16,
      "Black-41": 8
    },
    "audience": "women",
    "subCategory": "shoes",
    "brandSlug": "kiki-sculpt",
    "brandName": "Kiki Sculpt",
    "collectionSlugs": [
      "essentials",
      "street-collection",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Sculpt",
      "Shoes"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Brand: Kiki Sculpt",
      "Colorway: Black",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn2_43",
    "name": "Feelin' My Vibe Sneakers",
    "slug": "feelin-my-vibe-sneakers",
    "description": "These Shoes are available in most sizes.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-SCU-43",
    "images": [
      "/assets/fashionnova/feelin-my-vibe-sneakers__0.jpg",
      "/assets/fashionnova/feelin-my-vibe-sneakers__1.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": [
      "37",
      "38",
      "39",
      "40",
      "41"
    ],
    "regularPriceXof": 15000,
    "promoPriceXof": 13000,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 43,
    "isFeatured": true,
    "featuredOrder": 43,
    "stockMatrix": {
      "Black-37": 14,
      "Black-38": 15,
      "Black-39": 16,
      "Black-40": 8,
      "Black-41": 9
    },
    "audience": "women",
    "subCategory": "shoes",
    "brandSlug": "kiki-sculpt",
    "brandName": "Kiki Sculpt",
    "collectionSlugs": [
      "essentials",
      "street-collection",
      "exclusive-drop"
    ],
    "styleTags": [
      "Kiki Sculpt",
      "Shoes"
    ],
    "isBestSeller": false,
    "isTrending": false,
    "materialDetails": [
      "Brand: Kiki Sculpt",
      "Colorway: Black",
      "Warm-climate breathable finish"
    ]
  },
  {
    "id": "prod_fn_44",
    "name": "Down For You Denim Romper",
    "slug": "down-for-you-denim-romper",
    "description": "Tailored short-sleeve stretch denim romper with sculpted waist seaming for effortless warm-day styling.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-FN-044",
    "images": [
      "/assets/fashionnova/down-for-you-denim-romper__0.jpg",
      "/assets/fashionnova/down-for-you-denim-romper__1.jpg"
    ],
    "runwayModelImageUrl": "/assets/fashionnova/down-for-you-denim-romper__1.jpg",
    "colors": [{ "name": "Black", "hex": "#111111" }],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "regularPriceXof": 22500,
    "promoPriceXof": 18500,
    "lowStockThreshold": 4,
    "isNewDrop": true,
    "newDropOrder": 44,
    "isFeatured": true,
    "featuredOrder": 44,
    "stockMatrix": { "Black-XS": 8, "Black-S": 14, "Black-M": 16, "Black-L": 12, "Black-XL": 7 },
    "audience": "women",
    "subCategory": "jumpsuits",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": ["essentials", "summer-drop"],
    "styleTags": ["Kiki Jones Premium", "Jumpsuits"],
    "isBestSeller": true,
    "isTrending": true,
    "materialDetails": ["71% Cotton, 25% Polyester, 2% Rayon, 2% Spandex", "Colorway: Black", "Warm-climate breathable denim"]
  },
  {
    "id": "prod_fn_45",
    "name": "In Office Short Sleeve Romper",
    "slug": "in-office-short-sleeve-romper",
    "description": "Clean-cut tailored short-sleeve romper with crisp lapels and a fluid stretch drape for day-to-night wear.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-FN-045",
    "images": [
      "/assets/fashionnova/in-office-short-sleeve-romper__0.jpg",
      "/assets/fashionnova/in-office-short-sleeve-romper__1.jpg"
    ],
    "runwayModelImageUrl": "/assets/fashionnova/in-office-short-sleeve-romper__1.jpg",
    "colors": [{ "name": "Black", "hex": "#111111" }],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "regularPriceXof": 32500,
    "promoPriceXof": null,
    "lowStockThreshold": 4,
    "isNewDrop": true,
    "newDropOrder": 45,
    "isFeatured": true,
    "featuredOrder": 45,
    "stockMatrix": { "Black-XS": 6, "Black-S": 12, "Black-M": 14, "Black-L": 10, "Black-XL": 6 },
    "audience": "women",
    "subCategory": "jumpsuits",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": ["essentials", "after-dark", "formal"],
    "styleTags": ["Kiki Jones Premium", "Jumpsuits"],
    "isBestSeller": true,
    "isTrending": true,
    "materialDetails": ["95% Polyester, 5% Spandex", "Colorway: Black", "Lightweight tailored finish"]
  },
  {
    "id": "prod_fn_46",
    "name": "Seaside Shortie Crochet Ruffle Micro Short",
    "slug": "seaside-shortie-crochet-ruffle-micro-short",
    "description": "Breathable open-knit 100% cotton crochet micro shorts finished with delicate resort ruffle trim.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-FN-046",
    "images": [
      "/assets/fashionnova/seaside-shortie-crochet-ruffle-micro-short__0.jpg",
      "/assets/fashionnova/seaside-shortie-crochet-ruffle-micro-short__1.jpg"
    ],
    "runwayModelImageUrl": "/assets/fashionnova/seaside-shortie-crochet-ruffle-micro-short__1.jpg",
    "colors": [{ "name": "Chocolate", "hex": "#4A3228" }],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "regularPriceXof": 21500,
    "promoPriceXof": 17500,
    "lowStockThreshold": 4,
    "isNewDrop": true,
    "newDropOrder": 46,
    "isFeatured": false,
    "featuredOrder": 46,
    "stockMatrix": { "Chocolate-XS": 8, "Chocolate-S": 12, "Chocolate-M": 14, "Chocolate-L": 9, "Chocolate-XL": 6 },
    "audience": "women",
    "subCategory": "bottoms",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": ["summer-drop", "essentials"],
    "styleTags": ["Kiki Jones Premium", "Shorts", "Resort"],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": ["100% Cotton Crochet", "Colorway: Chocolate", "Breathable coastal knit"]
  },
  {
    "id": "prod_fn_47",
    "name": "Myla Tricot Lounge Biker Shorts",
    "slug": "myla-tricot-lounge-biker-shorts",
    "description": "Sleek high-rise tricot athletic biker shorts engineered with four-way stretch for warm-weather movement.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-FN-047",
    "images": [
      "/assets/fashionnova/myla-tricot-lounge-biker-shorts__0.jpg",
      "/assets/fashionnova/myla-tricot-lounge-biker-shorts__1.jpg"
    ],
    "runwayModelImageUrl": "/assets/fashionnova/myla-tricot-lounge-biker-shorts__1.jpg",
    "colors": [{ "name": "Black", "hex": "#111111" }],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "regularPriceXof": 14500,
    "promoPriceXof": 11500,
    "lowStockThreshold": 5,
    "isNewDrop": true,
    "newDropOrder": 47,
    "isFeatured": true,
    "featuredOrder": 47,
    "stockMatrix": { "Black-XS": 12, "Black-S": 18, "Black-M": 20, "Black-L": 15, "Black-XL": 10 },
    "audience": "women",
    "subCategory": "activewear",
    "brandSlug": "kiki-sport",
    "brandName": "Kiki Sport",
    "collectionSlugs": ["sport", "essentials"],
    "styleTags": ["Kiki Sport", "Activewear"],
    "isBestSeller": true,
    "isTrending": true,
    "materialDetails": ["82% Polyester, 18% Spandex", "Colorway: Black", "Moisture-wicking tricot"]
  },
  {
    "id": "prod_fn_48",
    "name": "Hailey Biker Shorts",
    "slug": "hailey-biker-shorts",
    "description": "Soft breathable cotton-stretch everyday biker shorts with a flat sculpting waistband.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-FN-048",
    "images": [
      "/assets/fashionnova/hailey-biker-shorts__0.jpg",
      "/assets/fashionnova/hailey-biker-shorts__1.jpg"
    ],
    "runwayModelImageUrl": "/assets/fashionnova/hailey-biker-shorts__1.jpg",
    "colors": [{ "name": "Black", "hex": "#111111" }],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "regularPriceXof": 13500,
    "promoPriceXof": null,
    "lowStockThreshold": 5,
    "isNewDrop": true,
    "newDropOrder": 48,
    "isFeatured": false,
    "featuredOrder": 48,
    "stockMatrix": { "Black-XS": 10, "Black-S": 16, "Black-M": 18, "Black-L": 14, "Black-XL": 10 },
    "audience": "women",
    "subCategory": "activewear",
    "brandSlug": "kiki-sport",
    "brandName": "Kiki Sport",
    "collectionSlugs": ["sport", "essentials"],
    "styleTags": ["Kiki Sport", "Activewear"],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": ["95% Cotton, 5% Spandex", "Colorway: Black", "Breathable studio stretch"]
  },
  {
    "id": "prod_fn_49",
    "name": "Mia Seamless Biker Short",
    "slug": "mia-seamless-biker-short",
    "description": "Second-skin seamless ribbed active biker shorts designed for zero chafe and clean athletic contouring.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-FN-049",
    "images": [
      "/assets/fashionnova/mia-seamless-biker-short__0.jpg",
      "/assets/fashionnova/mia-seamless-biker-short__1.jpg"
    ],
    "runwayModelImageUrl": "/assets/fashionnova/mia-seamless-biker-short__1.jpg",
    "colors": [{ "name": "Black", "hex": "#111111" }],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "regularPriceXof": 15000,
    "promoPriceXof": 12000,
    "lowStockThreshold": 5,
    "isNewDrop": true,
    "newDropOrder": 49,
    "isFeatured": true,
    "featuredOrder": 49,
    "stockMatrix": { "Black-XS": 12, "Black-S": 20, "Black-M": 22, "Black-L": 16, "Black-XL": 12 },
    "audience": "women",
    "subCategory": "activewear",
    "brandSlug": "kiki-sport",
    "brandName": "Kiki Sport",
    "collectionSlugs": ["sport", "essentials"],
    "styleTags": ["Kiki Sport", "Activewear"],
    "isBestSeller": true,
    "isTrending": true,
    "materialDetails": ["90% Nylon, 10% Spandex", "Colorway: Black", "Seamless compression knit"]
  },
  {
    "id": "prod_fn_50",
    "name": "Tayson Oversized Spray Paint Short Sleeve Tee",
    "slug": "tayson-oversized-spray-paint-short-sleeve-tee",
    "description": "Relaxed-fit short-sleeve athletic street tee with tonal spray-paint graphic treatment for warm city wear.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-FN-050",
    "images": [
      "/assets/fashionnova/tayson-oversized-spray-paint-short-sleeve-tee__0.jpg",
      "/assets/fashionnova/tayson-oversized-spray-paint-short-sleeve-tee__1.jpg"
    ],
    "runwayModelImageUrl": "/assets/fashionnova/tayson-oversized-spray-paint-short-sleeve-tee__1.jpg",
    "colors": [{ "name": "Black", "hex": "#111111" }],
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "regularPriceXof": 21000,
    "promoPriceXof": 17500,
    "lowStockThreshold": 4,
    "isNewDrop": true,
    "newDropOrder": 50,
    "isFeatured": true,
    "featuredOrder": 50,
    "stockMatrix": { "Black-S": 10, "Black-M": 15, "Black-L": 18, "Black-XL": 12, "Black-XXL": 8 },
    "audience": "men",
    "subCategory": "activewear",
    "brandSlug": "kiki-sport",
    "brandName": "Kiki Sport",
    "collectionSlugs": ["sport", "street-collection"],
    "styleTags": ["Kiki Sport", "Activewear", "Streetwear"],
    "isBestSeller": true,
    "isTrending": true,
    "materialDetails": ["80% Cotton, 20% Polyester", "Colorway: Black", "Breathable oversized street cut"]
  },
  {
    "id": "prod_fn_51",
    "name": "Fireman Clasp Boxy Cropped Denim Shirt",
    "slug": "fireman-clasp-boxy-cropped-denim-shirt",
    "description": "Statement boxy short-cut cotton denim shirt accented with architectural metal clasp hardware.",
    "categoryId": "cat_men",
    "categoryName": "Men",
    "sku": "KJ-FN-051",
    "images": [
      "/assets/fashionnova/fireman-clasp-boxy-cropped-denim-shirt__0.jpg",
      "/assets/fashionnova/fireman-clasp-boxy-cropped-denim-shirt__1.jpg"
    ],
    "runwayModelImageUrl": "/assets/fashionnova/fireman-clasp-boxy-cropped-denim-shirt__1.jpg",
    "colors": [{ "name": "Black", "hex": "#111111" }],
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "regularPriceXof": 31000,
    "promoPriceXof": null,
    "lowStockThreshold": 4,
    "isNewDrop": true,
    "newDropOrder": 51,
    "isFeatured": true,
    "featuredOrder": 51,
    "stockMatrix": { "Black-S": 8, "Black-M": 14, "Black-L": 15, "Black-XL": 10, "Black-XXL": 6 },
    "audience": "men",
    "subCategory": "shirts",
    "brandSlug": "kiki-men",
    "brandName": "Kiki Men",
    "collectionSlugs": ["after-dark", "street-collection"],
    "styleTags": ["Kiki Men", "Shirts", "Streetwear"],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": ["100% Cotton Denim", "Colorway: Black", "Architectural clasp hardware"]
  },
  {
    "id": "prod_fn_52",
    "name": "Shine Bright Embroidered Strapless Gown",
    "slug": "shine-bright-embroidered-strapless-gown",
    "description": "Floor-sweeping strapless formal gown richly embroidered with luminous metallic threading for gala nights.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-FN-052",
    "images": [
      "/assets/fashionnova/shine-bright-embroidered-strapless-gown__0.jpg",
      "/assets/fashionnova/shine-bright-embroidered-strapless-gown__1.jpg"
    ],
    "runwayModelImageUrl": "/assets/fashionnova/shine-bright-embroidered-strapless-gown__1.jpg",
    "colors": [{ "name": "Gold", "hex": "#C5A059" }],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "regularPriceXof": 98000,
    "promoPriceXof": null,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 52,
    "isFeatured": true,
    "featuredOrder": 52,
    "stockMatrix": { "Gold-XS": 4, "Gold-S": 8, "Gold-M": 10, "Gold-L": 7, "Gold-XL": 5 },
    "audience": "women",
    "subCategory": "dresses",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": ["formal", "after-dark"],
    "styleTags": ["Kiki Jones Premium", "Formal", "Dresses"],
    "isBestSeller": true,
    "isTrending": true,
    "materialDetails": ["Embroidered tulle shell, satin lining", "Colorway: Gold", "Kiki Jones Premium Formal Edit"]
  },
  {
    "id": "prod_fn_53",
    "name": "Simply Elegant Floral Jacquard Suit Set",
    "slug": "simply-elegant-floral-jacquard-suit-set",
    "description": "Tailored two-piece tonal floral jacquard evening suit set with subtle metallic weave and sharp linework.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-FN-053",
    "images": [
      "/assets/fashionnova/simply-elegant-floral-jacquard-suit-set__0.jpg",
      "/assets/fashionnova/simply-elegant-floral-jacquard-suit-set__1.jpg"
    ],
    "runwayModelImageUrl": "/assets/fashionnova/simply-elegant-floral-jacquard-suit-set__1.jpg",
    "colors": [{ "name": "Black", "hex": "#111111" }],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "regularPriceXof": 74000,
    "promoPriceXof": 64000,
    "lowStockThreshold": 3,
    "isNewDrop": true,
    "newDropOrder": 53,
    "isFeatured": true,
    "featuredOrder": 53,
    "stockMatrix": { "Black-XS": 5, "Black-S": 9, "Black-M": 10, "Black-L": 8, "Black-XL": 5 },
    "audience": "women",
    "subCategory": "matching-sets",
    "brandSlug": "kiki-luxe",
    "brandName": "Kiki Jones Premium",
    "collectionSlugs": ["formal", "after-dark"],
    "styleTags": ["Kiki Jones Premium", "Formal", "Matching Sets"],
    "isBestSeller": true,
    "isTrending": true,
    "materialDetails": ["65% Polyester, 20% Nylon, 15% Metallic Jacquard", "Colorway: Black", "Two-piece tailored occasion set"]
  },
  {
    "id": "prod_fn_54",
    "name": "Basic 90's Denim Jorts",
    "slug": "basic-90s-denim-jorts",
    "description": "Clean mid-thigh 90s-inspired washed black cotton denim jorts built for effortless warm-climate street looks.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-FN-054",
    "images": [
      "/assets/fashionnova/basic-90s-denim-jorts__0.jpg",
      "/assets/fashionnova/basic-90s-denim-jorts__1.jpg"
    ],
    "runwayModelImageUrl": "/assets/fashionnova/basic-90s-denim-jorts__1.jpg",
    "colors": [{ "name": "Black", "hex": "#111111" }],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "regularPriceXof": 18500,
    "promoPriceXof": 15000,
    "lowStockThreshold": 4,
    "isNewDrop": true,
    "newDropOrder": 54,
    "isFeatured": false,
    "featuredOrder": 54,
    "stockMatrix": { "Black-XS": 9, "Black-S": 14, "Black-M": 16, "Black-L": 12, "Black-XL": 8 },
    "audience": "women",
    "subCategory": "bottoms",
    "brandSlug": "kiki-sculpt",
    "brandName": "Kiki Sculpt",
    "collectionSlugs": ["street-collection", "summer-drop", "essentials"],
    "styleTags": ["Kiki Sculpt", "Bottoms", "Denim"],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": ["100% Cotton Denim", "Colorway: Black", "Relaxed 90s jort fit"]
  },
  {
    "id": "prod_fn_55",
    "name": "At Command Camo Cargo Denim Jorts",
    "slug": "at-command-camo-cargo-denim-jorts",
    "description": "Utility-pocketed denim cargo jorts with subtle stretch for bold daytime street styling in warm weather.",
    "categoryId": "cat_women",
    "categoryName": "Women",
    "sku": "KJ-FN-055",
    "images": [
      "/assets/fashionnova/at-command-camo-cargo-denim-jorts__0.jpg",
      "/assets/fashionnova/at-command-camo-cargo-denim-jorts__1.jpg"
    ],
    "runwayModelImageUrl": "/assets/fashionnova/at-command-camo-cargo-denim-jorts__1.jpg",
    "colors": [{ "name": "Black", "hex": "#111111" }],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "regularPriceXof": 24500,
    "promoPriceXof": null,
    "lowStockThreshold": 4,
    "isNewDrop": true,
    "newDropOrder": 55,
    "isFeatured": false,
    "featuredOrder": 55,
    "stockMatrix": { "Black-XS": 7, "Black-S": 12, "Black-M": 14, "Black-L": 10, "Black-XL": 6 },
    "audience": "women",
    "subCategory": "bottoms",
    "brandSlug": "kiki-sculpt",
    "brandName": "Kiki Sculpt",
    "collectionSlugs": ["street-collection", "summer-drop"],
    "styleTags": ["Kiki Sculpt", "Bottoms", "Streetwear"],
    "isBestSeller": false,
    "isTrending": true,
    "materialDetails": ["98% Cotton, 2% Spandex", "Colorway: Black", "Multi-pocket utility finish"]
  }
];

export const INITIAL_PRODUCTS = ALL_SEED_PRODUCTS.slice(0, 12);

export const INITIAL_PROMOTIONS = [
  {
    id: 'promo_welcome10',
    code: 'KIKI10',
    type: 'percentage' as const,
    value: 10,
    minOrderXof: 25000,
    maxUses: 500,
    usedCount: 0,
    startsAt: null,
    endsAt: null,
    isActive: true,
  },
  {
    id: 'promo_season5000',
    code: 'SEASON5000',
    type: 'fixed' as const,
    value: 5000,
    minOrderXof: 40000,
    maxUses: 200,
    usedCount: 0,
    startsAt: null,
    endsAt: null,
    isActive: true,
  },
];

export const LEGACY_PLACEHOLDER_PRODUCT_IDS: string[] = [
  "prod_mireza_flipflops",
  "prod_mireza_cap",
  "prod_mireza_briefs",
  "prod_mireza_top",
  "prod_mireza_bustier",
  "prod_mireza_bra",
  "prod_mireza_cuff",
  "prod_mireza_hoops",
  "prod_mireza_jersey_mesh",
  "prod_mireza_jersey_crop",
  "prod_mireza_swim_onepiece",
  "prod_mireza_swim_bikini",
  "prod_mireza_legging",
  "prod_mireza_dress",
  "prod_mireza_bag",
  "prod_mireza_jwl_cowrie",
  "prod_mireza_clg_ringer",
  "prod_mireza_acc_beachset",
  "prod_mireza_swt_01",
  "prod_mireza_swt_02",
  "prod_mireza_swt_03",
  "prod_mireza_jrs_01",
  "prod_mireza_jrs_02",
  "prod_mireza_jrs_03",
  "prod_mireza_jrs_04",
  "prod_mireza_jrs_05",
  "prod_mireza_bkn_01",
  "prod_mireza_bkn_02",
  "prod_mireza_bkn_03",
  "prod_mireza_bkn_04",
  "prod_mireza_bkn_05",
  "prod_mireza_bkn_06",
  "prod_mireza_bkn_07",
  "prod_mireza_bkn_08",
  "prod_mireza_bkn_09",
  "prod_mireza_bkn_10",
  "prod_mireza_bkn_11",
  "prod_mireza_bkn_12",
  "prod_mireza_bkn_13",
  "prod_mireza_bkn_14",
  "prod_mireza_bkn_15",
  "prod_mireza_bkn_16",
  "prod_mireza_bkn_17",
  "prod_mireza_set_01",
  "prod_mireza_set_02",
  "prod_mireza_set_03",
  "prod_mireza_set_04",
  "prod_mireza_set_05",
  "prod_mireza_set_06",
  "prod_mireza_set_07",
  "prod_mireza_set_08",
  "prod_mireza_set_09",
  "prod_mireza_set_10",
  "prod_mireza_set_11",
  "prod_mireza_set_12",
  "prod_mireza_set_13",
  "prod_mireza_cap_01",
  "prod_mireza_cap_02",
  "prod_mireza_cap_03",
  "prod_mireza_cap_04",
  "prod_mireza_tap_01",
  "prod_mireza_tap_02",
  "prod_kj_w_01",
  "prod_kj_w_02",
  "prod_kj_w_03",
  "prod_kj_w_04",
  "prod_kj_w_05",
  "prod_kj_w_06",
  "prod_kj_w_07",
  "prod_kj_w_08",
  "prod_kj_w_09",
  "prod_kj_w_10",
  "prod_kj_w_11",
  "prod_kj_w_12",
  "prod_kj_m_01",
  "prod_kj_m_02",
  "prod_kj_m_03",
  "prod_kj_m_04",
  "prod_kj_m_05",
  "prod_kj_m_06",
  "prod_kj_m_07",
  "prod_kj_m_08",
  "prod_kj_m_09",
  "prod_kj_m_10",
  "prod_kj_g_01",
  "prod_kj_g_02",
  "prod_kj_g_03",
  "prod_kj_g_04",
  "prod_kj_g_05",
  "prod_kj_g_06",
  "prod_kj_b_01",
  "prod_kj_b_02",
  "prod_kj_b_03",
  "prod_kj_b_04",
  "prod_kj_b_05",
  "prod_kj_b_06",
  "prod_kj_a_01",
  "prod_kj_a_02",
  "prod_kj_a_03",
  "prod_kj_a_04",
  "prod_kj_a_05",
  "prod_kj_a_06",
  "prod_fn_w_01",
  "prod_fn_w_02",
  "prod_fn_w_03",
  "prod_fn_w_04",
  "prod_fn_w_05",
  "prod_fn_w_06",
  "prod_fn_w_07",
  "prod_fn_m_01",
  "prod_fn_m_02",
  "prod_fn_m_03",
  "prod_fn_m_04",
  "prod_fn_m_05",
  "prod_fn_m_06",
  "prod_fn_m_07",
  "prod_fn_m_08",
  "prod_fn_b_01",
  "prod_fn_b_02",
  "prod_fn_b_03",
  "prod_fn_b_04",
  "prod_fn_g_01",
  "prod_fn_g_02",
  "prod_fn_g_03",
  "prod_fn_g_04",
  "prod_fn_a_01",
  "prod_fn_a_02",
  "prod_fn_a_03",
  "prod_fn_a_04"
];

/**
 * Enriches any Firestore-stored product with multi-audience, brand & category metadata
 * so both seeded and admin-created products work seamlessly with Brands, Categories & Mega Menus.
 */
export function enrichProductMetadata(product: Product): Product {
  const seed = ALL_SEED_PRODUCTS.find((s) => s.id === product.id || s.slug === product.slug);
  if (seed) {
    const resolvedBrandSlug = product.brandSlug || seed.brandSlug;
    return {
      ...product,
      audience: product.audience || seed.audience,
      subCategory: product.subCategory || seed.subCategory,
      brandSlug: resolvedBrandSlug,
      brandName: product.brandName || (product.brandSlug ? getBrandNameBySlug(product.brandSlug) : seed.brandName),
      collectionSlugs:
        Array.isArray(product.collectionSlugs) && product.collectionSlugs.length > 0
          ? product.collectionSlugs
          : seed.collectionSlugs,
      styleTags: product.styleTags || seed.styleTags,
      isBestSeller: product.isBestSeller ?? seed.isBestSeller ?? false,
      isTrending: product.isTrending ?? seed.isTrending ?? false,
      materialDetails: product.materialDetails || seed.materialDetails,
    };
  }

  const detected = classifyProductBilingual({
    name: product.name,
    description: product.description,
    categoryName: product.categoryName,
    categoryId: product.categoryId,
    isNewDrop: product.isNewDrop,
    isFeatured: product.isFeatured,
  });

  const resolvedBrandSlug = product.brandSlug || detected.brandSlug;
  const resolvedBrandName =
    product.brandName ||
    (product.brandSlug ? getBrandNameBySlug(product.brandSlug) : detected.brandName);
  const resolvedCollections =
    Array.isArray(product.collectionSlugs) && product.collectionSlugs.length > 0
      ? product.collectionSlugs
      : detected.collectionSlugs;

  return {
    ...product,
    audience: product.audience || detected.audience,
    subCategory: product.subCategory || detected.subCategory,
    brandSlug: resolvedBrandSlug,
    brandName: resolvedBrandName,
    collectionSlugs: resolvedCollections,
    styleTags: product.styleTags || [resolvedBrandName],
    isBestSeller: product.isBestSeller ?? Boolean(product.isFeatured),
    isTrending: product.isTrending ?? Boolean(product.isNewDrop),
  };
}
