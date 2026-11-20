import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Minus, Heart, Ruler, ChevronDown, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatXOF, getAvailableStock, getColorHex } from '../lib/format';
import { ProductCard } from '../components/storefront/ProductCard';
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
  } = useStore();

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
  const [openAccordion, setOpenAccordion] = useState<'details' | 'shipping' | null>('details');

  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      { rootMargin: '-35% 0px -45% 0px', threshold: 0.1 }
    );
    imageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [product?.id, product?.images]);

  const scrollToImage = (idx: number) => {
    setActiveImageIdx(idx);
    const el = imageRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (mobileGalleryRef.current) {
      const width = mobileGalleryRef.current.clientWidth;
      mobileGalleryRef.current.scrollTo({ left: width * idx, behavior: 'smooth' });
    }
  };

  if (!product) {
    return (
      <main className="pt-32 pb-24 max-w-[1440px] mx-auto px-4 md:px-8 min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4 bg-white">
        <h1 className="font-editorial text-3xl text-black">Piece Not Found</h1>
        <p className="text-sm font-light text-black/65">
          This piece may have been unpublished or moved.
        </p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
        >
          Return to Shop
        </button>
      </main>
    );
  }

  const images = product.images || [];
  const wishlisted = isWishlisted(product.id);

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

  return (
    <main className="pt-[88px] lg:pt-[96px] pb-10 max-w-[1440px] mx-auto px-2.5 sm:px-4 lg:px-6 bg-white text-black">
      {/* Mobile Full-Width Swipeable Image Gallery (< lg) */}
      <div className="lg:hidden -mx-2.5 sm:-mx-4 mb-4">
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
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-3">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToImage(i)}
                aria-label={`View image ${i + 1}`}
                className={`h-1 transition-all cursor-pointer ${
                  activeImageIdx === i ? 'w-6 bg-black' : 'w-2 bg-black/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop 3-Column Editorial Layout + Mobile Stacked Info */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)_minmax(280px,350px)] xl:grid-cols-[minmax(310px,390px)_minmax(0,1fr)_minmax(300px,370px)] gap-4 xl:gap-6 items-start">
        {/* LEFT COLUMN — Thumbnails (desktop), Breadcrumb, Title, Price, Description & Accordions */}
        <div className="lg:sticky lg:top-16 lg:min-h-[calc(100vh-4rem)] lg:flex lg:flex-col lg:justify-center py-2 lg:py-4 order-1">
          <div className="flex flex-col lg:flex-row gap-4 xl:gap-5 lg:items-start w-full">
            {images.length > 0 && (
              <div className="hidden lg:flex flex-col gap-2 w-16 shrink-0">
                {images.map((img, i) => {
                  const bgInfo = imageBgMap[img];
                  const isCutout = bgInfo ? bgInfo.hasTransparentOrWhiteBg : false;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollToImage(i)}
                      aria-label={`View photo ${i + 1}`}
                      className={`w-full aspect-[4/5] shrink-0 bg-[#F5F5F5] overflow-hidden transition-all cursor-pointer ${
                        activeImageIdx === i
                          ? 'ring-1 ring-black opacity-100'
                          : 'opacity-50 hover:opacity-100'
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
            )}

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

                <div className="flex items-baseline gap-3 pt-0.5 tabular-nums">
                  <span className="text-lg xl:text-xl font-bold text-black">
                    {formatXOF(unitPrice)}
                  </span>
                  {compareAt && compareAt > unitPrice && (
                    <span className="text-sm font-light text-black/45 line-through">
                      {formatXOF(compareAt)}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs xl:text-sm font-light text-black/75 leading-relaxed">
                {product.description}
              </p>

              {/* Editorial Accordions: Details & Shipping */}
              <div className="border-t border-black/10 divide-y divide-black/10 pt-1">
                <div>
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
                    className="w-full py-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-black cursor-pointer"
                  >
                    <span>Composition &amp; Care</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        openAccordion === 'details' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'details' && (
                    <div className="pb-3.5 text-xs font-light text-black/70 space-y-1.5 leading-relaxed">
                      <p>
                        {product.materialDetails ||
                          'Refined contemporary fabrication selected for breathability, drape, and lasting shape.'}
                      </p>
                      <p>Machine wash cold on gentle cycle. Lay flat or hang to dry.</p>
                      {activeVariant && (
                        <p className="text-[11px] text-black/45">SKU: {activeVariant.sku}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                    className="w-full py-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-black cursor-pointer"
                  >
                    <span>Shipping &amp; Returns</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        openAccordion === 'shipping' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'shipping' && (
                    <div className="pb-3.5 text-xs font-light text-black/70 space-y-1.5 leading-relaxed">
                      <p>Complimentary standard delivery on orders above 75,000 XOF.</p>
                      <p>Express same-day and next-day delivery available at checkout.</p>
                      <p>Easy 14-day returns and size exchanges on unworn pieces.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN — Desktop Stacked Editorial Visuals */}
        <div className="hidden lg:flex lg:min-h-[calc(100vh-4rem)] flex-col justify-center gap-3 py-8 order-2">
          {images.length > 0 ? (
            images.map((img, i) => {
              const bgInfo = imageBgMap[img];
              const isCutout = bgInfo ? bgInfo.hasTransparentOrWhiteBg : false;
              return (
                <div
                  key={i}
                  ref={(el) => {
                    imageRefs.current[i] = el;
                  }}
                  data-img-index={i}
                  className="w-full bg-[#F5F5F5] overflow-hidden flex items-center justify-center"
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    referrerPolicy="no-referrer"
                    className={
                      isCutout
                        ? 'w-full max-h-[78vh] object-contain p-8 bg-[#F7F7F7] block'
                        : 'w-full h-auto block'
                    }
                  />
                </div>
              );
            })
          ) : (
            <div className="w-full py-32 bg-[#F5F5F5] flex items-center justify-center text-sm font-bold tracking-[0.22em] uppercase">
              KIKI JONES
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Color Swatches, Sizes, Size Guide, Qty, Add to Bag & Wishlist */}
        <div className="lg:sticky lg:top-16 lg:min-h-[calc(100vh-4rem)] lg:flex lg:flex-col lg:justify-center py-2 lg:py-8 order-2 lg:order-3">
          <div className="space-y-6 w-full">
            {/* Color Selection */}
            {displaySwatches.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold uppercase tracking-[0.16em] text-black/55">
                    Color
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
                        className={`w-7 h-7 rounded-full border border-black/20 transition-all cursor-pointer ${
                          selected
                            ? 'ring-2 ring-black ring-offset-2 ring-offset-white scale-105'
                            : 'opacity-80 hover:opacity-100'
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
                  Size
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 font-bold uppercase tracking-[0.12em] text-black hover:opacity-65 underline underline-offset-4 cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
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
                      className={`py-2.5 text-xs font-bold transition-colors ${
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
              <div className="flex items-stretch gap-2">
                <div className="flex items-center border border-black/15 px-1">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-10 h-11 flex items-center justify-center hover:opacity-65 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold tabular-nums">{qty}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQty((q) =>
                        product.isPreorder ? q + 1 : Math.min(Math.max(1, available), q + 1)
                      )
                    }
                    aria-label="Increase quantity"
                    className="w-10 h-11 flex items-center justify-center hover:opacity-65 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!canPurchase}
                  onClick={handleAdd}
                  className="flex-1 py-3.5 px-6 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-black/85 transition-colors disabled:bg-black/20 disabled:text-black/45 cursor-pointer disabled:cursor-not-allowed"
                >
                  {canPurchase ? 'Add to Bag' : 'Sold Out'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="w-full py-3 px-6 border border-black/20 bg-white text-black text-xs font-bold uppercase tracking-[0.18em] hover:border-black transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart
                  className="w-3.5 h-3.5"
                  strokeWidth={1.7}
                  fill={wishlisted ? '#000000' : 'none'}
                />
                <span>{wishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Pieces */}
      {related.length > 0 && (
        <section className="mt-8 pt-6 border-t border-black/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45 mb-0.5">
            You May Also Like
          </p>
          <h2 className="font-editorial text-2xl sm:text-3xl text-black mb-4">Complementary Pieces</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-1.5 gap-y-4 sm:gap-x-2 sm:gap-y-5 items-stretch">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} variants={getProductVariants(p.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Interactive Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSizeGuideOpen(false)}
          />
          <div
            role="dialog"
            aria-label="KIKI JONES Size Guide"
            className="relative bg-white text-black w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                  KIKI JONES Fit Guide
                </p>
                <h2 className="font-editorial text-2xl text-black">Size Chart</h2>
              </div>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                aria-label="Close size guide"
                className="p-1.5 text-black/65 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 border-b border-black/10 text-xs">
              {(
                [
                  { id: 'women', label: 'Women' },
                  { id: 'men', label: 'Men' },
                  { id: 'youth', label: 'Girls & Boys' },
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
                    <th className="py-2.5 pr-4">Size</th>
                    <th className="py-2.5 pr-4">Chest</th>
                    <th className="py-2.5 pr-4">Waist</th>
                    <th className="py-2.5">Hips</th>
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
              Measurements represent body dimensions. For relaxed or oversized silhouettes, choose your standard size for the intended drape or size down for a closer fit.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
