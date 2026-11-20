export interface MegaMenuLink {
  label: string;
  href: string;
}

export interface MegaMenuColumn {
  heading: string;
  links: MegaMenuLink[];
}

export type DivisionKey = 'women' | 'curve' | 'men' | 'sport' | 'kids';

export type MegaMenuKey =
  | 'women'
  | 'curve'
  | 'men'
  | 'sport'
  | 'kids'
  | 'brands'
  | 'categories'
  | 'dresses'
  | 'matching-sets'
  | 'tops'
  | 'bottoms'
  | 'shoes'
  | 'accessories';

export interface MegaMenuConfig {
  key: MegaMenuKey;
  label: string;
  href: string;
  columns: MegaMenuColumn[];
  editorial: {
    eyebrow: string;
    title: string;
    ctaLabel: string;
    href: string;
    imageUrl: string;
  };
}

export interface FloatingSubNavItem {
  label: string;
  href: string;
  megaMenuKey?: MegaMenuKey;
  highlight?: boolean;
}

export interface BrandLine {
  slug: 'kiki-men' | 'kiki-luxe' | 'kiki-sculpt' | 'kiki-curve' | 'kiki-sport' | 'kiki-kids';
  name: string;
  shortLabel: string;
  tagline: string;
  description: string;
  heroImage: string;
  secondaryImage: string;
  audiences: ('women' | 'men' | 'girls' | 'boys' | 'unisex')[];
}

export interface ProductCategoryTile {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  matchSubCategories?: string[];
}

export interface EditorialCollection {
  slug: string;
  seasonTag: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  campaignImage: string;
  secondaryImage?: string;
  audiences: ('women' | 'men' | 'girls' | 'boys')[];
  featured?: boolean;
}

/**
 * 100% authentic Fashion Nova photography stored locally in /public/assets/fashionnova/.
 * Zero AI-generated images. Strictly warm-climate silhouettes curated for Africa.
 */
export const KJ_IMAGES = {
  // Real Fashion Nova editorial campaign photography
  heroCampaign: '/assets/fashionnova/campaigns/fn_campaign_women_dress.jpg',
  bannerAfterDark: '/assets/fashionnova/campaigns/fn_campaign_curve_gown.jpg',
  curveMiniCampaign: '/assets/fashionnova/campaigns/fn_campaign_curve_mini.jpg',
  curveGownCampaign: '/assets/fashionnova/campaigns/fn_campaign_curve_gown.jpg',
  sportFeature: '/assets/fashionnova/campaigns/fn_campaign_sport_crop.jpg',
  menSportFeature: '/assets/fashionnova/campaigns/fn_campaign_men_sport.jpg',

  // Real Fashion Nova product studio imagery
  womenEditorial: '/assets/fashionnova/sierra-kaftan-maxi-dress__0.jpg',
  womenSatinEvening: '/assets/fashionnova/alexis-rhinestone-maxi-dress__0.jpg',
  womenCorsetCargo: '/assets/fashionnova/irma-long-sleeve-corset-top__0.jpg',
  womenResortSet: '/assets/fashionnova/paris-pleated-pant-set__0.jpg',
  menEditorial: '/assets/fashionnova/crinkle-accordion-button-up-shirt__0.jpg',
  menMeshShirt: '/assets/fashionnova/saints-and-sinners-full-button-shirt__0.jpg',
  menSatinSet: '/assets/fashionnova/pleasant-floral-shirt__0.jpg',
  menStreetDenim: '/assets/fashionnova/undercover-slim-stacked-flare-jeans__0.jpg',
  girlsEditorial: '/assets/fashionnova/mini-be-amazing-pant-set__0.jpg',
  boysEditorial: '/assets/fashionnova/mini-los-angeles-made-jogger-pant-set__0.jpg',
  accessoriesEditorial: '/assets/fashionnova/first-in-line-sunglasses__0.jpg',
  campaignEssentials: '/assets/fashionnova/paris-pleated-pant-set__0.jpg',
  campaignStreet: '/assets/fashionnova/undercover-slim-stacked-flare-jeans__0.jpg',

  // Category & brand spotlight visuals
  shoesFeature: '/assets/fashionnova/unmatched-energy-platform-stiletto-heels__0.jpg',
  menShoesFeature: '/assets/fashionnova/color-block-slip-on-loafers__0.jpg',
  sunglassesFeature: '/assets/fashionnova/first-in-line-sunglasses__0.jpg',
  bagsFeature: '/assets/fashionnova/lil-link-mini-faux-leather-clutch__0.jpg',
  jewelryFeature: '/assets/fashionnova/cove-island-2-piece-bracelet-set__0.jpg',
  curveFeature: '/assets/fashionnova/zoe-asymmetrical-lace-trim-mini-dress__0.jpg',
  curveSetFeature: '/assets/fashionnova/candace-lounge-set__0.jpg',
  sculptFeature: '/assets/fashionnova/jackie-lace-strapless-corset-bodysuit__0.jpg',
  sculptBodysuitFeature:
    '/assets/fashionnova/nova-sculpt-seamless-strong-compression-zip-front-thigh-shaping-bodysuit__0.jpg',
  jumpsuitsFeature: '/assets/fashionnova/in-office-short-sleeve-romper__0.jpg',
  bottomsFeature: '/assets/fashionnova/basic-90s-denim-jorts__0.jpg',
  formalFeature: '/assets/fashionnova/shine-bright-embroidered-strapless-gown__0.jpg',
  activeShortsFeature: '/assets/fashionnova/mia-seamless-biker-short__0.jpg',
};

export const BRAND_LINES: BrandLine[] = [
  {
    slug: 'kiki-men',
    name: 'Kiki Men',
    shortLabel: 'KIKI MEN',
    tagline: 'Bold Menswear · Warm-Weather Street & Night Out',
    description:
      'Open-collar statement shirts, textured crinkle co-ords, stacked flare denim, vintage boxy tees, and polished slip-on loafers crafted for warm climates.',
    heroImage: '/assets/fashionnova/crinkle-accordion-button-up-shirt__0.jpg',
    secondaryImage: '/assets/fashionnova/saints-and-sinners-full-button-shirt__0.jpg',
    audiences: ['men'],
  },
  {
    slug: 'kiki-luxe',
    name: 'Kiki Luxe',
    shortLabel: 'KIKI LUXE',
    tagline: 'Evening, Formal & Resort · Dresses, Rompers & Heels',
    description:
      'Embroidered formal gowns, fluid satin kaftans, rhinestone evening maxis, tailored rompers, pleated pant sets, sculptural stilettos, and acetate eyewear.',
    heroImage: '/assets/fashionnova/alexis-rhinestone-maxi-dress__0.jpg',
    secondaryImage: '/assets/fashionnova/shine-bright-embroidered-strapless-gown__0.jpg',
    audiences: ['women', 'unisex'],
  },
  {
    slug: 'kiki-curve',
    name: 'Kiki Curve',
    shortLabel: 'KIKI CURVE',
    tagline: 'Confident Silhouettes · Going-Out Dresses & Sets',
    description:
      'Asymmetrical mini dresses, formal evening gowns, double-lined skirts, and seamless lounge sets engineered for bold fit and warm-weather comfort.',
    heroImage: '/assets/fashionnova/campaigns/fn_campaign_curve_mini.jpg',
    secondaryImage: '/assets/fashionnova/campaigns/fn_campaign_curve_gown.jpg',
    audiences: ['women'],
  },
  {
    slug: 'kiki-sculpt',
    name: 'Kiki Sculpt',
    shortLabel: 'KIKI SCULPT',
    tagline: 'Second-Skin Compression · Corsets, Jorts & Sneakers',
    description:
      'Seamless sculpting bodysuits, structured lace corsets, 90s denim jorts, and clean everyday sneakers built to shape and move with confidence.',
    heroImage: '/assets/fashionnova/jackie-lace-strapless-corset-bodysuit__0.jpg',
    secondaryImage: '/assets/fashionnova/irma-long-sleeve-corset-top__0.jpg',
    audiences: ['women'],
  },
  {
    slug: 'kiki-sport',
    name: 'Kiki Sport',
    shortLabel: 'KIKI SPORT',
    tagline: 'Breathable Activewear · Biker Shorts & Performance',
    description:
      'Sweat-ready seamless biker shorts, breathable studio essentials, and lightweight street-sport silhouettes made for heat and movement.',
    heroImage: '/assets/fashionnova/campaigns/fn_campaign_sport_crop.jpg',
    secondaryImage: '/assets/fashionnova/campaigns/fn_campaign_men_sport.jpg',
    audiences: ['women', 'men'],
  },
  {
    slug: 'kiki-kids',
    name: 'Kiki Kids',
    shortLabel: 'KIKI KIDS',
    tagline: 'Girls & Boys · Street Sets & Everyday Youth',
    description:
      'Coordinated two-piece sets, flare-leg pant sets, and bold graphic jogger sets for girls and boys ready for every weekend.',
    heroImage: '/assets/fashionnova/mini-be-amazing-pant-set__0.jpg',
    secondaryImage: '/assets/fashionnova/mini-los-angeles-made-jogger-pant-set__0.jpg',
    audiences: ['girls', 'boys'],
  },
];

export const PRODUCT_CATEGORIES: ProductCategoryTile[] = [
  {
    slug: 'dresses',
    name: 'Dresses',
    subtitle: 'Maxi · Mini · Formal · Resort',
    description:
      'Satin kaftans, embroidered strapless gowns, rhinestone evening maxis, and asymmetrical going-out minis.',
    imageUrl: '/assets/fashionnova/campaigns/fn_campaign_women_dress.jpg',
    matchSubCategories: ['dresses', 'skirts'],
  },
  {
    slug: 'matching-sets',
    name: 'Matching Sets',
    subtitle: 'Two-Piece Co-ords & Suits',
    description:
      'Pleated pant sets, floral jacquard suit sets, crinkle men co-ords, seamless zip sets, and kids outfits.',
    imageUrl: '/assets/fashionnova/paris-pleated-pant-set__0.jpg',
    matchSubCategories: ['matching-sets'],
  },
  {
    slug: 'shoes',
    name: 'Shoes',
    subtitle: 'Heels · Loafers · Sneakers',
    description:
      'Platform stilettos, patent slingback pumps, polished buckle loafers, and monochrome street sneakers.',
    imageUrl: '/assets/fashionnova/unmatched-energy-platform-stiletto-heels__0.jpg',
    matchSubCategories: ['shoes'],
  },
  {
    slug: 'sunglasses',
    name: 'Sunglasses',
    subtitle: 'Eyewear & Frames',
    description:
      'Sharp dark acetate sunglasses and clean architectural optical frames for sun-soaked days.',
    imageUrl: '/assets/fashionnova/first-in-line-sunglasses__0.jpg',
    matchSubCategories: ['sunglasses'],
  },
  {
    slug: 'shirts',
    name: 'Shirts & Tops',
    subtitle: 'Button-Ups · Corsets · Tees',
    description:
      'Statement open-collar shirts, structured corsets, sculpting bodysuits, and boxy street tees.',
    imageUrl: '/assets/fashionnova/crinkle-accordion-button-up-shirt__0.jpg',
    matchSubCategories: ['shirts', 'tops', 't-shirts', 'polos'],
  },
  {
    slug: 'jumpsuits',
    name: 'Jumpsuits & Rompers',
    subtitle: 'Short-Sleeve & Denim Rompers',
    description:
      'Tailored short-sleeve rompers, fitted denim rompers, and effortless warm-weather one-pieces.',
    imageUrl: '/assets/fashionnova/in-office-short-sleeve-romper__0.jpg',
    matchSubCategories: ['jumpsuits'],
  },
  {
    slug: 'jeans',
    name: 'Jeans & Pants',
    subtitle: 'Stacked · Flare · Tailored',
    description:
      'Slim stacked flare denim, waxed pleated flare trousers, and crisp streetwear bottoms.',
    imageUrl: '/assets/fashionnova/undercover-slim-stacked-flare-jeans__0.jpg',
    matchSubCategories: ['jeans', 'pants'],
  },
  {
    slug: 'bottoms',
    name: 'Shorts & Bottoms',
    subtitle: 'Denim Jorts · Crochet · Skirts',
    description:
      '90s denim jorts, cargo denim shorts, crochet micro shorts, and double-lined mini skirts.',
    imageUrl: '/assets/fashionnova/basic-90s-denim-jorts__0.jpg',
    matchSubCategories: ['bottoms', 'shorts', 'skirts'],
  },
  {
    slug: 'activewear',
    name: 'Activewear & Sport',
    subtitle: 'Biker Shorts · Studio · Athletic',
    description:
      'Seamless biker shorts, tricot lounge shorts, and breathable active tees built for warm-climate training.',
    imageUrl: '/assets/fashionnova/campaigns/fn_campaign_sport_crop.jpg',
    matchSubCategories: ['activewear'],
  },
  {
    slug: 'bags',
    name: 'Bags',
    subtitle: 'Clutches & Crossbody',
    description: 'Structured faux-leather mini clutches and sleek statement evening bags.',
    imageUrl: '/assets/fashionnova/lil-link-mini-faux-leather-clutch__0.jpg',
    matchSubCategories: ['bags'],
  },
  {
    slug: 'jewelry',
    name: 'Jewelry',
    subtitle: 'Earrings & Bracelets',
    description: 'Sculpted drop earrings and stacked bracelet sets designed to finish any look.',
    imageUrl: '/assets/fashionnova/cove-island-2-piece-bracelet-set__0.jpg',
    matchSubCategories: ['jewelry'],
  },
];

/**
 * Fashion Nova–inspired Top Division Navigation Bar (Row 1)
 */
export const PRIMARY_NAV_ITEMS: {
  key: 'women' | 'curve' | 'men' | 'sport' | 'kids' | 'brands' | 'categories';
  label: string;
  href: string;
  hasMegaMenu: boolean;
}[] = [
  { key: 'women', label: 'Women', href: '/women', hasMegaMenu: true },
  { key: 'curve', label: 'Curve', href: '/brand/kiki-curve', hasMegaMenu: true },
  { key: 'men', label: 'Men', href: '/men', hasMegaMenu: true },
  { key: 'sport', label: 'Sport', href: '/brand/kiki-sport', hasMegaMenu: true },
  { key: 'kids', label: 'Kids', href: '/brand/kiki-kids', hasMegaMenu: true },
  { key: 'brands', label: 'Brands', href: '/brands', hasMegaMenu: true },
  { key: 'categories', label: 'Categories', href: '/categories', hasMegaMenu: true },
];

/**
 * Fashion Nova–style Floating Category Sub-Navigation Ribbon (Row 2)
 * Dynamically updates per active division — strictly warm-climate collections for Africa
 * (Zero Winter, Zero Coats/Puffers, Zero Sweaters/Fleece, Zero Holiday/Snow shops).
 */
export const FLOATING_SUBNAV_BY_DIVISION: Record<DivisionKey, FloatingSubNavItem[]> = {
  women: [
    { label: 'New In', href: '/new-in' },
    { label: 'Dresses', href: '/category/dresses', megaMenuKey: 'dresses' },
    { label: 'Matching Sets', href: '/category/matching-sets', megaMenuKey: 'matching-sets' },
    { label: 'Tops & Corsets', href: '/women/tops', megaMenuKey: 'tops' },
    { label: 'Jumpsuits', href: '/category/jumpsuits' },
    { label: 'Jeans & Bottoms', href: '/category/bottoms', megaMenuKey: 'bottoms' },
    { label: 'Formal', href: '/collection/formal' },
    { label: 'After Dark', href: '/collection/after-dark' },
    { label: 'Shoes', href: '/category/shoes', megaMenuKey: 'shoes' },
    { label: 'Accessories', href: '/accessories', megaMenuKey: 'accessories' },
    { label: 'Kiki Luxe', href: '/brand/kiki-luxe' },
    { label: 'Kiki Sculpt', href: '/brand/kiki-sculpt' },
    { label: 'Sale', href: '/sale', highlight: true },
  ],
  curve: [
    { label: 'All Curve', href: '/brand/kiki-curve' },
    { label: 'New In', href: '/new-in' },
    { label: 'Dresses', href: '/category/dresses', megaMenuKey: 'dresses' },
    { label: 'Matching Sets', href: '/category/matching-sets', megaMenuKey: 'matching-sets' },
    { label: 'Formal & Gowns', href: '/collection/formal' },
    { label: 'After Dark', href: '/collection/after-dark' },
    { label: 'Tops & Corsets', href: '/women/tops', megaMenuKey: 'tops' },
    { label: 'Bottoms', href: '/category/bottoms', megaMenuKey: 'bottoms' },
    { label: 'Shoes', href: '/category/shoes', megaMenuKey: 'shoes' },
    { label: 'Accessories', href: '/accessories', megaMenuKey: 'accessories' },
    { label: 'Sale', href: '/sale', highlight: true },
  ],
  men: [
    { label: 'All Men', href: '/men' },
    { label: 'New In', href: '/men/new-in' },
    { label: 'Shirts', href: '/men/shirts', megaMenuKey: 'tops' },
    { label: 'Matching Sets', href: '/men/matching-sets', megaMenuKey: 'matching-sets' },
    { label: 'Tees & Tops', href: '/men/tops', megaMenuKey: 'tops' },
    { label: 'Jeans', href: '/men/jeans', megaMenuKey: 'bottoms' },
    { label: 'Pants & Shorts', href: '/men/pants', megaMenuKey: 'bottoms' },
    { label: 'Shoes', href: '/men/shoes', megaMenuKey: 'shoes' },
    { label: 'Night Out', href: '/collection/after-dark' },
    { label: 'Street Heat', href: '/collection/street-collection' },
    { label: 'Sunglasses', href: '/category/sunglasses', megaMenuKey: 'accessories' },
    { label: 'Sale', href: '/sale', highlight: true },
  ],
  sport: [
    { label: 'All Sport', href: '/brand/kiki-sport' },
    { label: 'Activewear', href: '/category/activewear' },
    { label: 'Biker Shorts', href: '/category/activewear' },
    { label: 'Kiki Sculpt', href: '/brand/kiki-sculpt' },
    { label: 'Women Sport', href: '/women/activewear' },
    { label: 'Men Sport', href: '/men/activewear' },
    { label: 'Sneakers', href: '/category/shoes', megaMenuKey: 'shoes' },
    { label: 'Sale', href: '/sale', highlight: true },
  ],
  kids: [
    { label: 'All Kids', href: '/brand/kiki-kids' },
    { label: 'Girls', href: '/girls' },
    { label: 'Girls Sets', href: '/girls/matching-sets' },
    { label: 'Boys', href: '/boys' },
    { label: 'Boys Sets', href: '/boys/matching-sets' },
    { label: 'New In', href: '/new-in' },
    { label: 'Street Heat', href: '/collection/street-collection' },
    { label: 'Sale', href: '/sale', highlight: true },
  ],
};

export const MEGA_MENUS: Record<MegaMenuKey, MegaMenuConfig> = {
  women: {
    key: 'women',
    label: 'Women',
    href: '/women',
    columns: [
      {
        heading: 'Clothing',
        links: [
          { label: 'Shop All Women', href: '/women' },
          { label: 'New Arrivals', href: '/women/new-in' },
          { label: 'Dresses', href: '/women/dresses' },
          { label: 'Matching Sets', href: '/women/matching-sets' },
          { label: 'Tops & Corsets', href: '/women/tops' },
          { label: 'Jumpsuits & Rompers', href: '/category/jumpsuits' },
          { label: 'Shorts & Jorts', href: '/category/bottoms' },
          { label: 'Activewear & Biker Shorts', href: '/category/activewear' },
        ],
      },
      {
        heading: 'Women Brands',
        links: [
          { label: 'Kiki Luxe', href: '/brand/kiki-luxe' },
          { label: 'Kiki Curve', href: '/brand/kiki-curve' },
          { label: 'Kiki Sculpt', href: '/brand/kiki-sculpt' },
          { label: 'Kiki Sport', href: '/brand/kiki-sport' },
        ],
      },
      {
        heading: 'Warm-Climate Edits',
        links: [
          { label: 'After Dark / Going Out', href: '/collection/after-dark' },
          { label: 'Formal & Occasion', href: '/collection/formal' },
          { label: 'Sun & Resort Sets', href: '/collection/summer-drop' },
          { label: 'The Essentials', href: '/collection/essentials' },
          { label: 'Sale & Offers', href: '/sale' },
        ],
      },
      {
        heading: 'Shoes & Accessories',
        links: [
          { label: 'Heels & Sneakers', href: '/category/shoes' },
          { label: 'Sunglasses', href: '/category/sunglasses' },
          { label: 'Bags & Clutches', href: '/category/bags' },
          { label: 'Jewelry', href: '/category/jewelry' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'Women · New Season',
      title: 'Evening & Resort Silhouettes',
      ctaLabel: 'Shop Women',
      href: '/women',
      imageUrl: KJ_IMAGES.heroCampaign,
    },
  },
  curve: {
    key: 'curve',
    label: 'Curve',
    href: '/brand/kiki-curve',
    columns: [
      {
        heading: 'Kiki Curve Clothing',
        links: [
          { label: 'Shop All Curve', href: '/brand/kiki-curve' },
          { label: 'Going-Out Dresses', href: '/category/dresses' },
          { label: 'Matching Lounge Sets', href: '/category/matching-sets' },
          { label: 'Formal & Evening Gowns', href: '/collection/formal' },
          { label: 'Corsets & Bodysuits', href: '/brand/kiki-sculpt' },
        ],
      },
      {
        heading: 'Featured Edits',
        links: [
          { label: 'After Dark Edit', href: '/collection/after-dark' },
          { label: 'Sun & Resort', href: '/collection/summer-drop' },
          { label: 'Active & Biker Shorts', href: '/brand/kiki-sport' },
          { label: 'New Arrivals', href: '/new-in' },
        ],
      },
      {
        heading: 'Finish The Look',
        links: [
          { label: 'Platform Heels', href: '/category/shoes' },
          { label: 'Sunglasses', href: '/category/sunglasses' },
          { label: 'Mini Clutches', href: '/category/bags' },
          { label: 'Jewelry', href: '/category/jewelry' },
        ],
      },
      {
        heading: 'House Brands',
        links: [
          { label: 'Kiki Curve', href: '/brand/kiki-curve' },
          { label: 'Kiki Sculpt', href: '/brand/kiki-sculpt' },
          { label: 'Kiki Luxe', href: '/brand/kiki-luxe' },
          { label: 'All Brands', href: '/brands' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'Kiki Curve · Confident Fit',
      title: 'After Dark & Formal Curve',
      ctaLabel: 'Shop Kiki Curve',
      href: '/brand/kiki-curve',
      imageUrl: KJ_IMAGES.curveGownCampaign,
    },
  },
  men: {
    key: 'men',
    label: 'Men',
    href: '/men',
    columns: [
      {
        heading: 'Kiki Men',
        links: [
          { label: 'Shop All Men', href: '/men' },
          { label: 'All Kiki Men', href: '/brand/kiki-men' },
          { label: 'New In Men', href: '/men/new-in' },
          { label: 'Best Sellers', href: '/men/best-sellers' },
          { label: 'Men Sale', href: '/sale' },
        ],
      },
      {
        heading: 'Warm-Climate Clothing',
        links: [
          { label: 'Night-Out Shirts', href: '/men/shirts' },
          { label: 'Two-Piece Sets & Shorts', href: '/men/matching-sets' },
          { label: 'Boxy & Graphic Tees', href: '/men/tops' },
          { label: 'Stacked Flare Jeans', href: '/men/jeans' },
          { label: 'Waxed Flare Pants', href: '/men/pants' },
          { label: 'Men Sport & Active', href: '/brand/kiki-sport' },
        ],
      },
      {
        heading: 'Shoes & Accessories',
        links: [
          { label: 'Loafers & Footwear', href: '/men/shoes' },
          { label: 'All Shoes', href: '/category/shoes' },
          { label: 'Sunglasses', href: '/category/sunglasses' },
          { label: 'Jewelry', href: '/category/jewelry' },
        ],
      },
      {
        heading: 'Collections',
        links: [
          { label: 'After Dark Edit', href: '/collection/after-dark' },
          { label: 'Street Heat', href: '/collection/street-collection' },
          { label: 'Sun & Resort', href: '/collection/summer-drop' },
          { label: 'Active & Sport', href: '/collection/sport' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'Kiki Men · Warm Climate',
      title: 'Statement Shirts & Street',
      ctaLabel: 'Shop Kiki Men',
      href: '/brand/kiki-men',
      imageUrl: KJ_IMAGES.menEditorial,
    },
  },
  sport: {
    key: 'sport',
    label: 'Sport',
    href: '/brand/kiki-sport',
    columns: [
      {
        heading: 'Kiki Sport',
        links: [
          { label: 'Shop All Sport', href: '/brand/kiki-sport' },
          { label: 'All Activewear', href: '/category/activewear' },
          { label: 'Seamless Biker Shorts', href: '/category/activewear' },
          { label: 'Sport Collection', href: '/collection/sport' },
        ],
      },
      {
        heading: 'By Audience',
        links: [
          { label: 'Women Activewear', href: '/women/activewear' },
          { label: 'Men Sport & Tees', href: '/men/activewear' },
          { label: 'Kiki Sculpt Compression', href: '/brand/kiki-sculpt' },
        ],
      },
      {
        heading: 'Pair With',
        links: [
          { label: 'Everyday Sneakers', href: '/category/shoes' },
          { label: 'Sunglasses', href: '/category/sunglasses' },
          { label: 'Matching Sets', href: '/category/matching-sets' },
        ],
      },
      {
        heading: 'More Labels',
        links: [
          { label: 'Kiki Sculpt', href: '/brand/kiki-sculpt' },
          { label: 'Kiki Men', href: '/brand/kiki-men' },
          { label: 'All Brands', href: '/brands' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'Kiki Sport · Heat-Ready',
      title: 'Breathable Active & Studio',
      ctaLabel: 'Shop Kiki Sport',
      href: '/brand/kiki-sport',
      imageUrl: KJ_IMAGES.sportFeature,
    },
  },
  kids: {
    key: 'kids',
    label: 'Kids',
    href: '/brand/kiki-kids',
    columns: [
      {
        heading: 'Kiki Kids',
        links: [
          { label: 'All Kiki Kids', href: '/brand/kiki-kids' },
          { label: 'Girls Matching Sets', href: '/girls' },
          { label: 'Boys Matching Sets', href: '/boys' },
          { label: 'Kids Sale', href: '/sale' },
        ],
      },
      {
        heading: 'Girls',
        links: [
          { label: 'Shop All Girls', href: '/girls' },
          { label: 'Girls Pant Sets', href: '/girls/matching-sets' },
          { label: 'New In Girls', href: '/girls/new-in' },
        ],
      },
      {
        heading: 'Boys',
        links: [
          { label: 'Shop All Boys', href: '/boys' },
          { label: 'Boys Jogger Sets', href: '/boys/matching-sets' },
          { label: 'New In Boys', href: '/boys/new-in' },
        ],
      },
      {
        heading: 'More Labels',
        links: [
          { label: 'Kiki Men', href: '/brand/kiki-men' },
          { label: 'Kiki Luxe', href: '/brand/kiki-luxe' },
          { label: 'Kiki Sport', href: '/brand/kiki-sport' },
          { label: 'All Brands', href: '/brands' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'Kiki Kids · Girls & Boys',
      title: 'Fresh Youth Street Sets',
      ctaLabel: 'Shop Kiki Kids',
      href: '/brand/kiki-kids',
      imageUrl: KJ_IMAGES.girlsEditorial,
    },
  },
  brands: {
    key: 'brands',
    label: 'Shop by Brand',
    href: '/brands',
    columns: [
      {
        heading: 'KIKI JONES House Brands',
        links: [
          { label: 'All Brands', href: '/brands' },
          { label: 'Kiki Men', href: '/brand/kiki-men' },
          { label: 'Kiki Luxe', href: '/brand/kiki-luxe' },
          { label: 'Kiki Curve', href: '/brand/kiki-curve' },
          { label: 'Kiki Sculpt', href: '/brand/kiki-sculpt' },
          { label: 'Kiki Sport', href: '/brand/kiki-sport' },
          { label: 'Kiki Kids', href: '/brand/kiki-kids' },
        ],
      },
      {
        heading: 'Featured Edits',
        links: [
          { label: 'New Arrivals', href: '/new-in' },
          { label: 'After Dark Edit', href: '/collection/after-dark' },
          { label: 'Formal & Occasion', href: '/collection/formal' },
          { label: 'Sun & Resort Sets', href: '/collection/summer-drop' },
          { label: 'Street Heat', href: '/collection/street-collection' },
          { label: 'Active & Sport', href: '/collection/sport' },
        ],
      },
      {
        heading: 'Popular Categories',
        links: [
          { label: 'Dresses', href: '/category/dresses' },
          { label: 'Matching Sets', href: '/category/matching-sets' },
          { label: 'Jumpsuits & Rompers', href: '/category/jumpsuits' },
          { label: 'Shoes', href: '/category/shoes' },
          { label: 'Sunglasses', href: '/category/sunglasses' },
        ],
      },
      {
        heading: 'Shop by Audience',
        links: [
          { label: 'Women', href: '/women' },
          { label: 'Curve', href: '/brand/kiki-curve' },
          { label: 'Men', href: '/men' },
          { label: 'Sport', href: '/brand/kiki-sport' },
          { label: 'Girls & Boys', href: '/brand/kiki-kids' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'House of Labels',
      title: '6 Signature Brands',
      ctaLabel: 'Explore All Brands',
      href: '/brands',
      imageUrl: KJ_IMAGES.womenSatinEvening,
    },
  },
  categories: {
    key: 'categories',
    label: 'Shop by Category',
    href: '/categories',
    columns: [
      {
        heading: 'Apparel',
        links: [
          { label: 'All Categories', href: '/categories' },
          { label: 'Dresses', href: '/category/dresses' },
          { label: 'Matching Sets', href: '/category/matching-sets' },
          { label: 'Shirts & Tops', href: '/category/shirts' },
          { label: 'Jumpsuits & Rompers', href: '/category/jumpsuits' },
          { label: 'Jeans & Pants', href: '/category/jeans' },
          { label: 'Shorts & Bottoms', href: '/category/bottoms' },
          { label: 'Activewear & Sport', href: '/category/activewear' },
        ],
      },
      {
        heading: 'Shoes & Accessories',
        links: [
          { label: 'Shoes & Heels', href: '/category/shoes' },
          { label: 'Sunglasses', href: '/category/sunglasses' },
          { label: 'Bags & Clutches', href: '/category/bags' },
          { label: 'Jewelry', href: '/category/jewelry' },
        ],
      },
      {
        heading: 'Shop by Brand',
        links: [
          { label: 'Kiki Men', href: '/brand/kiki-men' },
          { label: 'Kiki Luxe', href: '/brand/kiki-luxe' },
          { label: 'Kiki Curve', href: '/brand/kiki-curve' },
          { label: 'Kiki Sculpt', href: '/brand/kiki-sculpt' },
          { label: 'Kiki Sport', href: '/brand/kiki-sport' },
          { label: 'Kiki Kids', href: '/brand/kiki-kids' },
        ],
      },
      {
        heading: 'Collections',
        links: [
          { label: 'All Collections', href: '/collections' },
          { label: 'After Dark Edit', href: '/collection/after-dark' },
          { label: 'Formal & Occasion', href: '/collection/formal' },
          { label: 'The Essentials', href: '/collection/essentials' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'Shop by Piece',
      title: 'Shoes, Shades & Wardrobe',
      ctaLabel: 'Explore Categories',
      href: '/categories',
      imageUrl: KJ_IMAGES.shoesFeature,
    },
  },
  // Floating ribbon category mega-menus (Fashion Nova style)
  dresses: {
    key: 'dresses',
    label: 'Dresses',
    href: '/category/dresses',
    columns: [
      {
        heading: 'Dress Styles',
        links: [
          { label: 'All Dresses', href: '/category/dresses' },
          { label: 'Formal & Gowns', href: '/collection/formal' },
          { label: 'Going-Out & After Dark', href: '/collection/after-dark' },
          { label: 'Resort & Kaftan Dresses', href: '/collection/summer-drop' },
          { label: 'Curve Dresses', href: '/brand/kiki-curve' },
        ],
      },
      {
        heading: 'One-Pieces & Sets',
        links: [
          { label: 'Jumpsuits & Rompers', href: '/category/jumpsuits' },
          { label: 'Matching Sets', href: '/category/matching-sets' },
          { label: 'Kiki Luxe', href: '/brand/kiki-luxe' },
        ],
      },
      {
        heading: 'Complete The Look',
        links: [
          { label: 'Platform Heels & Pumps', href: '/category/shoes' },
          { label: 'Evening Clutches', href: '/category/bags' },
          { label: 'Statement Jewelry', href: '/category/jewelry' },
        ],
      },
      {
        heading: 'Trending',
        links: [
          { label: 'New Arrivals', href: '/new-in' },
          { label: 'Sale', href: '/sale' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'Kiki Luxe · Dresses',
      title: 'Gowns, Maxis & Minis',
      ctaLabel: 'Shop Dresses',
      href: '/category/dresses',
      imageUrl: KJ_IMAGES.formalFeature,
    },
  },
  'matching-sets': {
    key: 'matching-sets',
    label: 'Matching Sets',
    href: '/category/matching-sets',
    columns: [
      {
        heading: 'Two-Piece Sets',
        links: [
          { label: 'All Matching Sets', href: '/category/matching-sets' },
          { label: 'Women Pleated & Suit Sets', href: '/women/matching-sets' },
          { label: 'Curve Lounge Sets', href: '/brand/kiki-curve' },
          { label: 'Men Crinkle & Short Sets', href: '/men/matching-sets' },
          { label: 'Kids Pant & Jogger Sets', href: '/brand/kiki-kids' },
        ],
      },
      {
        heading: 'Warm-Weather Edits',
        links: [
          { label: 'Sun & Resort Sets', href: '/collection/summer-drop' },
          { label: 'Formal Suit Sets', href: '/collection/formal' },
          { label: 'Street Heat', href: '/collection/street-collection' },
        ],
      },
      {
        heading: 'Related Categories',
        links: [
          { label: 'Jumpsuits & Rompers', href: '/category/jumpsuits' },
          { label: 'Activewear & Sport', href: '/category/activewear' },
          { label: 'Shoes', href: '/category/shoes' },
        ],
      },
      {
        heading: 'Brands',
        links: [
          { label: 'Kiki Luxe', href: '/brand/kiki-luxe' },
          { label: 'Kiki Men', href: '/brand/kiki-men' },
          { label: 'Kiki Kids', href: '/brand/kiki-kids' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'Effortless Co-ords',
      title: 'Two-Piece Matching Sets',
      ctaLabel: 'Shop Matching Sets',
      href: '/category/matching-sets',
      imageUrl: KJ_IMAGES.womenResortSet,
    },
  },
  tops: {
    key: 'tops',
    label: 'Tops & Shirts',
    href: '/category/shirts',
    columns: [
      {
        heading: 'Women Tops',
        links: [
          { label: 'All Shirts & Tops', href: '/category/shirts' },
          { label: 'Corsets & Bodysuits', href: '/women/tops' },
          { label: 'Kiki Sculpt Compression', href: '/brand/kiki-sculpt' },
        ],
      },
      {
        heading: 'Men Shirts & Tees',
        links: [
          { label: 'Night-Out Button-Up Shirts', href: '/men/shirts' },
          { label: 'Vintage & Boxy Tees', href: '/men/tops' },
          { label: 'All Kiki Men', href: '/brand/kiki-men' },
        ],
      },
      {
        heading: 'Pair With',
        links: [
          { label: 'Stacked Flare Jeans', href: '/category/jeans' },
          { label: 'Denim Jorts & Shorts', href: '/category/bottoms' },
          { label: 'Biker Shorts', href: '/category/activewear' },
        ],
      },
      {
        heading: 'Edits',
        links: [
          { label: 'After Dark Edit', href: '/collection/after-dark' },
          { label: 'New Arrivals', href: '/new-in' },
          { label: 'Sale', href: '/sale' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'Sculpt & Statement',
      title: 'Corsets, Shirts & Tees',
      ctaLabel: 'Shop Tops',
      href: '/category/shirts',
      imageUrl: KJ_IMAGES.sculptFeature,
    },
  },
  bottoms: {
    key: 'bottoms',
    label: 'Jeans & Bottoms',
    href: '/category/bottoms',
    columns: [
      {
        heading: 'Denim & Trousers',
        links: [
          { label: 'All Jeans & Pants', href: '/category/jeans' },
          { label: 'Men Stacked Flare Jeans', href: '/men/jeans' },
          { label: 'Waxed Flare Pants', href: '/men/pants' },
        ],
      },
      {
        heading: 'Shorts & Warm-Weather Bottoms',
        links: [
          { label: 'All Shorts & Bottoms', href: '/category/bottoms' },
          { label: '90s & Cargo Denim Jorts', href: '/category/bottoms' },
          { label: 'Seamless Biker Shorts', href: '/category/activewear' },
        ],
      },
      {
        heading: 'Brands',
        links: [
          { label: 'Kiki Sculpt', href: '/brand/kiki-sculpt' },
          { label: 'Kiki Men', href: '/brand/kiki-men' },
          { label: 'Kiki Sport', href: '/brand/kiki-sport' },
        ],
      },
      {
        heading: 'Pair With',
        links: [
          { label: 'Shirts & Corsets', href: '/category/shirts' },
          { label: 'Shoes & Sneakers', href: '/category/shoes' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'Denim & Shorts',
      title: 'Stacked Jeans & Jorts',
      ctaLabel: 'Shop Bottoms',
      href: '/category/bottoms',
      imageUrl: KJ_IMAGES.bottomsFeature,
    },
  },
  shoes: {
    key: 'shoes',
    label: 'Shoes',
    href: '/category/shoes',
    columns: [
      {
        heading: 'Footwear',
        links: [
          { label: 'Shop All Shoes', href: '/category/shoes' },
          { label: 'Women Heels & Pumps', href: '/category/shoes' },
          { label: 'Men Loafers & Slip-Ons', href: '/men/shoes' },
          { label: 'Everyday Sneakers', href: '/brand/kiki-sculpt' },
        ],
      },
      {
        heading: 'By Brand',
        links: [
          { label: 'Kiki Luxe Heels', href: '/brand/kiki-luxe' },
          { label: 'Kiki Men Footwear', href: '/brand/kiki-men' },
          { label: 'Kiki Sculpt Sneakers', href: '/brand/kiki-sculpt' },
        ],
      },
      {
        heading: 'Finish With',
        links: [
          { label: 'Bags & Clutches', href: '/category/bags' },
          { label: 'Sunglasses', href: '/category/sunglasses' },
          { label: 'Jewelry', href: '/category/jewelry' },
        ],
      },
      {
        heading: 'Edits',
        links: [
          { label: 'Shoes, Shades & Objects', href: '/collection/exclusive-drop' },
          { label: 'Formal & Occasion', href: '/collection/formal' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'Footwear Edit',
      title: 'Stilettos, Loafers & Sneakers',
      ctaLabel: 'Shop All Shoes',
      href: '/category/shoes',
      imageUrl: KJ_IMAGES.shoesFeature,
    },
  },
  accessories: {
    key: 'accessories',
    label: 'Accessories',
    href: '/accessories',
    columns: [
      {
        heading: 'Accessories',
        links: [
          { label: 'Shop All Accessories', href: '/accessories' },
          { label: 'Sunglasses & Frames', href: '/category/sunglasses' },
          { label: 'Bags & Mini Clutches', href: '/category/bags' },
          { label: 'Earrings & Bracelets', href: '/category/jewelry' },
        ],
      },
      {
        heading: 'Footwear',
        links: [
          { label: 'All Shoes', href: '/category/shoes' },
          { label: 'Platform Heels', href: '/category/shoes' },
          { label: 'Men Loafers', href: '/men/shoes' },
        ],
      },
      {
        heading: 'Curated Edits',
        links: [
          { label: 'Shoes, Shades & Objects', href: '/collection/exclusive-drop' },
          { label: 'After Dark Edit', href: '/collection/after-dark' },
          { label: 'Formal & Occasion', href: '/collection/formal' },
        ],
      },
      {
        heading: 'Shop by Brand',
        links: [
          { label: 'Kiki Luxe', href: '/brand/kiki-luxe' },
          { label: 'Kiki Men', href: '/brand/kiki-men' },
          { label: 'All Categories', href: '/categories' },
        ],
      },
    ],
    editorial: {
      eyebrow: 'Finishing Touches',
      title: 'Sunglasses, Clutches & Jewelry',
      ctaLabel: 'Shop Accessories',
      href: '/accessories',
      imageUrl: KJ_IMAGES.sunglassesFeature,
    },
  },
};

export const EDITORIAL_COLLECTIONS: EditorialCollection[] = [
  {
    slug: 'after-dark',
    seasonTag: 'Edit 01 · Evening & Nightlife',
    title: 'After Dark Edit',
    shortTitle: 'After Dark',
    subtitle: 'Rhinestone maxis, lace corsets, waxed flare pants, and bold button-up shirts.',
    description:
      'High-impact evening pieces built for warm nights — featuring Kiki Luxe maxi dresses, Kiki Curve minis, Kiki Sculpt corsets, and sharp Kiki Men silhouettes.',
    campaignImage: KJ_IMAGES.womenSatinEvening,
    secondaryImage: KJ_IMAGES.menMeshShirt,
    audiences: ['women', 'men'],
    featured: true,
  },
  {
    slug: 'formal',
    seasonTag: 'Edit 02 · Gala & Occasion',
    title: 'Formal & Occasion',
    shortTitle: 'Formal',
    subtitle: 'Embroidered strapless gowns, floral jacquard suit sets, satin kaftans, and heels.',
    description:
      'Elevated evening gowns, tailored two-piece suit sets, and statement accessories curated for weddings, galas, and rooftop celebrations.',
    campaignImage: KJ_IMAGES.formalFeature,
    secondaryImage: KJ_IMAGES.curveGownCampaign,
    audiences: ['women', 'men'],
    featured: true,
  },
  {
    slug: 'sport',
    seasonTag: 'Edit 03 · Active & Studio',
    title: 'Kiki Sport & Activewear',
    shortTitle: 'Sport',
    subtitle: 'Seamless biker shorts, tricot lounge pieces, and breathable street-sport tees.',
    description:
      'Lightweight, breathable activewear designed for heat-ready movement across Kiki Sport and Kiki Sculpt.',
    campaignImage: KJ_IMAGES.sportFeature,
    secondaryImage: KJ_IMAGES.menSportFeature,
    audiences: ['women', 'men'],
    featured: true,
  },
  {
    slug: 'essentials',
    seasonTag: 'Edit 04 · Warm-Weather Core',
    title: 'The Essentials Collection',
    shortTitle: 'The Essentials',
    subtitle: 'Seamless sculpting bodysuits, crinkle co-ords, rompers, and clean footwear.',
    description:
      'Confident daily foundations engineered for sunny climates — breathable shirts, tailored rompers, second-skin bodysuits, and versatile sets.',
    campaignImage: KJ_IMAGES.womenResortSet,
    secondaryImage: KJ_IMAGES.jumpsuitsFeature,
    audiences: ['women', 'men', 'girls', 'boys'],
    featured: true,
  },
  {
    slug: 'street-collection',
    seasonTag: 'Edit 05 · Urban Street',
    title: 'Street Heat Collection',
    shortTitle: 'Street Heat',
    subtitle: 'Stacked flare denim, 90s jorts, boxy tees, double-lace sneakers, and youth sets.',
    description:
      'Contemporary streetwear across Kiki Men, Kiki Sculpt, Kiki Sport, and Kiki Kids with bold proportions and effortless warm-weather styling.',
    campaignImage: KJ_IMAGES.menStreetDenim,
    secondaryImage: KJ_IMAGES.bottomsFeature,
    audiences: ['women', 'men', 'girls', 'boys'],
    featured: true,
  },
  {
    slug: 'summer-drop',
    seasonTag: 'Edit 06 · Sun & Resort',
    title: 'Sun & Resort Sets',
    shortTitle: 'Sun & Resort',
    subtitle: 'Fluid satin kaftans, crochet micro shorts, relaxed shirts, and dark eyewear.',
    description:
      'Effortless resort dressing and coordinated sets curated for warm days, coastal escapes, and sunset gatherings.',
    campaignImage: KJ_IMAGES.womenEditorial,
    secondaryImage: KJ_IMAGES.menEditorial,
    audiences: ['women', 'men', 'girls', 'boys'],
  },
  {
    slug: 'exclusive-drop',
    seasonTag: 'Edit 07 · Finishing Touches',
    title: 'Shoes, Shades & Objects',
    shortTitle: 'Accessories',
    subtitle: 'Platform stilettos, polished loafers, dark acetate sunglasses, clutches, and jewelry.',
    description:
      'Statement accessories and footwear designed to complete every Kiki Luxe, Kiki Men, Kiki Curve, and Kiki Sculpt look.',
    campaignImage: KJ_IMAGES.shoesFeature,
    secondaryImage: KJ_IMAGES.sunglassesFeature,
    audiences: ['women', 'men'],
  },
];

export const TRENDING_SEARCHES: string[] = [
  'Kiki Men',
  'Kiki Luxe',
  'Kiki Sport',
  'Kiki Curve',
  'Dresses',
  'Romper',
  'Biker Shorts',
  'Shoes',
  'Sunglasses',
  'Stacked Jeans',
];

export const SUGGESTED_SEARCH_CATEGORIES: { label: string; href: string; countHint: string }[] = [
  { label: 'Shop by Brand', href: '/brands', countHint: 'Men, Luxe, Curve, Sculpt, Sport, Kids' },
  { label: 'Shop by Category', href: '/categories', countHint: 'Dresses, Sets, Rompers, Shoes, Shades' },
  { label: 'Formal & Occasion', href: '/collection/formal', countHint: 'Gowns, Jacquard Suits & Heels' },
  { label: 'Kiki Sport', href: '/brand/kiki-sport', countHint: 'Biker Shorts & Breathable Activewear' },
  { label: 'Shoes', href: '/category/shoes', countHint: 'Heels, Loafers & Sneakers' },
  { label: 'Sunglasses', href: '/category/sunglasses', countHint: 'Dark Acetate & Optical' },
];
