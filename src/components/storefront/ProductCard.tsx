import React, { useState, useMemo, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Product, ProductVariant } from '../../types/commerce';
import { formatXOF, getAvailableStock, getColorHex, getProductAvailability } from '../../lib/format';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  detectDominantColorsFromImageUrl,
  DetectedColor,
  analyzeProductImageBackground,
  ImageBackgroundAnalysis,
} from '../../lib/colorDetector';

interface ProductCardProps {
  product: Product;
  variants: ProductVariant[];
}

export function ProductCard({ product, variants }: ProductCardProps) {
  const { navigate, addToCart, isWishlisted, toggleWishlist } = useStore();
  const { tr } = useLanguage();
  const [selectedColor, setSelectedColor] = useState<string>(
    () => product.colors?.[0] || variants[0]?.color || ''
  );
  const [imgError, setImgError] = useState(false);
  const [dominantColor, setDominantColor] = useState<DetectedColor | null>(null);
  const [primaryBg, setPrimaryBg] = useState<ImageBackgroundAnalysis | null>(null);
  const [secondaryBg, setSecondaryBg] = useState<ImageBackgroundAnalysis | null>(null);

  const wishlisted = isWishlisted(product.id);

  const availability = useMemo(
    () => getProductAvailability(product, variants),
    [product, variants]
  );

  const colorSwatches = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of variants) {
      if (!map.has(v.color)) map.set(v.color, v.colorHex || getColorHex(v.color));
    }
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [variants]);

  const hasCustomVariantColors =
    colorSwatches.length > 1 ||
    (colorSwatches.length === 1 && colorSwatches[0].name !== 'Edition 01');

  const variantsForColor = useMemo(
    () => variants.filter((v) => v.isActive && (!selectedColor || v.color === selectedColor)),
    [variants, selectedColor]
  );

  const displayPrice =
    typeof product.promoPriceXof === 'number' &&
    product.promoPriceXof > 0 &&
    product.promoPriceXof < product.regularPriceXof
      ? product.promoPriceXof
      : product.regularPriceXof;

  const handleQuickAdd = (variant: ProductVariant, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: variant.sku,
      color: variant.color,
      colorHex: variant.colorHex || getColorHex(variant.color),
      size: variant.size,
      unitPriceXof: variant.priceXof || displayPrice,
      quantity: 1,
      imageUrl: product.images?.[0] || '',
      isPreorder: product.isPreorder,
    });
  };

  // Show at most 1 clean editorial badge
  const badgeLabel = useMemo(() => {
    if (availability.primaryState === 'SOLD OUT') return tr('ÉPUISÉ', 'SOLD OUT');
    if (availability.primaryState === 'SALE') return tr('SOLDES', 'SALE');
    if (availability.primaryState === 'NEW') return tr('NOUVEAU', 'NEW');
    if (availability.primaryState === 'BEST SELLER') return 'BEST-SELLER';
    if (availability.primaryState === 'PRE-ORDER') return tr('PRÉCOMMANDE', 'PRE-ORDER');
    return null;
  }, [availability.primaryState, tr]);

  const selectedColorIndex = useMemo(() => {
    if (!selectedColor || colorSwatches.length <= 1) return 0;
    const idx = colorSwatches.findIndex((c) => c.name === selectedColor);
    return idx >= 0 ? idx : 0;
  }, [selectedColor, colorSwatches]);

  const primaryImage = useMemo(() => {
    const imgs = product.images || [];
    if (imgs.length === 0) return '';
    if (colorSwatches.length > 1 && imgs.length >= colorSwatches.length) {
      return imgs[selectedColorIndex] || imgs[0];
    }
    return imgs[0];
  }, [product.images, colorSwatches.length, selectedColorIndex]);

  const secondaryImage = useMemo(() => {
    const imgs = product.images || [];
    if (imgs.length <= 1) return '';
    if (colorSwatches.length > 1 && imgs.length >= colorSwatches.length) {
      const next = imgs[(selectedColorIndex + 1) % imgs.length];
      return next && next !== primaryImage ? next : '';
    }
    return imgs[1] && imgs[1] !== primaryImage ? imgs[1] : '';
  }, [product.images, colorSwatches.length, selectedColorIndex, primaryImage]);

  useEffect(() => {
    if (hasCustomVariantColors || !primaryImage) return;
    let cancelled = false;
    detectDominantColorsFromImageUrl(primaryImage, 1).then((cols) => {
      if (!cancelled && cols.length > 0) {
        setDominantColor(cols[0]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [hasCustomVariantColors, primaryImage]);

  useEffect(() => {
    let cancelled = false;
    if (!primaryImage) {
      setPrimaryBg(null);
      return;
    }
    analyzeProductImageBackground(primaryImage).then((res) => {
      if (!cancelled) setPrimaryBg(res);
    });
    return () => {
      cancelled = true;
    };
  }, [primaryImage]);

  useEffect(() => {
    let cancelled = false;
    if (!secondaryImage) {
      setSecondaryBg(null);
      return;
    }
    analyzeProductImageBackground(secondaryImage).then((res) => {
      if (!cancelled) setSecondaryBg(res);
    });
    return () => {
      cancelled = true;
    };
  }, [secondaryImage]);

  const effectiveSwatches = hasCustomVariantColors
    ? colorSwatches
    : dominantColor
      ? [dominantColor]
      : colorSwatches;

  const isPrimaryCutout = primaryBg ? primaryBg.hasTransparentOrWhiteBg : false;
  const isSecondaryCutout = secondaryBg ? secondaryBg.hasTransparentOrWhiteBg : false;

  return (
    <article className="group flex flex-col h-full bg-white">
      {/* Uniform 4:5 Editorial Product Media Frame */}
      <div
        onClick={() => navigate(`/product/${product.slug}`)}
        className="relative w-full aspect-[4/5] bg-[#F5F5F5] rounded-none overflow-hidden cursor-pointer shrink-0"
      >
        {primaryImage && !imgError ? (
          <>
            <img
              src={primaryImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className={`w-full h-full block transition-all duration-500 ease-out ${
                isPrimaryCutout
                  ? 'object-contain p-4 sm:p-5 bg-[#F7F7F7]'
                  : 'object-cover object-top'
              } ${
                secondaryImage
                  ? 'group-hover:opacity-0'
                  : 'group-hover:scale-[1.03]'
              }`}
            />
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} alternate view`}
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full block opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out ${
                  isSecondaryCutout
                    ? 'object-contain p-4 sm:p-5 bg-[#F7F7F7]'
                    : 'object-cover object-top'
                }`}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#F5F5F5] text-black/60 p-4 text-center">
            <span className="font-bold text-sm tracking-[0.22em] uppercase text-black">
              KIKI JONES
            </span>
            <span className="text-[11px] font-light mt-1 text-black/70">{product.name}</span>
          </div>
        )}

        {/* Single Clean Square Corner Badge (Pure Black/White) */}
        {badgeLabel && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            <span
              className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${
                availability.primaryState === 'SOLD OUT'
                  ? 'bg-white/95 text-black/60 border border-black/15'
                  : availability.primaryState === 'NEW'
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-black/15'
              }`}
            >
              {badgeLabel}
            </span>
          </div>
        )}

        {/* Wishlist Toggle Icon Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id, product.name);
          }}
          aria-label={
            wishlisted
              ? tr(`Retirer ${product.name} des favoris`, `Remove ${product.name} from wishlist`)
              : tr(`Ajouter ${product.name} aux favoris`, `Save ${product.name} to wishlist`)
          }
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white/90 hover:bg-white text-black flex items-center justify-center transition-colors cursor-pointer"
        >
          <Heart
            className="w-3.5 h-3.5"
            strokeWidth={1.7}
            fill={wishlisted ? '#000000' : 'none'}
          />
        </button>

        {/* Desktop Quick-Add Size Strip on Hover */}
        {!availability.isSoldOut && variantsForColor.length > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="hidden md:flex absolute inset-x-0 bottom-0 bg-white/95 border-t border-black/10 px-2.5 py-2 items-center justify-between gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-black/55 shrink-0">
              {tr('Ajout rapide', 'Quick Add')}
            </span>
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {variantsForColor.map((v) => {
                const avail = getAvailableStock(v);
                const disabled = !product.isPreorder && avail <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={disabled}
                    onClick={(e) => handleQuickAdd(v, e)}
                    className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                      disabled
                        ? 'bg-black/[0.04] text-black/25 line-through cursor-not-allowed'
                        : 'bg-black/[0.06] text-black hover:bg-black hover:text-white cursor-pointer'
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Product Typography, Price & Swatches */}
      <div className="pt-2 pb-0.5 flex-1 flex flex-col justify-between gap-1">
        <div className="space-y-0.5">
          {product.brandName && (
            <p className="text-[9.5px] font-medium uppercase tracking-[0.14em] text-black/45">
              {product.brandName}
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate(`/product/${product.slug}`)}
            className="text-left text-[11px] font-bold uppercase tracking-[0.05em] text-black leading-snug line-clamp-2 min-h-[2.2em] hover:opacity-65 transition-opacity cursor-pointer"
          >
            {product.name}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 text-[11.5px] tabular-nums">
            <span className="font-medium text-black">{formatXOF(displayPrice)}</span>
            {availability.isOnSale && (
              <span className="text-[10.5px] font-light text-black/45 line-through">
                {formatXOF(product.regularPriceXof)}
              </span>
            )}
          </div>

          {effectiveSwatches.length > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              {effectiveSwatches.slice(0, 4).map((swatch) => {
                const isSelected = hasCustomVariantColors && swatch.name === selectedColor;
                return (
                  <button
                    key={swatch.name}
                    type="button"
                    title={swatch.name}
                    aria-label={`Color ${swatch.name}`}
                    onClick={() => {
                      if (hasCustomVariantColors) setSelectedColor(swatch.name);
                      else navigate(`/product/${product.slug}`);
                    }}
                    className={`w-3 h-3 rounded-full border border-black/20 transition-transform cursor-pointer ${
                      isSelected ? 'ring-1 ring-black ring-offset-1 ring-offset-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
