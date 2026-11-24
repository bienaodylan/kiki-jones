import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Plus, Minus, Heart, Ruler, ChevronDown, X, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { formatXOF, getAvailableStock, getColorHex } from '../lib/format';
import { isInfoBarActive } from '../lib/infoBar';
import { ProductCard } from '../components/storefront/ProductCard';
import { useMotionSystem } from '../motion/MotionProvider';
import { getProductTransitionName, KJ_DURATION, KJ_EASE } from '../motion/motionConfig';
import { AnimatedAccordionContent, AnimatedValue } from '../motion/InteractivePrimitives';
import { ScrollReveal } from '../motion/ScrollReveal';
import {
  detectDominantColorsFromImageUrl,
  DetectedColor,
  analyzeProductImageBackground,
  ImageBackgroundAnalysis,
} from '../lib/colorDetector';

const SIZE_GUIDE_DATA = {
  women: [
    { size: 'XS', chest: '78–82 cm', waist: '60–64 cm', hips: '86–90 cm' },
    { size: 'S', chest: '83–87 cm', waist: '65–69 cm', hips: '91–95 cm' },
    { size: 'M', chest: '88–93 cm', waist: '70–75 cm', hips: '96–101 cm' },
    { size: 'L', chest: '94–100 cm', waist: '76–82 cm', hips: '102–108 cm' },
    { size: 'XL', chest: '101–108 cm', waist: '83–90 cm', hips: '109–116 cm' },
  ],
  men: [
    { size: 'S', chest: '90–95 cm', waist: '75–80 cm', hips: '90–95 cm' },
    { size: 'M', chest: '96–101 cm', waist: '81–86 cm', hips: '96–101 cm' },
    { size: 'L', chest: '102–107 cm', waist: '87–92 cm', hips: '102–107 cm' },
    { size: 'XL', chest: '108–114 cm', waist: '93–99 cm', hips: '108–114 cm' },
    { size: 'XXL', chest: '115–121 cm', waist: '100–106 cm', hips: '115–121 cm' },
  ],
  youth: [
    { size: '6-8Y', chest: '62–66 cm', waist: '56–59 cm', hips: '66–71 cm' },
    { size: '8-10Y', chest: '67–72 cm', waist: '60–63 cm', hips: '72–77 cm' },
    { size: '10-12Y', chest: '73–78 cm', waist: '64–67 cm', hips: '78–83 cm' },
    { size: '12-14Y', chest: '79–84 cm', waist: '68–72 cm', hips: '84–89 cm' },
  ],
};

export function ProductDetailPage({ slug }: { slug: string }) {
  const {
    products,
    getProductVariants,
    addToCart,
    navigate,
    isWishlisted,
    toggleWishlist,
    storefrontConfig,
  } = useStore();
  const { tr } = useLanguage();
  const { isAppMode } = useExperienceMode();
  const {
    prefersReducedMotion,
    transitionProductSlug,
    triggerFlyToCart,
    lastWishlistPulse,
  } = useMotionSystem();

  const infoBarActive = isInfoBarActive(storefrontConfig);

  const product = useMemo(
    () => products.find((p) => p.slug === slug) || null,
    [products, slug]
  );

  const variants = useMemo(
    () => (product ? getProductVariants(product.id).filter((v) => v.isActive) : []),
    [product, getProductVariants]
  );

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [detectedDominantColor, setDetectedDominantColor] = useState<DetectedColor | null>(null);
  const [imageBgMap, setImageBgMap] = useState<Record<string, ImageBackgroundAnalysis>>({});
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeGuideTab, setSizeGuideTab] = useState<'women' | 'men' | 'youth'>('women');
  const [openAccordion, setOpenAccordion] = useState<'details' | 'shipping' | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const desktopImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabletImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpenAccordion(null);
    setJustAdded(false);
    if (variants.length > 0) {
      const firstAvail = variants.find((v) => getAvailableStock(v) > 0) || variants[0];
      setSelectedColor(firstAvail.color);
      setSelectedSize(firstAvail.size);
      setQty(1);
      setActiveImageIdx(0);
    }
    if (product?.audience === 'men') setSizeGuideTab('men');
    else if (product?.audience === 'girls' || product?.audience === 'boys') setSizeGuideTab('youth');
    else setSizeGuideTab('women');
  }, [product?.id, product?.audience, variants]);

  useEffect(() => {
    if (!sizeGuideOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSizeGuideOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sizeGuideOpen]);

  useEffect(() => {
    let cancelled = false;
    const targetUrl = product?.images?.[0] || '';
    if (!targetUrl) {
      setDetectedDominantColor(null);
      return;
    }
    detectDominantColorsFromImageUrl(targetUrl, 1).then((found) => {
      if (!cancelled) {
        setDetectedDominantColor(found[0] || null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [product?.id, product?.images]);

  useEffect(() => {
    let cancelled = false;
    const imgs = product?.images || [];
    if (imgs.length === 0) {
      setImageBgMap({});
      return;
    }
    Promise.all(
      imgs.map(async (url) => ({
        url,
        analysis: await analyzeProductImageBackground(url),
      }))
    ).then((results) => {
      if (cancelled) return;
      const next: Record<string, ImageBackgroundAnalysis> = {};
      for (const item of results) {
        next[item.url] = item.analysis;
      }
      setImageBgMap(next);
    });
    return () => {
      cancelled = true;
    };
  }, [product?.id, product?.images]);

  useEffect(() => {
    if (!product?.images || product.images.length <= 1) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idxAttr = entry.target.getAttribute('data-img-index');
            if (idxAttr !== null) {
              setActiveImageIdx(Number(idxAttr));
            }
          }
        }
      },
      { rootMargin: '-25% 0px -35% 0px', threshold: 0.1 }
    );
    desktopImageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    tabletImageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [product?.id, product?.images]);

  const scrollToImage = (idx: number) => {
    setActiveImageIdx(idx);
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    const targetEl = isDesktop ? desktopImageRefs.current[idx] : tabletImageRefs.current[idx];
    if (targetEl && targetEl.offsetParent !== null) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (mobileGalleryRef.current) {
      const width = mobileGalleryRef.current.clientWidth;
      if (width > 0) {
        mobileGalleryRef.current.scrollTo({ left: width * idx, behavior: 'smooth' });
      }
    }
  };

  if (!product) {
    return (
      <main
        className={`${
          isAppMode ? 'pt-12 pb-20' : 'pt-32 pb-24'
        } max-w-[1440px] mx-auto px-4 md:px-8 min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4 bg-white`}
      >
        <h1 className="font-editorial text-3xl text-black">
          {tr('Pièce introuvable', 'Piece Not Found')}
        </h1>
        <p className="text-sm font-light text-black/65">
          {tr(
            'Cette pièce a peut-être été retirée ou déplacée.',
            'This piece may have been unpublished or moved.'
          )}
        </p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
        >
          {tr('Retour à la boutique', 'Return to Shop')}
        </button>
      </main>
    );
  }

  const images = product.images || [];
  const wishlisted = isWishlisted(product.id);
  const isHeartPulsing = lastWishlistPulse?.productId === product.id;

  const variantColors = Array.from(
    new Map(variants.map((v) => [v.color, v.colorHex || getColorHex(v.color)])).entries()
  ).map(([name, hex]) => ({ name, hex }));

  const hasCustomVariantColors =
    variantColors.length > 1 ||
    (variantColors.length === 1 && variantColors[0].name !== 'Edition 01');

  const displaySwatches = hasCustomVariantColors
    ? variantColors
    : detectedDominantColor
      ? [detectedDominantColor]
      : variantColors;

  const sizesForColor = variants.filter((v) => v.color === selectedColor);
  const activeVariant =
    variants.find((v) => v.color === selectedColor && v.size === selectedSize) ||
    sizesForColor[0] ||
    variants[0];

  const available = activeVariant ? getAvailableStock(activeVariant) : 0;

  const unitPrice = activeVariant?.priceXof || product.promoPriceXof || product.regularPriceXof;
  const compareAt =
    activeVariant?.compareAtPriceXof ||
    (product.promoPriceXof && product.promoPriceXof < product.regularPriceXof
      ? product.regularPriceXof
      : null);

  const canPurchase = Boolean(activeVariant && (product.isPreorder || available > 0));

  const activeColorLabel = hasCustomVariantColors
    ? selectedColor
    : detectedDominantColor?.name || selectedColor;

  const activeColorHex =
    displaySwatches.find((c) => c.name === activeColorLabel)?.hex ||
    getColorHex(activeColorLabel);

  const handleAdd = () => {
    if (!activeVariant || !canPurchase) return;
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    const isTablet =
      typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
    const sourceEl = isDesktop
      ? desktopImageRefs.current[activeImageIdx] || desktopImageRefs.current[0]
      : isTablet
        ? tabletImageRefs.current[activeImageIdx] || tabletImageRefs.current[0]
        : mobileGalleryRef.current;

    triggerFlyToCart(images[activeImageIdx] || images[0], sourceEl);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);

    addToCart({
      variantId: activeVariant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: activeVariant.sku,
      color: activeColorLabel || activeVariant.color,
      colorHex: activeColorHex,
      size: activeVariant.size,
      unitPriceXof: unitPrice,
      quantity: qty,
      imageUrl: images[activeImageIdx] || images[0] || '',
      isPreorder: product.isPreorder && available <= 0,
    });
  };

  const related = products
    .filter((p) => p.id !== product.id && (p.audience === product.audience || p.categoryId === product.categoryId))
    .slice(0, 4);

  const audiencePath = product.audience ? `/${product.audience}` : '/shop';

  // Exact sticky geometry for Desktop (>= 1024px) AND iPad (768px–1023px)
  const desktopStickyFrameClass = infoBarActive
    ? 'lg:sticky lg:top-[124px] lg:h-[calc(100vh-124px)]'
    : 'lg:sticky lg:top-[96px] lg:h-[calc(100vh-96px)]';

  const desktopGalleryMinHClass = infoBarActive
    ? 'lg:min-h-[calc(100vh-124px)]'
    : 'lg:min-h-[calc(100vh-96px)]';

  const tabletStickyFrameClass = isAppMode
    ? infoBarActive
      ? 'md:sticky md:top-[calc(80px+env(safe-area-inset-top,0px))] md:h-[calc(100vh-80px-env(safe-area-inset-top,0px))]'
      : 'md:sticky md:top-[calc(52px+env(safe-area-inset-top,0px))] md:h-[calc(100vh-52px-env(safe-area-inset-top,0px))]'
    : infoBarActive
      ? 'md:sticky md:top-[116px] md:h-[calc(100vh-116px)]'
      : 'md:sticky md:top-[88px] md:h-[calc(100vh-88px)]';

  const tabletGalleryMinHClass = isAppMode
    ? infoBarActive
      ? 'md:min-h-[calc(100vh-80px)]'
      : 'md:min-h-[calc(100vh-52px)]'
    : infoBarActive
      ? 'md:min-h-[calc(100vh-116px)]'
      : 'md:min-h-[calc(100vh-88px)]';

  const hasSharedTransition = transitionProductSlug === product.slug;
  const sharedName = hasSharedTransition ? getProductTransitionName(product.slug) : undefined;

  const renderThumbnails = (sizeClass: string) =>
    images.length > 0 && (
      <div
        className={`flex flex-col gap-2 ${sizeClass} shrink-0 max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar py-0.5`}
      >
        {images.map((img, i) => {
          const bgInfo = imageBgMap[img];
          const isCutout = bgInfo ? bgInfo.hasTransparentOrWhiteBg : false;
          return (
            <button
              key={i}
              type="button"
              onClick={() => scrollToImage(i)}
              aria-label={`View photo ${i + 1}`}
              className={`w-full aspect-[4/5] shrink-0 bg-[#F5F5F5] overflow-hidden cursor-pointer ${
                activeImageIdx === i
                  ? 'ring-1 ring-black opacity-100'
                  : 'opacity-45 hover:opacity-95'
              }`}
            >
              <img
                src={img}
                alt={`${product.name} thumbnail ${i + 1}`}
                referrerPolicy="no-referrer"
                className={`w-full h-full block ${
                  isCutout ? 'object-contain p-1 bg-[#F7F7F7]' : 'object-cover object-top'
                }`}
              />
            </button>
          );
        })}
      </div>
    );

  const renderProductInfo = () => (
    <div className="flex-1 min-w-0 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center flex-wrap gap-2 text-[11px] font-light text-black/55">
        <button
          type="button"
          onClick={() => navigate(audiencePath)}
          className="inline-flex items-center gap-1.5 font-bold text-black hover:opacity-65 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{product.categoryName}</span>
        </button>
        <span>/</span>
        <span className="text-black/80">{product.name}</span>
      </div>

      <div className="space-y-2">
        <h1 className="font-editorial text-2xl xl:text-3xl text-black leading-tight">
          {product.name}
        </h1>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-0.5 tabular-nums">
          <AnimatedValue valueKey={unitPrice} className="text-lg xl:text-xl font-bold text-black whitespace-nowrap">
            {formatXOF(unitPrice)}
          </AnimatedValue>
          {compareAt && compareAt > unitPrice && (
            <span className="text-sm font-light text-black/45 line-through whitespace-nowrap">
              {formatXOF(compareAt)}
            </span>
          )}
        </div>
      </div>

      <p className="text-xs xl:text-sm font-light text-black/75 leading-relaxed">
        {product.description}
      </p>

      {/* Editorial Accordions: Details & Shipping (Closed by default) */}
      <div className="border-t border-black/10 divide-y divide-black/10 pt-1">
        <div>
          <button
            type="button"
            onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
            aria-expanded={openAccordion === 'details'}
            className="w-full py-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-black cursor-pointer"
          >
            <span>{tr('Composition & Entretien', 'Composition & Care')}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                openAccordion === 'details' ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatedAccordionContent open={openAccordion === 'details'}>
            <div className="pb-3.5 text-xs font-light text-black/70 space-y-1.5 leading-relaxed">
              <p>
                {product.materialDetails ||
                  tr(
                    'Matière contemporaine sélectionnée pour sa respirabilité, son tombé fluide et sa tenue durable.',
                    'Refined contemporary fabrication selected for breathability, drape, and lasting shape.'
                  )}
              </p>
              <p>
                {tr(
                  'Lavage délicat à froid. Séchage à plat ou sur cintre.',
                  'Machine wash cold on gentle cycle. Lay flat or hang to dry.'
                )}
              </p>
              {activeVariant && (
                <p className="text-[11px] text-black/45">SKU: {activeVariant.sku}</p>
              )}
            </div>
          </AnimatedAccordionContent>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
            aria-expanded={openAccordion === 'shipping'}
            className="w-full py-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-black cursor-pointer"
          >
            <span>{tr('Livraison & Retours', 'Shipping & Returns')}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                openAccordion === 'shipping' ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatedAccordionContent open={openAccordion === 'shipping'}>
            <div className="pb-3.5 text-xs font-light text-black/70 space-y-1.5 leading-relaxed">
              <p>
                {tr(
                  'Livraison standard offerte dès 75 000 FCFA d’achat.',
                  'Complimentary standard delivery on orders above 75,000 XOF.'
                )}
              </p>
              <p>
                {tr(
                  'Livraison express le jour même ou le lendemain disponible au paiement.',
                  'Express same-day and next-day delivery available at checkout.'
                )}
              </p>
              <p>
                {tr(
                  'Retours et échanges de taille faciles sous 14 jours pour les pièces non portées.',
                  'Easy 14-day returns and size exchanges on unworn pieces.'
                )}
              </p>
            </div>
          </AnimatedAccordionContent>
        </div>
      </div>
    </div>
  );

  const renderPurchaseControls = () => (
    <div className="space-y-6 w-full">
      {/* Color Selection */}
      {displaySwatches.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-[0.16em] text-black/55">
              {tr('Couleur', 'Color')}
            </span>
            <span className="font-medium text-black">{activeColorLabel}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {displaySwatches.map((c, cIdx) => {
              const selected = c.name === activeColorLabel;
              return (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => {
                    if (hasCustomVariantColors) {
                      setSelectedColor(c.name);
                      if (displaySwatches.length > 1 && images.length > cIdx) {
                        scrollToImage(cIdx);
                      }
                      const match = variants.find(
                        (v) => v.color === c.name && v.size === selectedSize
                      );
                      if (!match) {
                        const firstForColor = variants.find((v) => v.color === c.name);
                        if (firstForColor) setSelectedSize(firstForColor.size);
                      }
                      setQty(1);
                    }
                  }}
                  className={`w-7 h-7 rounded-full border border-black/20 cursor-pointer ${
                    selected
                      ? 'ring-2 ring-black ring-offset-2 ring-offset-white scale-105'
                      : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selector + Size Guide Trigger */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold uppercase tracking-[0.16em] text-black/55">
            {tr('Taille', 'Size')}
          </span>
          <button
            type="button"
            onClick={() => setSizeGuideOpen(true)}
            className="inline-flex items-center gap-1.5 font-bold uppercase tracking-[0.12em] text-black hover:opacity-65 underline underline-offset-4 cursor-pointer"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>{tr('Guide des tailles', 'Size Guide')}</span>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {sizesForColor.map((v) => {
            const vAvail = getAvailableStock(v);
            const disabled = !product.isPreorder && vAvail <= 0;
            const active = activeVariant?.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSelectedSize(v.size);
                  setQty(1);
                }}
                className={`py-2.5 text-xs font-bold ${
                  disabled
                    ? 'bg-black/[0.04] text-black/30 line-through cursor-not-allowed'
                    : active
                      ? 'bg-black text-white cursor-pointer'
                      : 'bg-[#F5F5F5] text-black hover:bg-black hover:text-white cursor-pointer'
                }`}
              >
                {v.size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity + Add to Bag + Save to Wishlist */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-stretch gap-2 min-w-0">
          <div className="flex items-center border border-black/15 px-0.5 sm:px-1 shrink-0">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label={tr('Diminuer la quantité', 'Decrease quantity')}
              className="w-9 sm:w-10 h-11 flex items-center justify-center hover:opacity-65 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <AnimatedValue
              valueKey={qty}
              className="w-7 sm:w-8 text-center text-sm font-bold tabular-nums"
            >
              {qty}
            </AnimatedValue>
            <button
              type="button"
              onClick={() =>
                setQty((q) =>
                  product.isPreorder ? q + 1 : Math.min(Math.max(1, available), q + 1)
                )
              }
              aria-label={tr('Augmenter la quantité', 'Increase quantity')}
              className="w-9 sm:w-10 h-11 flex items-center justify-center hover:opacity-65 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            disabled={!canPurchase}
            onClick={handleAdd}
            className="flex-1 min-w-0 py-3.5 px-3 sm:px-6 bg-black text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] sm:tracking-[0.2em] hover:bg-black/85 disabled:bg-black/20 disabled:text-black/45 cursor-pointer disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 truncate"
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
                <span className="truncate">{tr('Ajouté au panier', 'Added to Bag')}</span>
              </>
            ) : (
              <span className="truncate">
                {canPurchase ? tr('Ajouter au panier', 'Add to Bag') : tr('Épuisé', 'Sold Out')}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id, product.name)}
          className="w-full py-3 px-6 border border-black/20 bg-white text-black text-xs font-bold uppercase tracking-[0.18em] hover:border-black inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <motion.span
            key={isHeartPulsing ? lastWishlistPulse?.ts : 'pdp-heart'}
            initial={false}
            animate={
              isHeartPulsing && !prefersReducedMotion
                ? { scale: [1, 1.32, 0.92, 1] }
                : { scale: 1 }
            }
            transition={{ duration: KJ_DURATION.icon * 1.15, ease: KJ_EASE.snappy }}
            className="inline-flex items-center justify-center"
          >
            <Heart
              className="w-3.5 h-3.5"
              strokeWidth={1.7}
              fill={wishlisted ? '#000000' : 'none'}
            />
          </motion.span>
          <span>
            {wishlisted
              ? tr('Dans vos favoris', 'Saved in Wishlist')
              : tr('Ajouter aux favoris', 'Save to Wishlist')}
          </span>
        </button>
      </div>
    </div>
  );

  const renderStackedImages = (
    refsArray: React.MutableRefObject<(HTMLDivElement | null)[]>,
    attachViewTransition: boolean
  ) =>
    images.length > 0 ? (
      images.map((img, i) => {
        const bgInfo = imageBgMap[img];
        const isCutout = bgInfo ? bgInfo.hasTransparentOrWhiteBg : false;
        const isPrimarySlot = i === 0;
        return (
          <motion.div
            key={i}
            ref={(el) => {
              refsArray.current[i] = el;
            }}
            data-img-index={i}
            initial={
              isPrimarySlot && !prefersReducedMotion
                ? { opacity: 0.78, scale: 0.975 }
                : false
            }
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: KJ_DURATION.productImage, ease: KJ_EASE.editorial }}
            style={
              isPrimarySlot && attachViewTransition && sharedName
                ? ({ viewTransitionName: sharedName } as React.CSSProperties)
                : undefined
            }
            className={`w-full bg-[#F5F5F5] overflow-hidden flex items-center justify-center ${
              isCutout ? 'min-h-[64vh] lg:min-h-[70vh]' : ''
            }`}
          >
            <img
              src={img}
              alt={`${product.name} view ${i + 1}`}
              referrerPolicy="no-referrer"
              className={
                isCutout
                  ? 'w-full max-h-[74vh] lg:max-h-[78vh] object-contain p-6 lg:p-8 bg-[#F7F7F7] block'
                  : 'w-full h-auto block'
              }
            />
          </motion.div>
        );
      })
    ) : (
      <div className="w-full py-32 bg-[#F5F5F5] flex items-center justify-center text-sm font-bold tracking-[0.22em] uppercase">
        KIKI JONES
      </div>
    );

  return (
    <main
      className={`${
        isAppMode ? 'pt-0 pb-28' : 'pt-[88px] lg:pt-[96px] pb-12'
      } w-full max-w-[1440px] mx-auto max-md:overflow-x-clip px-4 sm:px-6 bg-white text-black`}
    >
      {/* 1. MOBILE LAYOUT (< 768px): Swipeable Full-Width Gallery + Stacked Info & Controls */}
      <div className="md:hidden">
        <div className="relative -mx-4 sm:-mx-6 mb-4">
          <div
            ref={mobileGalleryRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              if (el.clientWidth > 0) {
                const idx = Math.round(el.scrollLeft / el.clientWidth);
                if (idx !== activeImageIdx) setActiveImageIdx(idx);
              }
            }}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
          >
            {images.length > 0 ? (
              images.map((img, i) => {
                const bgInfo = imageBgMap[img];
                const isCutout = bgInfo ? bgInfo.hasTransparentOrWhiteBg : false;
                return (
                  <div
                    key={i}
                    style={
                      i === 0 && sharedName
                        ? ({ viewTransitionName: sharedName } as React.CSSProperties)
                        : undefined
                    }
                    className="w-full shrink-0 snap-center aspect-[4/5] bg-[#F5F5F5] flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      referrerPolicy="no-referrer"
                      className={
                        isCutout
                          ? 'w-full h-full object-contain p-6 bg-[#F7F7F7]'
                          : 'w-full h-full object-cover object-top'
                      }
                    />
                  </div>
                );
              })
            ) : (
              <div className="w-full aspect-[4/5] bg-[#F5F5F5] flex items-center justify-center text-sm font-bold tracking-[0.22em] uppercase">
                KIKI JONES
              </div>
            )}
          </div>
          {isAppMode && images.length > 1 && (
            <div className="pointer-events-none absolute top-3 right-3 bg-black/70 text-white px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] tabular-nums">
              {activeImageIdx + 1} / {images.length}
            </div>
          )}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 pt-3">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`h-1 cursor-pointer ${
                    activeImageIdx === i ? 'w-6 bg-black' : 'w-2 bg-black/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 py-2">
          {renderProductInfo()}
          {renderPurchaseControls()}
        </div>
      </div>

      {/* 2. IPAD / TABLET EDITORIAL LAYOUT (768px–1023px): Fixed Info/Purchase Sidebar + Scrolling Images */}
      <div className="hidden md:grid lg:hidden grid-cols-[56px_minmax(0,1fr)_minmax(290px,350px)] gap-5 items-start">
        {/* Sticky Thumbnail Rail */}
        <div className={`${tabletStickyFrameClass} flex flex-col justify-center py-4`}>
          {renderThumbnails('w-14')}
        </div>

        {/* Scrolling Product Images Column (adapts seamlessly to any number of admin images) */}
        <div
          className={`flex ${tabletGalleryMinHClass} flex-col ${
            images.length <= 1 ? 'justify-center' : 'justify-start'
          } gap-4 py-4`}
        >
          {renderStackedImages(tabletImageRefs, true)}
        </div>

        {/* Fixed Sticky Right Column (Product Info + Purchase Controls) — releases after last image */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.08, ease: KJ_EASE.editorial }}
          className={`${tabletStickyFrameClass} flex flex-col justify-center overflow-y-auto no-scrollbar py-4`}
        >
          <div className="space-y-6 w-full my-auto py-2">
            {renderProductInfo()}
            <div className="pt-2 border-t border-black/10">{renderPurchaseControls()}</div>
          </div>
        </motion.div>
      </div>

      {/* 3. DESKTOP & IPAD LANDSCAPE 3-COLUMN EDITORIAL LAYOUT (>= 1024px) */}
      <div className="hidden lg:grid grid-cols-[minmax(280px,360px)_minmax(0,1fr)_minmax(280px,350px)] xl:grid-cols-[minmax(310px,390px)_minmax(0,1fr)_minmax(300px,370px)] gap-4 xl:gap-6 items-start">
        {/* LEFT COLUMN — Fixed while center images scroll, releases after last product image */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.06, ease: KJ_EASE.editorial }}
          className={`${desktopStickyFrameClass} flex flex-col justify-center overflow-y-auto no-scrollbar py-4 order-1`}
        >
          <div className="flex flex-row gap-4 xl:gap-5 items-start w-full">
            {renderThumbnails('w-16')}
            {renderProductInfo()}
          </div>
        </motion.div>

        {/* MIDDLE COLUMN — Stacked Editorial Visuals (scrolls independently between fixed sidebars) */}
        <div
          className={`flex ${desktopGalleryMinHClass} flex-col ${
            images.length <= 1 ? 'justify-center' : 'justify-start'
          } gap-4 py-4 order-2`}
        >
          {renderStackedImages(desktopImageRefs, true)}
        </div>

        {/* RIGHT COLUMN — Fixed while center images scroll, releases after last product image */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.12, ease: KJ_EASE.editorial }}
          className={`${desktopStickyFrameClass} flex flex-col justify-center overflow-y-auto no-scrollbar py-4 order-3`}
        >
          {renderPurchaseControls()}
        </motion.div>
      </div>

      {/* Related Pieces — Appears naturally once product images finish scrolling */}
      {related.length > 0 && (
        <ScrollReveal className="mt-8 pt-6 border-t border-black/10">
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45 mb-0.5">
              {tr('Vous aimerez aussi', 'You May Also Like')}
            </p>
            <h2 className="font-editorial text-2xl sm:text-3xl text-black mb-4">
              {tr('Pièces complémentaires', 'Complementary Pieces')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-1.5 gap-y-4 sm:gap-x-2 sm:gap-y-5 items-stretch">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} variants={getProductVariants(p.id)} />
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Interactive Size Guide Modal */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: KJ_EASE.gentle }}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
              onClick={() => setSizeGuideOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={tr('Guide des tailles KIKI JONES', 'KIKI JONES Size Guide')}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: KJ_DURATION.dropdown, ease: KJ_EASE.editorial }}
              className="relative bg-white text-black w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                    {tr('Guide KIKI JONES', 'KIKI JONES Fit Guide')}
                  </p>
                  <h2 className="font-editorial text-2xl text-black">
                    {tr('Tableau des tailles', 'Size Chart')}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(false)}
                  aria-label={tr('Fermer le guide des tailles', 'Close size guide')}
                  className="p-1.5 text-black/65 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 border-b border-black/10 text-xs">
                {(
                  [
                    { id: 'women', label: tr('Femme', 'Women') },
                    { id: 'men', label: tr('Homme', 'Men') },
                    { id: 'youth', label: tr('Filles & Garçons', 'Girls & Boys') },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSizeGuideTab(tab.id)}
                    className={`pb-2.5 uppercase tracking-[0.14em] cursor-pointer ${
                      sizeGuideTab === tab.id
                        ? 'font-bold text-black border-b-2 border-black -mb-[1px]'
                        : 'font-light text-black/55 hover:text-black'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs tabular-nums">
                  <thead>
                    <tr className="border-b border-black/15 text-[10px] font-bold uppercase tracking-[0.16em] text-black/55">
                      <th className="py-2.5 pr-4">{tr('Taille', 'Size')}</th>
                      <th className="py-2.5 pr-4">{tr('Poitrine', 'Chest')}</th>
                      <th className="py-2.5 pr-4">{tr('Taille', 'Waist')}</th>
                      <th className="py-2.5">{tr('Hanches', 'Hips')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10 font-light">
                    {SIZE_GUIDE_DATA[sizeGuideTab].map((row) => (
                      <tr key={row.size}>
                        <td className="py-3 pr-4 font-bold text-black">{row.size}</td>
                        <td className="py-3 pr-4 text-black/75">{row.chest}</td>
                        <td className="py-3 pr-4 text-black/75">{row.waist}</td>
                        <td className="py-3 text-black/75">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] font-light text-black/55 leading-relaxed">
                {tr(
                  'Les mesures correspondent aux mensurations du corps. Pour une coupe ample, choisissez votre taille habituelle ; pour une coupe plus ajustée, prenez la taille en dessous.',
                  'Measurements represent body dimensions. For relaxed or oversized silhouettes, choose your standard size for the intended drape or size down for a closer fit.'
                )}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App Mode Sticky Bottom Add-to-Bag Bar (mobile phones only, < md) */}
      {isAppMode && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/10 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <div className="min-w-0 shrink-0">
              <p className="text-sm font-bold text-black tabular-nums whitespace-nowrap leading-tight">
                {formatXOF(unitPrice)}
              </p>
              <p className="text-[10.5px] font-light text-black/55 truncate max-w-[120px]">
                {activeColorLabel} &middot; {activeVariant?.size || selectedSize}
              </p>
            </div>
            <button
              type="button"
              disabled={!canPurchase}
              onClick={handleAdd}
              className="flex-1 min-w-0 min-h-[48px] px-4 sm:px-5 bg-black text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] disabled:bg-black/20 disabled:text-black/45 cursor-pointer disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 truncate"
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
                  <span>{tr('Ajouté', 'Added')}</span>
                </>
              ) : (
                <span>
                  {canPurchase ? tr('Ajouter au panier', 'Add to Bag') : tr('Épuisé', 'Sold Out')}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
