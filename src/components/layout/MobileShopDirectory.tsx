import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
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
import {
  extractDynamicSubMenus,
  FASHION_SUB_TAXONOMY,
  DynamicSubMenu,
} from '../../lib/menuDiscovery';

interface DirectoryTile {
  id: string;
  label: string;
  href: string;
  megaMenuKey?: MegaMenuKey;
  isHighlight?: boolean;
}

interface DivisionHeroMeta {
  eyebrow: string;
  title: string;
  ctaLabel: string;
  href: string;
  imageUrl: string;
  slot: string;
  quickShortcuts: { label: string; href: string }[];
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
        searchHint: tr('Rechercher dans Femme...', 'Search Women...'),
      },
      {
        key: 'curve',
        label: 'Curve',
        searchHint: tr('Rechercher dans Curve...', 'Search Curve...'),
      },
      {
        key: 'men',
        label: tr('Homme', 'Men'),
        searchHint: tr('Rechercher dans Homme...', 'Search Men...'),
      },
      {
        key: 'sport',
        label: 'Sport',
        searchHint: tr('Rechercher dans Sport...', 'Search Sport...'),
      },
      {
        key: 'kids',
        label: tr('Enfants', 'Kids'),
        searchHint: tr('Rechercher dans Enfants...', 'Search Kids...'),
      },
    ],
    [tr]
  );

  const activeDivisionMeta =
    divisions.find((d) => d.key === selectedDivision) || divisions[0];

  // Single architectural hero showcase per division (distinctly KIKI JONES, zero raw thumbnail clutter)
  const divisionHero: DivisionHeroMeta = useMemo(() => {
    switch (selectedDivision) {
      case 'curve':
        return {
          eyebrow: tr('Édition Curve', 'Curve Edit'),
          title: 'KIKI CURVE',
          ctaLabel: tr('Explorer la sélection', 'Explore Edit'),
          href: '/brand/kiki-curve',
          imageUrl: KJ_IMAGES.curveMiniCampaign,
          slot: 'brand:kiki-curve',
          quickShortcuts: [
            { label: tr('Tout Curve', 'All Curve'), href: '/brand/kiki-curve' },
            { label: tr('Soirée & Gala', 'Formal'), href: '/collection/formal' },
            { label: tr('Ensembles', 'Sets'), href: '/category/matching-sets' },
            { label: 'Kiki Sculpt', href: '/brand/kiki-sculpt' },
            { label: tr('Soldes', 'Sale'), href: '/sale' },
          ],
        };
      case 'men':
        return {
          eyebrow: tr('Univers Homme', 'Menswear'),
          title: 'KIKI MEN',
          ctaLabel: tr('Explorer la sélection', 'Explore Edit'),
          href: '/men',
          imageUrl: KJ_IMAGES.menEditorial,
          slot: 'audience:men',
          quickShortcuts: [
            { label: tr('Nouveautés', 'New In'), href: '/men/new-in' },
            { label: tr('Meilleures ventes', 'Best Sellers'), href: '/men/best-sellers' },
            { label: tr('Chemises', 'Shirts'), href: '/men/shirts' },
            { label: 'Street Heat', href: '/collection/street-collection' },
            { label: tr('Soldes', 'Sale'), href: '/sale' },
          ],
        };
      case 'sport':
        return {
          eyebrow: tr('Studio & Performance', 'Studio & Performance'),
          title: 'KIKI SPORT',
          ctaLabel: tr('Explorer la sélection', 'Explore Edit'),
          href: '/brand/kiki-sport',
          imageUrl: KJ_IMAGES.sportFeature,
          slot: 'brand:kiki-sport',
          quickShortcuts: [
            { label: tr('Tout Sport', 'All Sport'), href: '/brand/kiki-sport' },
            { label: tr('Sport Homme', 'Men Sport'), href: '/men/activewear' },
            { label: tr('Cyclistes', 'Biker Shorts'), href: '/category/activewear' },
            { label: 'Kiki Sculpt', href: '/brand/kiki-sculpt' },
            { label: tr('Soldes', 'Sale'), href: '/sale' },
          ],
        };
      case 'kids':
        return {
          eyebrow: tr('Filles & Garçons', 'Girls & Boys'),
          title: 'KIKI KIDS',
          ctaLabel: tr('Explorer la sélection', 'Explore Edit'),
          href: '/brand/kiki-kids',
          imageUrl: KJ_IMAGES.girlsEditorial,
          slot: 'brand:kiki-kids',
          quickShortcuts: [
            { label: tr('Filles', 'Girls'), href: '/girls' },
            { label: tr('Garçons', 'Boys'), href: '/boys' },
            { label: tr('Ensembles', 'Matching Sets'), href: '/brand/kiki-kids' },
            { label: tr('Soldes', 'Sale'), href: '/sale' },
          ],
        };
      case 'women':
      default:
        return {
          eyebrow: tr('Silhouettes Femme', 'Womenswear'),
          title: tr('NOUVELLE SAISON', 'NEW SEASON'),
          ctaLabel: tr('Découvrir Femme', 'Explore Women'),
          href: '/women',
          imageUrl: KJ_IMAGES.heroCampaign,
          slot: 'audience:women',
          quickShortcuts: [
            { label: tr('Nouveautés', 'New In'), href: '/new-in' },
            { label: 'After Dark', href: '/collection/after-dark' },
            { label: tr('Soleil & Resort', 'Resort'), href: '/collection/summer-drop' },
            { label: 'Kiki Luxe', href: '/brand/kiki-luxe' },
            { label: tr('Soldes', 'Sale'), href: '/sale' },
          ],
        };
    }
  }, [selectedDivision, tr]);

  const resolvedHeroImage = getSectionImage(
    storefrontConfig,
    divisionHero.slot,
    divisionHero.imageUrl
  );

  // Dynamic admin-approved sub-menus from inventory detector
  const allDynamicSubMenus = useMemo(
    () => extractDynamicSubMenus(storefrontConfig),
    [storefrontConfig]
  );

  const divisionDynamicMenus: DynamicSubMenu[] = useMemo(() => {
    return allDynamicSubMenus.filter((menu) => {
      if (menu.parentMegaMenuKey === selectedDivision) return true;
      const rule = FASHION_SUB_TAXONOMY.find((r) => r.slug === menu.slug);
      if (rule) return rule.divisions.includes(selectedDivision);
      return selectedDivision === 'women';
    });
  }, [allDynamicSubMenus, selectedDivision]);

  // Preserve 100% of existing division categories & mega-menu entry points
  const categoryTiles: DirectoryTile[] = useMemo(() => {
    const subItems = getFloatingSubnav(selectedDivision, lang);
    const tiles: DirectoryTile[] = [];

    const divisionAllHref: Record<DivisionKey, string> = {
      women: '/women',
      curve: '/brand/kiki-curve',
      men: '/men',
      sport: '/brand/kiki-sport',
      kids: '/brand/kiki-kids',
    };

    const divisionAllLabel: Record<DivisionKey, string> = {
      women: tr('Tout · Femme', 'All Women'),
      curve: tr('Tout · Curve', 'All Curve'),
      men: tr('Tout · Homme', 'All Men'),
      sport: tr('Tout · Sport', 'All Sport'),
      kids: tr('Tout · Enfants', 'All Kids'),
    };

    tiles.push({
      id: `all-${selectedDivision}`,
      label: divisionAllLabel[selectedDivision],
      href: divisionAllHref[selectedDivision],
      megaMenuKey: selectedDivision,
    });

    const seen = new Set<string>([divisionAllLabel[selectedDivision].toLowerCase()]);

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
      if (seen.has(lower)) continue;
      seen.add(lower);

      tiles.push({
        id: `${selectedDivision}-${item.label}`,
        label: item.label,
        href: item.href,
        megaMenuKey: item.megaMenuKey,
        isHighlight: Boolean(item.highlight),
      });
    }

    return tiles;
  }, [selectedDivision, lang, tr]);

  const divisionMega = useMemo(
    () => getMegaMenuLocalized(selectedDivision, lang),
    [selectedDivision, lang]
  );

  const brands = useMemo(() => getLocalizedBrands(lang), [lang]);
  const collections = useMemo(() => getLocalizedCollections(lang), [lang]);

  // Level-2 Drill-Down (exact Desktop MegaMenu parity + dynamic sub-menus for that parent key)
  const drillConfig = useMemo(
    () => getMegaMenuLocalized(drillMenuKey, lang),
    [drillMenuKey, lang]
  );

  const drillDynamicMenus = useMemo(() => {
    if (!drillConfig) return [];
    return allDynamicSubMenus.filter((m) => {
      if (m.parentMegaMenuKey === drillConfig.key) return true;
      if (
        ['women', 'curve', 'men', 'sport', 'kids'].includes(drillConfig.key)
      ) {
        const rule = FASHION_SUB_TAXONOMY.find((r) => r.slug === m.slug);
        return rule ? rule.divisions.includes(drillConfig.key as DivisionKey) : false;
      }
      return false;
    });
  }, [drillConfig, allDynamicSubMenus]);

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
      {/* Sticky Architectural Division Switcher + Minimal Scoped Search */}
      <div className="sticky top-0 z-10 bg-white/88 backdrop-blur-xl border-b border-black/[0.08] px-4 pt-3 pb-3 space-y-2.5">
        <div
          role="tablist"
          aria-label={tr('Univers KIKI JONES', 'KIKI JONES Divisions')}
          className="flex items-center gap-1 p-1 rounded-full bg-[#F2F2F2] overflow-x-auto no-scrollbar"
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
                className={`relative flex-1 min-w-[60px] min-h-[34px] px-2.5 rounded-full text-[10.5px] uppercase tracking-[0.11em] whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'text-white font-bold'
                    : 'text-black/60 font-medium hover:text-black'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="kiki-editorial-division-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-black"
                  />
                )}
                <span className="relative z-10">{div.label}</span>
              </button>
            );
          })}
        </div>

        {showSearchBar && (
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2.5 rounded-xl border border-black/[0.1] bg-[#F7F7F7]/90 px-3.5 min-h-[40px] focus-within:border-black focus-within:bg-white transition-colors"
          >
            <Search className="w-4 h-4 text-black/45 shrink-0" strokeWidth={1.7} />
            <input
              type="text"
              value={queryValue}
              onChange={(e) => setQueryValue(e.target.value)}
              placeholder={activeDivisionMeta.searchHint}
              aria-label={activeDivisionMeta.searchHint}
              className="flex-1 bg-transparent text-[13px] font-normal text-black placeholder:text-black/45 focus:outline-none py-1"
            />
            {queryValue && (
              <button
                type="button"
                onClick={() => setQueryValue('')}
                aria-label={tr('Effacer', 'Clear search')}
                className="p-1 text-black/50 hover:text-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        )}
      </div>

      {/* Level 1 (Editorial KIKI JONES Index) vs Level 2 (Full Desktop-Parity Drill-Down) */}
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
                className="inline-flex items-center gap-1.5 min-h-[38px] pr-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black hover:opacity-65 transition-opacity cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                <span>{activeDivisionMeta.label}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate(drillConfig.href)}
                className="inline-flex items-center gap-1 min-h-[38px] text-[10.5px] font-bold uppercase tracking-[0.14em] text-black underline underline-offset-4 cursor-pointer"
              >
                <span>{tr('Tout voir', 'Shop All')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Editorial Spotlight Banner */}
            <button
              type="button"
              onClick={() => onNavigate(drillConfig.editorial.href)}
              className="group relative w-full h-[142px] overflow-hidden bg-[#F5F5F5] text-left cursor-pointer block"
            >
              <img
                src={drillEditorialImage}
                alt={drillConfig.editorial.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/75">
                  {drillConfig.editorial.eyebrow}
                </p>
                <p className="font-editorial text-xl leading-tight mt-0.5">
                  {drillConfig.editorial.title}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-1 text-[10px] font-bold uppercase tracking-[0.16em]">
                  {drillConfig.editorial.ctaLabel}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>

            {/* Dynamic Inventory-Discovered Styles for this parent menu */}
            {drillDynamicMenus.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                  {tr('Coupes & Styles détectés', 'Cuts & Styles')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {drillDynamicMenus.map((dm) => (
                    <button
                      key={dm.id}
                      type="button"
                      onClick={() => onNavigate(dm.href)}
                      className="min-h-[42px] px-3 py-2 border border-black/15 bg-[#FAFAFA] hover:border-black flex items-center justify-between gap-2 text-left text-[12.5px] font-medium text-black cursor-pointer transition-colors"
                    >
                      <span className="truncate">{lang === 'fr' ? dm.labelFr : dm.labelEn}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-black/45 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All Columns from Desktop MegaMenu */}
            <div className="space-y-5">
              {drillConfig.columns.map((column) => (
                <div key={column.heading} className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 pb-1.5 border-b border-black/[0.08]">
                    {column.heading}
                  </p>
                  <div className="divide-y divide-black/[0.05]">
                    {column.links.map((link) => (
                      <button
                        key={`${column.heading}-${link.label}`}
                        type="button"
                        onClick={() => onNavigate(link.href)}
                        className="w-full min-h-[42px] flex items-center justify-between py-2 text-left text-[14px] font-normal text-black/90 hover:text-black active:opacity-60 transition-opacity cursor-pointer"
                      >
                        <span>{link.label}</span>
                        <ChevronRight className="w-4 h-4 text-black/30 shrink-0" strokeWidth={1.6} />
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="px-4 py-4 space-y-7"
          >
            {/* Architectural 16:9 Division Hero + Monochrome Quick-Access Strip */}
            <section className="space-y-3">
              <button
                type="button"
                onClick={() => onNavigate(divisionHero.href)}
                className="group relative w-full aspect-[16/9] overflow-hidden bg-[#F5F5F5] text-left block cursor-pointer"
              >
                <img
                  src={resolvedHeroImage}
                  alt={divisionHero.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 px-3.5 py-2.5 bg-white/15 backdrop-blur-xl border border-white/25 flex items-center justify-between gap-3 text-white">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/80">
                      {divisionHero.eyebrow}
                    </p>
                    <p className="font-editorial text-lg leading-tight truncate">
                      {divisionHero.title}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] shrink-0">
                    <span>{tr('Voir', 'Shop')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {divisionHero.quickShortcuts.map((shortcut) => (
                  <button
                    key={`${selectedDivision}-${shortcut.label}`}
                    type="button"
                    onClick={() => onNavigate(shortcut.href)}
                    className="shrink-0 min-h-[34px] px-3 border border-black/15 bg-white hover:border-black hover:bg-black hover:text-white text-[10.5px] font-semibold uppercase tracking-[0.12em] text-black transition-colors cursor-pointer"
                  >
                    {shortcut.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Chapter 01: Architectural 2-Column Category Grid (100% of existing menus preserved) */}
            <section className="space-y-3">
              <div className="flex items-baseline justify-between border-b border-black/10 pb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold tabular-nums tracking-[0.16em] text-black/40">
                    01
                  </span>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                    {tr('Catégories', 'Categories')}
                  </h3>
                </div>
                <span className="text-[10px] uppercase tracking-[0.14em] text-black/40 tabular-nums">
                  {categoryTiles.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {categoryTiles.map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => {
                      if (tile.megaMenuKey) {
                        setDrillMenuKey(tile.megaMenuKey);
                      } else {
                        onNavigate(tile.href);
                      }
                    }}
                    className={`group min-h-[50px] px-3 py-2.5 border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      tile.isHighlight
                        ? 'border-black bg-black text-white hover:bg-black/85'
                        : 'border-black/[0.1] bg-white text-black hover:border-black hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <span className="text-[12.5px] font-medium leading-snug line-clamp-2">
                      {tile.label}
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                        tile.isHighlight ? 'text-white/75' : 'text-black/35'
                      }`}
                      strokeWidth={1.8}
                    />
                  </button>
                ))}
              </div>
            </section>

            {/* Chapter 02: Dynamic Inventory-Detected Cuts & Styles (live from Admin approvals) */}
            {divisionDynamicMenus.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-black/10 pb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold tabular-nums tracking-[0.16em] text-black/40">
                      02
                    </span>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                      {tr('Coupes & Styles', 'Cuts & Styles')}
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-black/40 tabular-nums">
                    {divisionDynamicMenus.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {divisionDynamicMenus.map((dm) => (
                    <button
                      key={dm.id}
                      type="button"
                      onClick={() => onNavigate(dm.href)}
                      className="min-h-[44px] px-3 py-2 border border-black/[0.1] bg-[#FAFAFA] hover:border-black flex items-center justify-between gap-2 text-left text-[12.5px] font-medium text-black transition-colors cursor-pointer"
                    >
                      <span className="truncate">{lang === 'fr' ? dm.labelFr : dm.labelEn}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-black/40 shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Chapter 03: Full Division Desktop Mega-Menu Index (Zero missing sub-links) */}
            {divisionMega && (
              <section className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-black/10 pb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold tabular-nums tracking-[0.16em] text-black/40">
                      {divisionDynamicMenus.length > 0 ? '03' : '02'}
                    </span>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                      {tr('Index détaillé', 'Detailed Index')}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrillMenuKey('categories')}
                    className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/60 hover:text-black underline underline-offset-4 cursor-pointer"
                  >
                    {tr('Toutes catégories', 'All Categories')}
                  </button>
                </div>

                <div className="space-y-4">
                  {divisionMega.columns.map((col) => (
                    <div
                      key={col.heading}
                      className="border border-black/[0.08] bg-[#FAFAFA]/70 p-3.5 space-y-2.5"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">
                        {col.heading}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {col.links.map((link) => (
                          <button
                            key={`${col.heading}-${link.label}`}
                            type="button"
                            onClick={() => onNavigate(link.href)}
                            className="px-2.5 py-1.5 bg-white border border-black/[0.1] hover:border-black text-[12px] font-normal text-black transition-colors cursor-pointer"
                          >
                            {link.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Chapter 04: Editorial Collections Lookbook Strip */}
            <section className="space-y-3">
              <div className="flex items-baseline justify-between border-b border-black/10 pb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold tabular-nums tracking-[0.16em] text-black/40">
                    {divisionDynamicMenus.length > 0 ? '04' : '03'}
                  </span>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                    {tr('Collections', 'Collections')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/collections')}
                  className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/60 hover:text-black underline underline-offset-4 cursor-pointer"
                >
                  {tr('Tout voir', 'View All')}
                </button>
              </div>

              <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4">
                {collections.map((col) => {
                  const colImg = getSectionImage(
                    storefrontConfig,
                    `collection:${col.slug}`,
                    col.campaignImage
                  );
                  return (
                    <button
                      key={col.slug}
                      type="button"
                      onClick={() => onNavigate(`/collection/${col.slug}`)}
                      className="w-[148px] shrink-0 snap-start text-left group cursor-pointer"
                    >
                      <div className="relative aspect-[4/5] w-full bg-[#F5F5F5] overflow-hidden">
                        <img
                          src={colImg}
                          alt={col.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute inset-x-2.5 bottom-2.5 text-white">
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/75 truncate">
                            {col.seasonTag}
                          </p>
                          <p className="text-[12.5px] font-semibold leading-tight truncate">
                            {col.title}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Chapter 05: Maisons KIKI JONES Architectural 2-Col Grid */}
            <section className="space-y-3 pb-2">
              <div className="flex items-baseline justify-between border-b border-black/10 pb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold tabular-nums tracking-[0.16em] text-black/40">
                    {divisionDynamicMenus.length > 0 ? '05' : '04'}
                  </span>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                    {tr('Maisons KIKI JONES', 'KIKI JONES Houses')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDrillMenuKey('brands')}
                  className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/60 hover:text-black underline underline-offset-4 cursor-pointer"
                >
                  {tr('Explorer', 'Explore')}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand.slug}
                    type="button"
                    onClick={() => onNavigate(`/brand/${brand.slug}`)}
                    className="px-3 py-3 border border-black/[0.1] bg-white hover:border-black text-left space-y-0.5 transition-colors cursor-pointer"
                  >
                    <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-black truncate">
                      {brand.name}
                    </p>
                    <p className="text-[10.5px] font-light text-black/50 truncate">
                      {brand.tagline}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
