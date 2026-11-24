import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { KJ_DURATION, KJ_EASE, KJ_TRANSITION } from '../motion/motionConfig';
import { useMotionSystem } from '../motion/MotionProvider';
import { ProductCard } from '../components/storefront/ProductCard';
import { formatXOF, getProductAvailability } from '../lib/format';
import { INITIAL_CATEGORIES } from '../lib/catalogDefaults';
import { MEGA_MENUS, MegaMenuKey } from '../lib/navigationData';
import {
  getLocalizedBrands,
  getLocalizedCategories,
  getLocalizedCollections,
  localizeAudienceLabel,
  translateLabel,
} from '../lib/i18n';
import { AudienceSlug } from '../types/commerce';
import { normalizeText, SUBCATEGORY_ALIASES } from '../lib/productClassifier';
import { getSectionImage, hasCustomSectionImage } from '../lib/storefrontMedia';
import {
  extractDynamicSubMenus,
  findDynamicMenuMeta,
  matchesDynamicMenuSlug,
} from '../lib/menuDiscovery';

type CatalogAudience = 'women' | 'men' | 'girls' | 'boys' | 'accessories';

interface CatalogPageProps {
  mode: 'all' | 'new-in' | 'sale' | 'audience' | 'accessories' | 'category' | 'collection' | 'brand';
  audience?: AudienceSlug | 'accessories';
  subSlug?: string;
  categorySlug?: string;
  collectionSlug?: string;
  brandSlug?: string;
}

type SortOption = 'recommended' | 'newest' | 'best-sellers' | 'price-asc' | 'price-desc';

const AUDIENCE_COPY: Record<
  CatalogAudience,
  { title: string; eyebrow: string; description: string; quickTabs: { label: string; path: string; slug?: string }[] }
> = {
  women: {
    title: 'Women',
    eyebrow: 'Womenswear',
    description:
      'Sculpted bodycon dresses, draped satin minis, corset cargo sets, and breathable linen co-ords.',
    quickTabs: [
      { label: 'All Women', path: '/women' },
      { label: 'New In', path: '/women/new-in', slug: 'new-in' },
      { label: 'Best Sellers', path: '/women/best-sellers', slug: 'best-sellers' },
      { label: 'Dresses', path: '/women/dresses', slug: 'dresses' },
      { label: 'Matching Sets', path: '/women/matching-sets', slug: 'matching-sets' },
      { label: 'Corsets & Tops', path: '/women/tops', slug: 'tops' },
      { label: 'Cargos & Trousers', path: '/women/pants', slug: 'pants' },
    ],
  },
  men: {
    title: 'Men',
    eyebrow: 'Menswear',
    description:
      'Fitted ribbed knit polos, sheer open-knit camp shirts, fluid satin shirts, muscle tanks, and stacked denim.',
    quickTabs: [
      { label: 'All Men', path: '/men' },
      { label: 'New In', path: '/men/new-in', slug: 'new-in' },
      { label: 'Best Sellers', path: '/men/best-sellers', slug: 'best-sellers' },
      { label: 'Knit Polos', path: '/men/polos', slug: 'polos' },
      { label: 'Mesh & Satin Shirts', path: '/men/shirts', slug: 'shirts' },
      { label: 'Muscle Tanks', path: '/men/t-shirts', slug: 't-shirts' },
      { label: 'Stacked Jeans', path: '/men/jeans', slug: 'jeans' },
      { label: 'Pants & Shorts', path: '/men/pants', slug: 'pants' },
      { label: 'Matching Sets', path: '/men/matching-sets', slug: 'matching-sets' },
    ],
  },
  girls: {
    title: 'Girls',
    eyebrow: 'Girls & Teen',
    description:
      'Trendy crop tee & cargo sets, breezy cotton sundresses, and fresh warm-weather youth styles.',
    quickTabs: [
      { label: 'All Girls', path: '/girls' },
      { label: 'New In', path: '/girls/new-in', slug: 'new-in' },
      { label: 'Matching Sets', path: '/girls/matching-sets', slug: 'matching-sets' },
      { label: 'Crop Tops & Tees', path: '/girls/tops', slug: 'tops' },
      { label: 'Cargo Pants', path: '/girls/pants', slug: 'pants' },
      { label: 'Sundresses', path: '/girls/dresses', slug: 'dresses' },
    ],
  },
  boys: {
    title: 'Boys',
    eyebrow: 'Boys & Teen',
    description:
      'Crisp short-sleeve camp shirt sets, open-collar knit polos, resort shirts, and stacked street denim.',
    quickTabs: [
      { label: 'All Boys', path: '/boys' },
      { label: 'New In', path: '/boys/new-in', slug: 'new-in' },
      { label: 'Camp Shirt Sets', path: '/boys/matching-sets', slug: 'matching-sets' },
      { label: 'Knit Polos', path: '/boys/polos', slug: 'polos' },
      { label: 'Resort Shirts', path: '/boys/shirts', slug: 'shirts' },
      { label: 'Stacked Denim', path: '/boys/jeans', slug: 'jeans' },
    ],
  },
  accessories: {
    title: 'Accessories',
    eyebrow: 'Finishing Touches',
    description:
      'Structured matte leather bags, layered silver Cuban chains, dark acetate sunglasses, and minimalist watches.',
    quickTabs: [
      { label: 'All Accessories', path: '/accessories' },
      { label: 'Bags', path: '/accessories/bags', slug: 'bags' },
      { label: 'Silver Chains', path: '/accessories/jewelry', slug: 'jewelry' },
      { label: 'Sunglasses', path: '/accessories/sunglasses', slug: 'sunglasses' },
      { label: 'Watches', path: '/accessories/watches', slug: 'watches' },
    ],
  },
};

function formatSlugLabel(slug?: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

export function CatalogPage({
  mode,
  audience,
  subSlug,
  categorySlug,
  collectionSlug,
  brandSlug,
}: CatalogPageProps) {
  const {
    products,
    categories,
    variants,
    storefrontConfig,
    getProductVariants,
    loadingCatalog,
    navigate,
  } = useStore();
  const { lang, tr } = useLanguage();
  const { isAppMode } = useExperienceMode();
  const { prefersReducedMotion } = useMotionSystem();
  const localizedBrands = useMemo(() => getLocalizedBrands(lang), [lang]);
  const localizedCategories = useMemo(() => getLocalizedCategories(lang), [lang]);
  const localizedCollections = useMemo(() => getLocalizedCollections(lang), [lang]);
  const dynamicSubMenus = useMemo(
    () => extractDynamicSubMenus(storefrontConfig),
    [storefrontConfig]
  );

  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [maxPriceXof, setMaxPriceXof] = useState<number>(150000);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!filtersOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFiltersOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [filtersOpen]);

  // Reset local drawer filters when route context changes
  useEffect(() => {
    setSelectedAudience('all');
    setSelectedBrand('all');
    setSelectedCollection('all');
    setSelectedStyle('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setAvailabilityFilter('all');
    setMaxPriceXof(150000);
    setSortBy(mode === 'new-in' ? 'newest' : 'recommended');
  }, [mode, audience, subSlug, categorySlug, collectionSlug, brandSlug]);

  const effectiveAudience: CatalogAudience | null = useMemo(() => {
    if (mode === 'audience' && audience && audience !== 'unisex') return audience;
    if (mode === 'accessories') return 'accessories';
    if (mode === 'category' && categorySlug) {
      if (['women', 'men', 'girls', 'boys', 'accessories'].includes(categorySlug)) {
        return categorySlug as CatalogAudience;
      }
    }
    return null;
  }, [mode, audience, categorySlug]);

  const activeCollectionObj = useMemo(() => {
    if (mode !== 'collection' || !collectionSlug) return null;
    const found = localizedCollections.find((c) => c.slug === collectionSlug);
    if (found) return found;
    return {
      slug: collectionSlug,
      seasonTag: tr('Capsule saisonnière', 'Seasonal Drop'),
      title: formatSlugLabel(collectionSlug) || 'Collection',
      shortTitle: formatSlugLabel(collectionSlug) || 'Collection',
      subtitle: tr('Édition saisonnière KIKI JONES', 'KIKI JONES Seasonal Edit'),
      description: tr(
        'Silhouettes contemporaines pour Femme, Homme, Filles et Garçons.',
        'Curated monochrome wardrobe silhouettes across Women, Men, Girls, and Boys.'
      ),
      campaignImage: '',
      audiences: ['women', 'men', 'girls', 'boys'] as ('women' | 'men' | 'girls' | 'boys')[],
    };
  }, [mode, collectionSlug, localizedCollections, tr]);

  const activeBrandObj = useMemo(() => {
    if (mode !== 'brand' || !brandSlug) return null;
    return localizedBrands.find((b) => b.slug === brandSlug) || null;
  }, [mode, brandSlug, localizedBrands]);

  const activeProductCategoryObj = useMemo(() => {
    if (mode !== 'category' || !categorySlug) return null;
    return localizedCategories.find((c) => c.slug === categorySlug) || null;
  }, [mode, categorySlug, localizedCategories]);

  const activeCategoryObj = useMemo(() => {
    if (mode !== 'category' || !categorySlug) return null;
    return (
      categories.find((c) => c.slug === categorySlug) ||
      INITIAL_CATEGORIES.find((c) => c.slug === categorySlug) ||
      null
    );
  }, [mode, categorySlug, categories]);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v) => v.size && set.add(v.size));
    return Array.from(set);
  }, [variants]);

  const allColors = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v) => v.color && set.add(v.color));
    return Array.from(set);
  }, [variants]);

  const allStyles = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => (p.styleTags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const matchesSubSlug = (p: (typeof products)[number], slug: string): boolean => {
      const normalized = slug.toLowerCase();
      if (normalized === 'new-in') return Boolean(p.isNewDrop);
      if (normalized === 'best-sellers') return Boolean(p.isBestSeller || p.isFeatured);
      if (normalized === 'trending' || normalized === 'trending-now') return Boolean(p.isTrending || p.isFeatured);
      if (normalized === 'back-in-stock') return !getProductAvailability(p, getProductVariants(p.id)).isSoldOut;

      const hay = normalizeText(
        [
          p.subCategory || '',
          p.name,
          p.description,
          ...(p.styleTags || []),
          ...(p.collectionSlugs || []),
        ].join(' ')
      );

      if (p.subCategory?.toLowerCase() === normalized) return true;
      if ((p.collectionSlugs || []).includes(normalized)) return true;
      if ((p.styleTags || []).some((t) => normalizeText(t).includes(normalized))) return true;
      if (matchesDynamicMenuSlug(p, normalized, dynamicSubMenus)) return true;

      // Smart bilingual (FR + EN) alias matching for mega menu categories
      const terms = SUBCATEGORY_ALIASES[normalized] || [normalizeText(normalized.replace(/-/g, ' '))];
      return terms.some((t) => hay.includes(t));
    };

    const baseList = products.filter((p) => {
      if (mode === 'new-in' && !p.isNewDrop) return false;
      if (mode === 'sale') {
        const isOnSale =
          typeof p.promoPriceXof === 'number' &&
          p.promoPriceXof > 0 &&
          p.promoPriceXof < p.regularPriceXof;
        if (!isOnSale) return false;
      }

      if (mode === 'brand' && brandSlug) {
        if (p.brandSlug !== brandSlug) return false;
      }

      if (effectiveAudience) {
        if (effectiveAudience === 'accessories') {
          if (
            p.categoryId !== 'cat_accessories' &&
            p.audience !== 'unisex' &&
            !['accessories', 'sunglasses', 'bags', 'jewelry', 'watches'].includes(p.subCategory || '')
          ) {
            return false;
          }
        } else if (p.audience !== effectiveAudience) {
          return false;
        }
      }

      if (mode === 'category' && categorySlug && !effectiveAudience) {
        if (activeProductCategoryObj) {
          const allowed = activeProductCategoryObj.matchSubCategories || [activeProductCategoryObj.slug];
          const matchesSub = allowed.includes(p.subCategory || '') || matchesSubSlug(p, categorySlug);
          if (!matchesSub) return false;
        } else if (activeCategoryObj) {
          if (p.categoryId !== activeCategoryObj.id) return false;
        } else if (!matchesSubSlug(p, categorySlug)) {
          return false;
        }
      }

      if (mode === 'collection' && collectionSlug) {
        const inCol = (p.collectionSlugs || []).includes(collectionSlug);
        if (!inCol) {
          // Ensure Formal & Sport collections also surface matching Luxe gowns/dresses and Sport pieces
          if (collectionSlug === 'formal') {
            const isFormalMatch =
              p.brandSlug === 'kiki-luxe' &&
              (p.subCategory === 'dresses' || p.subCategory === 'matching-sets' || p.subCategory === 'shoes');
            if (!isFormalMatch) return false;
          } else if (collectionSlug === 'sport') {
            if (p.brandSlug !== 'kiki-sport' && p.subCategory !== 'activewear') return false;
          } else {
            return false;
          }
        }
      }

      if (selectedBrand !== 'all' && p.brandSlug !== selectedBrand) {
        return false;
      }

      if (selectedAudience !== 'all' && p.audience !== selectedAudience) {
        return false;
      }

      if (selectedCollection !== 'all' && !(p.collectionSlugs || []).includes(selectedCollection)) {
        return false;
      }

      if (selectedStyle !== 'all' && !(p.styleTags || []).includes(selectedStyle)) {
        return false;
      }

      const pVariants = getProductVariants(p.id);
      const effectivePrice =
        typeof p.promoPriceXof === 'number' && p.promoPriceXof > 0
          ? p.promoPriceXof
          : p.regularPriceXof;

      if (effectivePrice > maxPriceXof) return false;

      if (selectedSize !== 'all') {
        const hasSize = pVariants.some((v) => v.size === selectedSize && v.isActive);
        if (!hasSize) return false;
      }

      if (selectedColor !== 'all') {
        const hasColor = pVariants.some((v) => v.color === selectedColor && v.isActive);
        if (!hasColor) return false;
      }

      if (availabilityFilter !== 'all') {
        const state = getProductAvailability(p, pVariants);
        if (availabilityFilter === 'in_stock' && state.isSoldOut) return false;
        if (availabilityFilter === 'sale' && !state.isOnSale) return false;
        if (availabilityFilter === 'new' && !p.isNewDrop) return false;
        if (availabilityFilter === 'bestseller' && !p.isBestSeller) return false;
      }

      return true;
    });

    // Apply subSlug filter if present; if exact subSlug filter returns at least 1 item use it, else keep audience list filtered softly
    let finalList = baseList;
    if (subSlug) {
      const subMatched = baseList.filter((p) => matchesSubSlug(p, subSlug));
      finalList = subMatched;
    }

    return [...finalList].sort((a, b) => {
      const priceA =
        typeof a.promoPriceXof === 'number' && a.promoPriceXof > 0
          ? a.promoPriceXof
          : a.regularPriceXof;
      const priceB =
        typeof b.promoPriceXof === 'number' && b.promoPriceXof > 0
          ? b.promoPriceXof
          : b.regularPriceXof;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'best-sellers') {
        const scoreA = (a.isBestSeller ? 2 : 0) + (a.isFeatured ? 1 : 0);
        const scoreB = (b.isBestSeller ? 2 : 0) + (b.isFeatured ? 1 : 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      if (sortBy === 'newest') {
        const dropA = a.isNewDrop ? a.newDropOrder || 50 : 999;
        const dropB = b.isNewDrop ? b.newDropOrder || 50 : 999;
        if (dropA !== dropB) return dropA - dropB;
      }
      const featDiff = (a.featuredOrder || 999) - (b.featuredOrder || 999);
      if (featDiff !== 0) return featDiff;
      return (a.sku || '').localeCompare(b.sku || '');
    });
  }, [
    products,
    mode,
    effectiveAudience,
    activeCategoryObj,
    activeProductCategoryObj,
    categorySlug,
    collectionSlug,
    brandSlug,
    subSlug,
    selectedAudience,
    selectedBrand,
    selectedCollection,
    selectedStyle,
    maxPriceXof,
    selectedSize,
    selectedColor,
    availabilityFilter,
    sortBy,
    getProductVariants,
    dynamicSubMenus,
  ]);

  const resetFilters = () => {
    setSelectedAudience('all');
    setSelectedBrand('all');
    setSelectedCollection('all');
    setSelectedStyle('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setAvailabilityFilter('all');
    setMaxPriceXof(150000);
    setSortBy('recommended');
  };

  const activeFilterCount = [
    selectedAudience !== 'all',
    selectedBrand !== 'all',
    selectedCollection !== 'all',
    selectedStyle !== 'all',
    selectedSize !== 'all',
    selectedColor !== 'all',
    availabilityFilter !== 'all',
    maxPriceXof < 150000,
  ].filter(Boolean).length;

  const pageMeta = useMemo(() => {
    if (mode === 'brand' && activeBrandObj) {
      const slotKey = `brand:${activeBrandObj.slug}`;
      return {
        eyebrow: `${tr('Par Marque', 'Shop by Brand')} · ${activeBrandObj.tagline}`,
        title: activeBrandObj.name,
        description: activeBrandObj.description,
        bannerImage: hasCustomSectionImage(storefrontConfig, slotKey)
          ? getSectionImage(storefrontConfig, slotKey, activeBrandObj.heroImage)
          : '',
      };
    }
    if (mode === 'category' && activeProductCategoryObj) {
      const slotKey = `category:${activeProductCategoryObj.slug}`;
      return {
        eyebrow: `${tr('Par Catégorie', 'Shop by Category')} · ${activeProductCategoryObj.subtitle}`,
        title: activeProductCategoryObj.name,
        description: activeProductCategoryObj.description,
        bannerImage: hasCustomSectionImage(storefrontConfig, slotKey)
          ? getSectionImage(storefrontConfig, slotKey, activeProductCategoryObj.imageUrl)
          : '',
      };
    }
    if (mode === 'collection' && activeCollectionObj) {
      const slotKey = `collection:${activeCollectionObj.slug}`;
      return {
        eyebrow: `${activeCollectionObj.seasonTag} · ${activeCollectionObj.audiences
          .map((a) => localizeAudienceLabel(a, lang))
          .join(' / ')}`,
        title: activeCollectionObj.title,
        description: activeCollectionObj.description,
        bannerImage: getSectionImage(storefrontConfig, slotKey, activeCollectionObj.campaignImage || ''),
      };
    }
    if (mode === 'new-in') {
      return {
        eyebrow: tr('Vient d’arriver', 'Just Landed'),
        title: tr('Nouveautés', 'New Arrivals'),
        description: tr(
          'Les dernières arrivées pour climats chauds sur Kiki Men, Kiki Luxe, Kiki Curve, Kiki Sculpt, Kiki Sport et Kiki Kids.',
          'The latest warm-climate drops across Kiki Men, Kiki Luxe, Kiki Curve, Kiki Sculpt, Kiki Sport, and Kiki Kids.'
        ),
        bannerImage: '',
      };
    }
    if (mode === 'sale') {
      return {
        eyebrow: tr('Offres limitées', 'Limited-Time Offers'),
        title: tr('Soldes', 'Sale'),
        description: tr(
          'Sélection de remises saisonnières sur les robes, ensembles, combinaisons, sport, mode homme et accessoires.',
          'Curated seasonal reductions across dresses, matching sets, rompers, biker shorts, menswear, and accessories.'
        ),
        bannerImage: '',
      };
    }
    if (effectiveAudience) {
      const copy = AUDIENCE_COPY[effectiveAudience];
      const localizedTitle = localizeAudienceLabel(effectiveAudience, lang);
      const subLabel = subSlug ? translateLabel(formatSlugLabel(subSlug), lang) : '';
      const slotKey = `audience:${effectiveAudience}`;
      return {
        eyebrow: subSlug
          ? `${localizedTitle} · ${subLabel}`
          : tr(localizedTitle, copy.eyebrow),
        title: subSlug ? `${localizedTitle} — ${subLabel}` : localizedTitle,
        description:
          lang === 'fr'
            ? tr(
                `Découvrez notre sélection ${localizedTitle.toLowerCase()} KIKI JONES pensée pour le style et le confort.`,
                copy.description
              )
            : copy.description,
        bannerImage: hasCustomSectionImage(storefrontConfig, slotKey)
          ? getSectionImage(storefrontConfig, slotKey, '')
          : '',
      };
    }
    const dynamicMeta =
      mode === 'category' && categorySlug
        ? findDynamicMenuMeta(categorySlug, dynamicSubMenus)
        : null;
    if (dynamicMeta) {
      return {
        eyebrow: tr('Coupes & Styles · KIKI JONES', 'Cuts & Styles · KIKI JONES'),
        title: lang === 'fr' ? dynamicMeta.labelFr : dynamicMeta.labelEn,
        description: lang === 'fr' ? dynamicMeta.descFr : dynamicMeta.descEn,
        bannerImage: '',
      };
    }
    return {
      eyebrow: tr('Boutique KIKI JONES', 'KIKI JONES Store'),
      title:
        activeCategoryObj?.name ||
        (categorySlug ? translateLabel(formatSlugLabel(categorySlug), lang) : '') ||
        tr('Toute la boutique', 'All Clothing & Accessories'),
      description: tr(
        'Explorez l’ensemble du catalogue KIKI JONES par marques et catégories.',
        'Explore the complete KIKI JONES catalog across brands and categories.'
      ),
      bannerImage: '',
    };
  }, [
    mode,
    activeBrandObj,
    activeProductCategoryObj,
    activeCollectionObj,
    effectiveAudience,
    subSlug,
    activeCategoryObj,
    categorySlug,
    storefrontConfig,
    dynamicSubMenus,
    lang,
    tr,
  ]);

  const quickTabs = useMemo(() => {
    if (mode === 'brand') {
      return [
        { label: tr('Toutes les marques', 'All Brands'), path: '/brands', slug: '__all_brands__' },
        ...localizedBrands.map((b) => ({
          label: b.name,
          path: `/brand/${b.slug}`,
          slug: b.slug,
        })),
      ];
    }
    if (mode === 'category' && activeProductCategoryObj) {
      return [
        { label: tr('Toutes les catégories', 'All Categories'), path: '/categories', slug: '__all_cats__' },
        ...localizedCategories.map((c) => ({
          label: c.name,
          path: `/category/${c.slug}`,
          slug: c.slug,
        })),
      ];
    }
    if (effectiveAudience) {
      return AUDIENCE_COPY[effectiveAudience].quickTabs.map((t) => ({
        ...t,
        label: translateLabel(t.label, lang),
      }));
    }
    if (mode === 'collection') {
      return [
        { label: tr('Toutes les collections', 'All Collections'), path: '/collections', slug: '__all__' },
        ...localizedCollections.map((c) => ({
          label: c.title,
          path: `/collection/${c.slug}`,
          slug: c.slug,
        })),
      ];
    }
    return [
      { label: tr('Tout voir', 'Shop All'), path: '/shop', slug: '__shop__' },
      { label: tr('Nouveautés', 'New In'), path: '/new-in', slug: '__new__' },
      { label: tr('Par Marque', 'Shop by Brand'), path: '/brands', slug: '__brands__' },
      { label: tr('Par Catégorie', 'Shop by Category'), path: '/categories', slug: '__categories__' },
      { label: tr('Femme', 'Women'), path: '/women', slug: 'women' },
      { label: tr('Homme', 'Men'), path: '/men', slug: 'men' },
      { label: tr('Enfants', 'Kids'), path: '/brand/kiki-kids', slug: 'kiki-kids' },
    ];
  }, [
    effectiveAudience,
    mode,
    activeProductCategoryObj,
    localizedBrands,
    localizedCategories,
    localizedCollections,
    lang,
    tr,
  ]);

  const megaMenuBanner = useMemo(() => {
    if (effectiveAudience && MEGA_MENUS[effectiveAudience as MegaMenuKey]) {
      return MEGA_MENUS[effectiveAudience as MegaMenuKey].editorial;
    }
    return null;
  }, [effectiveAudience]);

  return (
    <main
      className={`${
        isAppMode ? 'pt-0 pb-10' : 'pt-[88px] lg:pt-[96px] pb-12'
      } w-full max-w-full overflow-x-clip min-h-screen bg-white text-black`}
    >
      {/* Optional Widescreen Campaign / Section Banner Header */}
      {Boolean(pageMeta.bannerImage) && (
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[380px] bg-black overflow-hidden">
          <img
            src={pageMeta.bannerImage}
            alt={pageMeta.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 max-w-[1440px] mx-auto px-4 sm:px-6 pb-5 text-white space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/75">
              {pageMeta.eyebrow}
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl text-white leading-tight">
              {pageMeta.title}
            </h1>
            <p className="text-xs sm:text-sm font-light text-white/85 max-w-2xl">
              {pageMeta.description}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        {/* Category Header */}
        <div className="pt-4 pb-3 border-b border-black/10 flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="space-y-1 max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
              {pageMeta.eyebrow}
            </p>
            {!pageMeta.bannerImage && (
              <div className="flex items-start gap-1.5">
                <h1 className="font-editorial text-2xl sm:text-3xl text-black leading-tight">
                  {pageMeta.title}
                </h1>
                <sup className="text-xs font-bold text-black/50 tabular-nums mt-1.5">
                  {filteredProducts.length}
                </sup>
              </div>
            )}
            {mode === 'collection' && pageMeta.bannerImage ? (
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/55 tabular-nums">
                {filteredProducts.length} {tr('pièces disponibles', 'Pieces Available')}
              </p>
            ) : (
              <p className="text-xs font-light text-black/65 leading-relaxed">
                {pageMeta.description}
              </p>
            )}
          </div>

          {/* Sort + Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-end shrink-0 max-w-full">
            <select
              aria-label={tr('Trier les produits', 'Sort products')}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-black/15 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-black focus:outline-none focus:border-black cursor-pointer max-w-full"
            >
              <option value="recommended">{tr('Recommandés', 'Recommended')}</option>
              <option value="newest">{tr('Nouveautés', 'Newest')}</option>
              <option value="best-sellers">Best-Sellers</option>
              <option value="price-asc">{tr('Prix croissant', 'Price: Low to High')}</option>
              <option value="price-desc">{tr('Prix décroissant', 'Price: High to Low')}</option>
            </select>

            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-1.5 border border-black bg-black text-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-black/85 transition-colors cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>
                {tr('Filtrer', 'Filter')}
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </span>
            </button>
          </div>
        </div>

        {/* Subcategory Quick Navigation Tabs */}
        <div className="py-2.5 border-b border-black/10 flex items-center gap-4 overflow-x-auto no-scrollbar text-xs">
          {quickTabs.map((tab) => {
            const isActive =
              (effectiveAudience && !subSlug && !tab.slug) ||
              (subSlug && tab.slug === subSlug) ||
              (mode === 'brand' && brandSlug && tab.slug === brandSlug) ||
              (mode === 'category' && categorySlug && tab.slug === categorySlug) ||
              (mode === 'collection' && collectionSlug && tab.slug === collectionSlug) ||
              (mode === 'all' && tab.slug === '__shop__') ||
              (mode === 'new-in' && tab.slug === '__new__');

            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`whitespace-nowrap shrink-0 cursor-pointer pb-0.5 transition-colors ${
                  isActive
                    ? 'font-bold text-black underline underline-offset-4'
                    : 'font-light text-black/55 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="pt-3.5">
          {loadingCatalog ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-[#F5F5F5] animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-[#F7F7F7] px-5 py-12 text-center space-y-3">
              <p className="font-editorial text-2xl sm:text-3xl text-black">
                {tr('Aucune pièce ne correspond à ces filtres', 'No pieces match these filters')}
              </p>
              <p className="text-xs font-light text-black/60 max-w-md mx-auto">
                {tr(
                  'Ajustez ou réinitialisez vos filtres pour découvrir toute la sélection KIKI JONES.',
                  'Adjust or reset your active filters, or explore the full KIKI JONES selection.'
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
                >
                  {tr('Réinitialiser', 'Reset Filters')}
                </button>
                {subSlug && effectiveAudience && (
                  <button
                    type="button"
                    onClick={() => navigate(`/${effectiveAudience}`)}
                    className="px-5 py-2.5 border border-black text-black text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
                  >
                    {tr(
                      `Tout voir · ${localizeAudienceLabel(effectiveAudience, lang)}`,
                      `View All ${AUDIENCE_COPY[effectiveAudience].title}`
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-1.5 gap-y-4 sm:gap-x-2 sm:gap-y-5 items-stretch">
              {filteredProducts.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.08 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.36,
                    delay: prefersReducedMotion ? 0 : (idx % 4) * 0.04,
                    ease: KJ_EASE.editorial,
                  }}
                >
                  <ProductCard product={p} variants={getProductVariants(p.id)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Editorial Audience Footer Prompt */}
        {megaMenuBanner && (
          <div className="mt-8 pt-6 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                {tr('Sélection éditoriale', 'Editorial Spotlight')}
              </p>
              <p className="font-editorial text-2xl text-black mt-0.5">
                {tr('Découvrir les collections KIKI JONES', 'Explore KIKI JONES Seasonal Collections')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/collections')}
              className="px-5 py-2.5 border border-black text-black text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-black hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
            >
              {tr('Toutes les collections', 'View All Collections')}
            </button>
          </div>
        )}
      </div>

      {/* Slide-Over Filter Drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              key="filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={KJ_TRANSITION.backdrop}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              key="filter-panel"
              initial={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
              animate={{ x: 0, opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
              transition={{
                duration: prefersReducedMotion ? 0.14 : KJ_DURATION.menu,
                ease: KJ_EASE.editorial,
              }}
              className="relative w-80 max-w-[88vw] bg-white h-full flex flex-col shadow-2xl"
            >
            <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-black">
                {tr('Filtrer & Affiner', 'Filter & Refine')}
              </span>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label={tr('Fermer les filtres', 'Close filters')}
                className="p-1.5 text-black/70 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.6} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
              {!effectiveAudience && (
                <div className="space-y-2.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black/50">
                    {tr('Univers', 'Category')}
                  </p>
                  <div className="flex flex-col gap-1.5 text-xs">
                    {[
                      { id: 'all', label: tr('Tous les univers', 'All Categories') },
                      { id: 'women', label: tr('Femme', 'Women') },
                      { id: 'men', label: tr('Homme', 'Men') },
                      { id: 'girls', label: tr('Filles', 'Girls') },
                      { id: 'boys', label: tr('Garçons', 'Boys') },
                      { id: 'accessories', label: tr('Accessoires', 'Accessories') },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedAudience(item.id)}
                        className={`text-left py-1 cursor-pointer ${
                          selectedAudience === item.id
                            ? 'font-bold text-black'
                            : 'font-light text-black/65 hover:text-black'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode !== 'brand' && (
                <div className="space-y-2.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black/50">
                    {tr('Marque', 'Brand')}
                  </p>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedBrand('all')}
                      className={`text-left py-1 cursor-pointer ${
                        selectedBrand === 'all'
                          ? 'font-bold text-black'
                          : 'font-light text-black/65 hover:text-black'
                      }`}
                    >
                      {tr('Toutes les marques', 'All Brands')}
                    </button>
                    {localizedBrands.map((b) => (
                      <button
                        key={b.slug}
                        type="button"
                        onClick={() => setSelectedBrand(b.slug)}
                        className={`text-left py-1 cursor-pointer ${
                          selectedBrand === b.slug
                            ? 'font-bold text-black'
                            : 'font-light text-black/65 hover:text-black'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode !== 'collection' && (
                <div className="space-y-2.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black/50">
                    Collection
                  </p>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedCollection('all')}
                      className={`text-left py-1 cursor-pointer ${
                        selectedCollection === 'all'
                          ? 'font-bold text-black'
                          : 'font-light text-black/65 hover:text-black'
                      }`}
                    >
                      {tr('Toutes les collections', 'All Collections')}
                    </button>
                    {localizedCollections.map((col) => (
                      <button
                        key={col.slug}
                        type="button"
                        onClick={() => setSelectedCollection(col.slug)}
                        className={`text-left py-1 cursor-pointer ${
                          selectedCollection === col.slug
                            ? 'font-bold text-black'
                            : 'font-light text-black/65 hover:text-black'
                        }`}
                      >
                        {col.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {allStyles.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black/50">
                    Style
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedStyle('all')}
                      className={`px-3 py-1.5 text-[11px] font-bold cursor-pointer ${
                        selectedStyle === 'all'
                          ? 'bg-black text-white'
                          : 'bg-[#F5F5F5] text-black hover:bg-black/10'
                      }`}
                    >
                      {tr('Tous', 'All')}
                    </button>
                    {allStyles.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStyle(st)}
                        className={`px-3 py-1.5 text-[11px] font-bold capitalize cursor-pointer ${
                          selectedStyle === st
                            ? 'bg-black text-white'
                            : 'bg-[#F5F5F5] text-black hover:bg-black/10'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black/50">
                  {tr('Taille', 'Size')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSize('all')}
                    className={`px-3 py-1.5 text-xs font-bold cursor-pointer ${
                      selectedSize === 'all'
                        ? 'bg-black text-white'
                        : 'bg-[#F5F5F5] text-black hover:bg-black/10'
                    }`}
                  >
                    {tr('Toutes', 'All')}
                  </button>
                  {allSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1.5 text-xs font-bold cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-black text-white'
                          : 'bg-[#F5F5F5] text-black hover:bg-black/10'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black/50">
                  {tr('Couleur', 'Color')}
                </p>
                <div className="flex flex-col gap-1.5 text-xs max-h-40 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedColor('all')}
                    className={`text-left py-1 cursor-pointer ${
                      selectedColor === 'all' ? 'font-bold text-black' : 'font-light text-black/65'
                    }`}
                  >
                    {tr('Toutes les couleurs', 'All Colors')}
                  </button>
                  {allColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`text-left py-1 cursor-pointer ${
                        selectedColor === c
                          ? 'font-bold text-black'
                          : 'font-light text-black/65 hover:text-black'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black/50">
                  {tr('Disponibilité', 'Availability')}
                </p>
                <div className="flex flex-col gap-1.5 text-xs">
                  {[
                    { id: 'all', label: tr('Toutes les pièces', 'All Pieces') },
                    { id: 'in_stock', label: tr('En stock uniquement', 'In Stock Only') },
                    { id: 'new', label: tr('Nouveautés', 'New Arrivals') },
                    { id: 'bestseller', label: 'Best-Sellers' },
                    { id: 'sale', label: tr('En promotion', 'On Sale') },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAvailabilityFilter(opt.id)}
                      className={`text-left py-1 cursor-pointer ${
                        availabilityFilter === opt.id
                          ? 'font-bold text-black'
                          : 'font-light text-black/65 hover:text-black'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-[0.18em] text-black/50">
                  <span>{tr('Prix maximum', 'Max Price')}</span>
                  <span className="tabular-nums text-black">{formatXOF(maxPriceXof)}</span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={150000}
                  step={2500}
                  value={maxPriceXof}
                  onChange={(e) => setMaxPriceXof(Number(e.target.value))}
                  className="w-full accent-black"
                />
              </div>
            </div>

            <div className="p-5 border-t border-black/10 flex gap-2.5 shrink-0">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-3 bg-[#F5F5F5] text-xs font-bold uppercase tracking-[0.14em] text-black hover:bg-black/10 cursor-pointer"
              >
                {tr('Réinitialiser', 'Reset')}
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex-1 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.14em] hover:bg-black/85 cursor-pointer"
              >
                {tr('Appliquer', 'Apply')} ({filteredProducts.length})
              </button>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
