import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { DivisionKey, MegaMenuColumn, MegaMenuKey } from '../../lib/navigationData';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { getMegaMenuLocalized } from '../../lib/i18n';
import { getSectionImage } from '../../lib/storefrontMedia';
import { isInfoBarActive } from '../../lib/infoBar';
import {
  extractDynamicSubMenus,
  FASHION_SUB_TAXONOMY,
} from '../../lib/menuDiscovery';

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

interface MegaMenuProps {
  activeKey: MegaMenuKey | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function MegaMenu({
  activeKey,
  onClose,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) {
  const { lang, tr } = useLanguage();
  const { storefrontConfig } = useStore();
  const config = getMegaMenuLocalized(activeKey, lang);

  // Merge admin-approved dynamic sub-menus into the active desktop mega-menu
  const enrichedColumns: MegaMenuColumn[] = useMemo(() => {
    if (!config) return [];
    const dynamicMenus = extractDynamicSubMenus(storefrontConfig);
    if (dynamicMenus.length === 0) return config.columns;

    const existingHrefs = new Set(
      config.columns.flatMap((c) => c.links.map((l) => l.href.toLowerCase()))
    );

    const matchingDynamic = dynamicMenus.filter((dm) => {
      if (existingHrefs.has(dm.href.toLowerCase())) return false;
      if (dm.parentMegaMenuKey === config.key) return true;
      if (config.key === 'categories') return true;
      if (['women', 'curve', 'men', 'sport', 'kids'].includes(config.key)) {
        const rule = FASHION_SUB_TAXONOMY.find((r) => r.slug === dm.slug);
        return rule ? rule.divisions.includes(config.key as DivisionKey) : false;
      }
      return false;
    });

    if (matchingDynamic.length === 0) return config.columns;

    const dynamicLinks = matchingDynamic.slice(0, 8).map((dm) => ({
      label: lang === 'fr' ? dm.labelFr : dm.labelEn,
      href: dm.href,
    }));

    if (config.columns.length < 4) {
      return [
        ...config.columns,
        {
          heading: tr('Coupes & Styles', 'Cuts & Styles'),
          links: dynamicLinks,
        },
      ];
    }

    return config.columns.map((col, idx) =>
      idx === 0 ? { ...col, links: [...col.links, ...dynamicLinks] } : col
    );
  }, [config, storefrontConfig, lang, tr]);

  const editorialImageUrl = config
    ? MEGA_MENU_SLOT_MAP[config.key]
      ? getSectionImage(storefrontConfig, MEGA_MENU_SLOT_MAP[config.key]!, config.editorial.imageUrl)
      : config.editorial.imageUrl
    : '';

  const topOffsetClass = isInfoBarActive(storefrontConfig)
    ? 'top-[116px] lg:top-[124px]'
    : 'top-[88px] lg:top-[96px]';

  return (
    <AnimatePresence>
      {config && (
        <>
          {/* Frosted glass backdrop dim below header */}
          <motion.div
            key="mega-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className={`fixed inset-x-0 ${topOffsetClass} bottom-0 bg-black/25 backdrop-blur-md z-30`}
          />

          {/* Frosted Glassmorphic Editorial Floating Mega Menu Panel */}
          <motion.div
            key={`mega-panel-${config.key}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`fixed inset-x-0 ${topOffsetClass} z-40 bg-white/78 backdrop-blur-2xl backdrop-saturate-[1.85] border-b border-black/10 text-black shadow-[0_32px_64px_-24px_rgba(0,0,0,0.22)] ring-1 ring-inset ring-white/60`}
          >
            <div className="max-w-[1440px] mx-auto px-6 xl:px-10 py-9">
              <div className="grid grid-cols-12 gap-8 items-start">
                {/* Category Columns */}
                <div className="col-span-9 grid grid-cols-4 gap-x-8 gap-y-6">
                  {enrichedColumns.map((column) => (
                    <div key={column.heading} className="space-y-3.5">
                      <h3 className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black pb-2 border-b border-black/10">
                        {column.heading}
                      </h3>
                      <ul
                        className={
                          column.links.length > 9
                            ? 'grid grid-cols-2 gap-x-4 gap-y-2'
                            : 'space-y-2'
                        }
                      >
                        {column.links.map((link) => (
                          <li key={`${column.heading}-${link.label}`}>
                            <button
                              type="button"
                              onClick={() => {
                                onNavigate(link.href);
                                onClose();
                              }}
                              className="text-left text-[12.5px] font-normal text-black/80 hover:text-black hover:underline underline-offset-4 transition-colors cursor-pointer leading-snug"
                            >
                              {link.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Large Editorial Feature Card on Right */}
                <div className="col-span-3">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(config.editorial.href);
                      onClose();
                    }}
                    className="group block w-full text-left cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F5F5]">
                      <img
                        src={editorialImageUrl}
                        alt={config.editorial.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white space-y-1.5">
                        <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/80">
                          {config.editorial.eyebrow}
                        </p>
                        <p className="font-editorial text-2xl leading-tight text-white">
                          {config.editorial.title}
                        </p>
                        <span className="inline-flex items-center gap-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white group-hover:underline underline-offset-4">
                          {config.editorial.ctaLabel}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
