import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import {
  DivisionKey,
  KJ_IMAGES,
  MegaMenuKey,
} from '../../lib/navigationData';
import {
  getFloatingSubnav,
  getMegaMenuLocalized,
  getLocalizedBrands,
  getLocalizedCollections,
} from '../../lib/i18n';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { getSectionImage } from '../../lib/storefrontMedia';

interface VisualCard {
  id: string;
  label: string;
  href: string;
  imageUrl?: string;
  slot?: string;
  isSaleGraphic?: boolean;
}

interface DirectoryRow {
  id: string;
  label: string;
  href: string;
  megaMenuKey?: MegaMenuKey;
  accentSale?: boolean;
  isNew?: boolean;
}

interface MobileShopDirectoryProps {
  selectedDivision: DivisionKey;
  onSelectDivision: (div: DivisionKey) => void;
  onNavigate: (path: string) => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: (query: string) => void;
  showSearchBar?: boolean;
}

const MEGA_MENU_SLOT_MAP: Partial<Record<MegaMenuKey, string>> = {
  women: 'audience:women',
  men: 'audience:men',
  kids: 'brand:kiki-kids',
  curve: 'brand:kiki-curve',
  sport: 'brand:kiki-sport',
  brands: 'brand:kiki-luxe',
  dresses: 'category:dresses',
  'matching-sets': 'category:matching-sets',
  tops: 'category:shirts',
  bottoms: 'category:bottoms',
  shoes: 'category:shoes',
  accessories: 'audience:accessories',
};

export function MobileShopDirectory({
  selectedDivision,
  onSelectDivision,
  onNavigate,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  showSearchBar = true,
}: MobileShopDirectoryProps) {
  const { lang, tr } = useLanguage();
  const { storefrontConfig, addRecentSearch } = useStore();
  const [localSearch, setLocalSearch] = useState('');
  const [drillMenuKey, setDrillMenuKey] = useState<MegaMenuKey | null>(null);

  const queryValue = searchValue !== undefined ? searchValue : localSearch;
  const setQueryValue = (v: string) => {
    if (onSearchChange) onSearchChange(v);
    else setLocalSearch(v);
  };

  const divisions: { key: DivisionKey; label: string; searchHint: string }[] = useMemo(
    () => [
      {
        key: 'women',
        label: tr('Femme', 'Women'),
        searchHint: tr('Rechercher dans Femme...', "Search within Women's clothing"),
      },
      {
        key: 'curve',
        label: 'Curve',
        searchHint: tr('Rechercher dans Curve...', "Search within Curve's clothing"),
      },
      {
        key: 'men',
        label: tr('Homme', 'Men'),
        searchHint: tr('Rechercher dans Homme...', "Search within Men's clothing"),
      },
      {
        key: 'sport',
        label: 'Sport',
        searchHint: tr('Rechercher dans Sport...', 'Search within Sport & Activewear'),
      },
      {
        key: 'kids',
        label: tr('Enfants', 'Kids'),
        searchHint: tr('Rechercher dans Enfants...', "Search within Kids' clothing"),
      },
    ],
    [tr]
  );

  const activeDivisionMeta =
    divisions.find((d) => d.key === selectedDivision) || divisions[0];

  // Editorial visual carousel tailored per division (strictly warm-climate, real Fashion Nova assets)
  const visualCards: VisualCard[] = useMemo(() => {
    switch (selectedDivision) {
      case 'curve':
        return [
          {
            id: 'curve-best',
            label: tr('Meilleures ventes', 'Best Sellers'),
            href: '/brand/kiki-curve',
            imageUrl: KJ_IMAGES.curveMiniCampaign,
            slot: 'brand:kiki-curve',
          },
          {
            id: 'curve-formal',
            label: tr('Soirée & Gala', 'Formal & Gowns'),
            href: '/collection/formal',
            imageUrl: KJ_IMAGES.curveGownCampaign,
            slot: 'collection:formal',
          },
          {
            id: 'curve-sets',
            label: tr('Ensembles', 'Matching Sets'),
            href: '/category/matching-sets',
            imageUrl: KJ_IMAGES.curveSetFeature,
            slot: 'category:matching-sets',
          },
          {
            id: 'curve-sale',
            label: tr('Soldes', 'Sale'),
            href: '/sale',
            isSaleGraphic: true,
          },
          {
            id: 'curve-sculpt',
            label: 'Kiki Sculpt',
            href: '/brand/kiki-sculpt',
            imageUrl: KJ_IMAGES.sculptFeature,
            slot: 'brand:kiki-sculpt',
          },
        ];
      case 'men':
        return [
          {
            id: 'men-best',
            label: tr('Meilleures ventes', 'Best Sellers'),
            href: '/men/best-sellers',
            imageUrl: KJ_IMAGES.menEditorial,
            slot: 'audience:men',
          },
          {
            id: 'men-shirts',
            label: tr('Chemises Soirée', 'Night-Out Shirts'),
            href: '/men/shirts',
            imageUrl: KJ_IMAGES.menMeshShirt,
            slot: 'category:shirts',
          },
          {
            id: 'men-street',
            label: 'Street Heat',
            href: '/collection/street-collection',
            imageUrl: KJ_IMAGES.menStreetDenim,
            slot: 'collection:street-collection',
          },
          {
            id: 'men-sale',
            label: tr('Soldes', 'Sale'),
            href: '/sale',
            isSaleGraphic: true,
          },
          {
            id: 'men-shoes',
            label: tr('Mocassins', 'Loafers'),
            href: '/men/shoes',
            imageUrl: KJ_IMAGES.menShoesFeature,
            slot: 'category:shoes',
          },
        ];
      case 'sport':
        return [
          {
            id: 'sport-best',
            label: tr('Meilleures ventes', 'Best Sellers'),
            href: '/brand/kiki-sport',
            imageUrl: KJ_IMAGES.sportFeature,
            slot: 'brand:kiki-sport',
          },
          {
            id: 'sport-men',
            label: tr('Sport Homme', 'Men Sport'),
            href: '/men/activewear',
            imageUrl: KJ_IMAGES.menSportFeature,
            slot: 'collection:sport',
          },
          {
            id: 'sport-biker',
            label: tr('Cyclistes', 'Biker Shorts'),
            href: '/category/activewear',
            imageUrl: KJ_IMAGES.activeShortsFeature,
            slot: 'category:activewear',
          },
          {
            id: 'sport-sale',
            label: tr('Soldes', 'Sale'),
            href: '/sale',
            isSaleGraphic: true,
          },
          {
            id: 'sport-sculpt',
            label: 'Kiki Sculpt',
            href: '/brand/kiki-sculpt',
            imageUrl: KJ_IMAGES.sculptBodysuitFeature,
            slot: 'brand:kiki-sculpt',
          },
        ];
      case 'kids':
        return [
          {
            id: 'kids-girls',
            label: tr('Filles', 'Girls'),
            href: '/girls',
            imageUrl: KJ_IMAGES.girlsEditorial,
            slot: 'audience:girls',
          },
          {
            id: 'kids-boys',
            label: tr('Garçons', 'Boys'),
            href: '/boys',
            imageUrl: KJ_IMAGES.boysEditorial,
            slot: 'audience:boys',
          },
          {
            id: 'kids-sets',
            label: tr('Ensembles', 'Matching Sets'),
            href: '/brand/kiki-kids',
            imageUrl: KJ_IMAGES.girlsEditorial,
            slot: 'brand:kiki-kids',
          },
          {
            id: 'kids-sale',
            label: tr('Soldes', 'Sale'),
            href: '/sale',
            isSaleGraphic: true,
          },
        ];
      case 'women':
      default:
        return [
          {
            id: 'women-best',
            label: tr('Meilleures ventes', 'Best Sellers'),
            href: '/women',
            imageUrl: KJ_IMAGES.heroCampaign,
            slot: 'audience:women',
          },
          {
            id: 'women-new',
            label: tr('Nouveautés', 'New In'),
            href: '/new-in',
            imageUrl: KJ_IMAGES.womenSatinEvening,
            slot: 'brand:kiki-luxe',
          },
          {
            id: 'women-afterdark',
            label: 'After Dark',
            href: '/collection/after-dark',
            imageUrl: KJ_IMAGES.womenCorsetCargo,
            slot: 'collection:after-dark',
          },
          {
            id: 'women-sale',
            label: tr('Soldes', 'Sale'),
            href: '/sale',
            isSaleGraphic: true,
          },
          {
            id: 'women-resort',
            label: tr('Soleil & Resort', 'Sun & Resort'),
            href: '/collection/summer-drop',
            imageUrl: KJ_IMAGES.womenResortSet,
            slot: 'collection:summer-drop',
          },
        ];
    }
  }, [selectedDivision, tr]);

  // Build detailed Shop rows directly from the division's desktop floating subnav + mega menu
  const shopRows: DirectoryRow[] = useMemo(() => {
    const subItems = getFloatingSubnav(selectedDivision, lang);
    const rows: DirectoryRow[] = [];

    // Lead with the division's full overview + New In + Sale highlight + all categories
    const divisionAllHref: Record<DivisionKey, string> = {
      women: '/women',
      curve: '/brand/kiki-curve',
      men: '/men',
      sport: '/brand/kiki-sport',
      kids: '/brand/kiki-kids',
    };

    const divisionAllLabel: Record<DivisionKey, string> = {
      women: tr('Tout voir · Femme', 'Shop All Women'),
      curve: tr('Tout voir · Curve', 'Shop All Curve'),
      men: tr('Tout voir · Homme', 'Shop All Men'),
      sport: tr('Tout voir · Sport', 'Shop All Sport'),
      kids: tr('Tout voir · Enfants', 'Shop All Kids'),
    };

    rows.push({
      id: `all-${selectedDivision}`,
      label: divisionAllLabel[selectedDivision],
      href: divisionAllHref[selectedDivision],
      megaMenuKey: selectedDivision,
    });

    const seenLabels = new Set<string>([divisionAllLabel[selectedDivision].toLowerCase()]);

    for (const item of subItems) {
      const lower = item.label.toLowerCase();
      if (
        lower.startsWith('tout curve') ||
        lower.startsWith('all curve') ||
        lower.startsWith('tout homme') ||
        lower.startsWith('all men') ||
        lower.startsWith('tout sport') ||
        lower.startsWith('all sport') ||
        lower.startsWith('tout enfants') ||
        lower.startsWith('all kids')
      ) {
        continue;
      }
      if (seenLabels.has(lower)) continue;
      seenLabels.add(lower);

      const isNew =
        item.href === '/new-in' ||
        item.href.endsWith('/new-in') ||
        item.href === '/collection/after-dark';

      rows.push({
        id: `${selectedDivision}-${item.label}`,
        label: item.label,
        href: item.href,
        megaMenuKey: item.megaMenuKey,
        accentSale: Boolean(item.highlight),
        isNew,
      });
    }

    return rows;
  }, [selectedDivision, lang, tr]);

  // Division's desktop MegaMenu columns (for full parity on mobile)
  const divisionMega = useMemo(
    () => getMegaMenuLocalized(selectedDivision, lang),
    [selectedDivision, lang]
  );

  // Localized brands & collections for the lower sections
  const brands = useMemo(() => getLocalizedBrands(lang), [lang]);
  const collections = useMemo(() => getLocalizedCollections(lang), [lang]);

  // Drill-down sub-menu data (Level 2)
  const drillConfig = useMemo(
    () => getMegaMenuLocalized(drillMenuKey, lang),
    [drillMenuKey, lang]
  );

  const drillEditorialImage = useMemo(() => {
    if (!drillConfig) return '';
    const slot = MEGA_MENU_SLOT_MAP[drillConfig.key];
    return slot
      ? getSectionImage(storefrontConfig, slot, drillConfig.editorial.imageUrl)
      : drillConfig.editorial.imageUrl;
  }, [drillConfig, storefrontConfig]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = queryValue.trim();
    if (!clean) return;
    addRecentSearch(clean);
    if (onSearchSubmit) {
      onSearchSubmit(clean);
    } else {
      onNavigate(`/search?q=${encodeURIComponent(clean)}`);
    }
  };

  const handleDivisionChange = (div: DivisionKey) => {
    setDrillMenuKey(null);
    onSelectDivision(div);
  };

  return (
    <div className="flex flex-col min-h-0">
      {/* Horizontal Division Tabs with Crisp Bold Black Underline (Matches Inspiration) */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-black/[0.08]">
        <div
          role="tablist"
          aria-label={tr('Univers KIKI JONES', 'KIKI JONES Divisions')}
          className="flex items-center justify-between px-3 sm:px-4 overflow-x-auto no-scrollbar"
        >
          {divisions.map((div) => {
            const active = selectedDivision === div.key;
            return (
              <button
                key={div.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleDivisionChange(div.key)}
                className={`relative min-h-[44px] px-2.5 py-2.5 text-[11px] uppercase tracking-[0.11em] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'font-bold text-black'
                    : 'font-medium text-black/55 hover:text-black'
                }`}
              >
                {div.label}
                {active && (
                  <motion.span
                    layoutId="mobile-division-underline"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute left-1 right-1 bottom-0 h-[2.5px] bg-black"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Scoped Capsule Search Bar */}
        {showSearchBar && (
          <div className="px-4 py-2.5">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2.5 rounded-full border border-black/15 bg-white/85 backdrop-blur-md px-3.5 min-h-[42px] focus-within:border-black transition-colors"
            >
              <Search className="w-[17px] h-[17px] text-black/45 shrink-0" strokeWidth={1.7} />
              <input
                type="text"
                value={queryValue}
                onChange={(e) => setQueryValue(e.target.value)}
                placeholder={activeDivisionMeta.searchHint}
                aria-label={activeDivisionMeta.searchHint}
                className="flex-1 bg-transparent text-[13.5px] font-light text-black placeholder:text-black/45 focus:outline-none py-1.5"
              />
              {queryValue && (
                <button
                  type="button"
                  onClick={() => setQueryValue('')}
                  aria-label={tr('Effacer', 'Clear search')}
                  className="p-1 text-black/50 hover:text-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Level 1 (Main Division Directory) vs Level 2 (Desktop-Parity Sub-Menu Drill-Down) */}
      <AnimatePresence mode="wait" initial={false}>
        {drillConfig ? (
          <motion.div
            key={`drill-${drillConfig.key}`}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="px-4 py-4 space-y-5"
          >
            {/* Drill-down Back Header */}
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <button
                type="button"
                onClick={() => setDrillMenuKey(null)}
                className="inline-flex items-center gap-1.5 min-h-[40px] pr-3 text-xs font-bold uppercase tracking-[0.14em] text-black hover:opacity-65 transition-opacity cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                <span>{activeDivisionMeta.label}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate(drillConfig.href)}
                className="inline-flex items-center gap-1 min-h-[40px] text-[11px] font-bold uppercase tracking-[0.13em] text-black underline underline-offset-4 cursor-pointer"
              >
                <span>{tr('Tout voir', 'Shop All')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Compact Editorial Card (Exact parity with Desktop MegaMenu right panel) */}
            <button
              type="button"
              onClick={() => onNavigate(drillConfig.editorial.href)}
              className="group relative w-full h-[144px] overflow-hidden bg-[#F5F5F5] text-left cursor-pointer block"
            >
              <img
                src={drillEditorialImage}
                alt={drillConfig.editorial.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/80">
                  {drillConfig.editorial.eyebrow}
                </p>
                <p className="font-editorial text-xl leading-tight mt-0.5">
                  {drillConfig.editorial.title}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
                  {drillConfig.editorial.ctaLabel}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>

            {/* All Columns from Desktop MegaMenu */}
            <div className="space-y-6">
              {drillConfig.columns.map((column) => (
                <div key={column.heading} className="space-y-1.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black/45 pb-1.5 border-b border-black/[0.08]">
                    {column.heading}
                  </p>
                  <div className="divide-y divide-black/[0.05]">
                    {column.links.map((link) => (
                      <button
                        key={`${column.heading}-${link.label}`}
                        type="button"
                        onClick={() => onNavigate(link.href)}
                        className="w-full min-h-[44px] flex items-center justify-between py-2.5 text-left text-[14.5px] font-normal text-black/90 hover:text-black active:opacity-60 transition-opacity cursor-pointer"
                      >
                        <span>{link.label}</span>
                        <ChevronRight className="w-4 h-4 text-black/35 shrink-0" strokeWidth={1.6} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`root-${selectedDivision}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="py-4 space-y-6"
          >
            {/* Horizontal Editorial Visual Cards Strip (Matches Screenshot Proportions) */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4">
              {visualCards.map((card) => {
                const resolvedImg = card.imageUrl
                  ? card.slot
                    ? getSectionImage(storefrontConfig, card.slot, card.imageUrl)
                    : card.imageUrl
                  : '';

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onNavigate(card.href)}
                    className="w-[108px] sm:w-[118px] shrink-0 snap-start text-left space-y-2 group cursor-pointer"
                  >
                    {card.isSaleGraphic ? (
                      <div className="aspect-[3/4] w-full bg-black text-white flex items-center justify-center overflow-hidden px-1">
                        <span className="font-bold text-[22px] tracking-[0.06em] uppercase leading-none">
                          {tr('SOLDES', 'SALE')}
                        </span>
                      </div>
                    ) : (
                      <div className="aspect-[3/4] w-full bg-[#F5F5F5] overflow-hidden">
                        <img
                          src={resolvedImg}
                          alt={card.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                    )}
                    <p className="text-[13px] font-normal text-black leading-snug">
                      {card.label}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Section 1: Two-Column "Boutique / Shop" Detailed Directory (Exact Inspiration Layout) */}
            <section className="px-4 flex items-start gap-3">
              <div className="w-[82px] shrink-0 pt-2.5">
                <h3 className="text-[15px] font-medium text-black leading-snug">
                  {tr('Boutique', 'Shop')}
                </h3>
              </div>
              <div className="flex-1 min-w-0 divide-y divide-black/[0.05]">
                {shopRows.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => {
                      if (row.megaMenuKey) {
                        setDrillMenuKey(row.megaMenuKey);
                      } else {
                        onNavigate(row.href);
                      }
                    }}
                    className="w-full min-h-[46px] flex items-center justify-between gap-2 py-2.5 text-left active:opacity-55 transition-opacity cursor-pointer"
                  >
                    <span
                      className={`text-[15px] leading-snug ${
                        row.accentSale
                          ? 'font-medium text-[#B91C1C]'
                          : 'font-normal text-black'
                      }`}
                    >
                      {row.label}
                      {row.isNew && (
                        <sup className="ml-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-black">
                          {tr('NOUVEAU', 'NEW')}
                        </sup>
                      )}
                    </span>
                    <ChevronRight
                      className="w-[17px] h-[17px] text-black/40 shrink-0"
                      strokeWidth={1.6}
                    />
                  </button>
                ))}
              </div>
            </section>

            {/* Section 2: Full Division Desktop Mega-Menu Columns (So NO sub-link is ever missing on mobile) */}
            {divisionMega && (
              <section className="px-4 pt-3 border-t border-black/[0.08] flex items-start gap-3">
                <div className="w-[82px] shrink-0 pt-2.5">
                  <h3 className="text-[15px] font-medium text-black leading-snug">
                    {tr('Détails', 'Details')}
                  </h3>
                </div>
                <div className="flex-1 min-w-0 space-y-4">
                  {divisionMega.columns.map((col) => (
                    <div key={col.heading} className="space-y-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/45 pt-2 pb-1">
                        {col.heading}
                      </p>
                      <div className="divide-y divide-black/[0.05]">
                        {col.links.map((link) => (
                          <button
                            key={`${col.heading}-${link.label}`}
                            type="button"
                            onClick={() => onNavigate(link.href)}
                            className="w-full min-h-[42px] flex items-center justify-between gap-2 py-2 text-left text-[14px] font-normal text-black/85 hover:text-black active:opacity-55 cursor-pointer"
                          >
                            <span>{link.label}</span>
                            <ChevronRight
                              className="w-[16px] h-[16px] text-black/35 shrink-0"
                              strokeWidth={1.6}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 3: Maisons / Brands Directory */}
            <section className="px-4 pt-3 border-t border-black/[0.08] flex items-start gap-3">
              <div className="w-[82px] shrink-0 pt-2.5">
                <h3 className="text-[15px] font-medium text-black leading-snug">
                  {tr('Maisons', 'Brands')}
                </h3>
              </div>
              <div className="flex-1 min-w-0 divide-y divide-black/[0.05]">
                {brands.map((brand) => (
                  <button
                    key={brand.slug}
                    type="button"
                    onClick={() => onNavigate(`/brand/${brand.slug}`)}
                    className="w-full min-h-[44px] flex items-center justify-between gap-2 py-2.5 text-left text-[14.5px] font-normal text-black active:opacity-55 cursor-pointer"
                  >
                    <span>{brand.name}</span>
                    <ChevronRight
                      className="w-[16px] h-[16px] text-black/35 shrink-0"
                      strokeWidth={1.6}
                    />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setDrillMenuKey('brands')}
                  className="w-full min-h-[44px] flex items-center justify-between gap-2 py-2.5 text-left text-[14px] font-medium text-black active:opacity-55 cursor-pointer"
                >
                  <span>{tr('Toutes les marques', 'Explore All Brands')}</span>
                  <ChevronRight
                    className="w-[16px] h-[16px] text-black/45 shrink-0"
                    strokeWidth={1.7}
                  />
                </button>
              </div>
            </section>

            {/* Section 4: Collections & All Categories */}
            <section className="px-4 pt-3 border-t border-black/[0.08] flex items-start gap-3">
              <div className="w-[82px] shrink-0 pt-2.5">
                <h3 className="text-[15px] font-medium text-black leading-snug">
                  {tr('Éditions', 'Edits')}
                </h3>
              </div>
              <div className="flex-1 min-w-0 divide-y divide-black/[0.05]">
                {collections.map((col) => (
                  <button
                    key={col.slug}
                    type="button"
                    onClick={() => onNavigate(`/collection/${col.slug}`)}
                    className="w-full min-h-[44px] flex items-center justify-between gap-2 py-2.5 text-left text-[14.5px] font-normal text-black active:opacity-55 cursor-pointer"
                  >
                    <span>{col.title}</span>
                    <ChevronRight
                      className="w-[16px] h-[16px] text-black/35 shrink-0"
                      strokeWidth={1.6}
                    />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setDrillMenuKey('categories')}
                  className="w-full min-h-[44px] flex items-center justify-between gap-2 py-2.5 text-left text-[14px] font-medium text-black active:opacity-55 cursor-pointer"
                >
                  <span>{tr('Toutes les catégories', 'All Categories')}</span>
                  <ChevronRight
                    className="w-[16px] h-[16px] text-black/45 shrink-0"
                    strokeWidth={1.7}
                  />
                </button>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
