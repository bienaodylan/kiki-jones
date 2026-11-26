import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Product, ProductVariant } from '../../types/commerce';
import { formatXOF } from '../../lib/format';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { KJ_EASE } from '../../motion/motionConfig';

interface DoupiProductPanelProps {
  product: Product | null;
  variants: ProductVariant[];
  itemIndex: number;
  totalCount: number;
  viewSide: 'front' | 'back';
  onViewSideChange: (side: 'front' | 'back') => void;
  onClose: () => void;
}

const STANDARD_SIZES = ['S', 'M', 'L', 'XL'];

export function DoupiProductPanel({
  product,
  variants,
  itemIndex,
  totalCount,
  viewSide,
  onViewSideChange,
  onClose,
}: DoupiProductPanelProps) {
  const { tr } = useLanguage();
  const { addToCart, navigate } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [addedFeedback, setAddedFeedback] = useState(false);

  const activeVariants = useMemo(
    () => variants.filter((v) => v.isActive),
    [variants]
  );

  // Build clean S / M / L / XL size options backed by real product variants
  const sizeOptions = useMemo(() => {
    if (!product) return [];

    const hasStandard = STANDARD_SIZES.some((sz) =>
      activeVariants.some((v) => v.size.toUpperCase() === sz) ||
      (product.sizes || []).some((s) => s.toUpperCase() === sz)
    );

    const candidateSizes = hasStandard
      ? STANDARD_SIZES
      : (product.sizes && product.sizes.length > 0
          ? product.sizes.slice(0, 4)
          : STANDARD_SIZES);

    return candidateSizes.map((sz) => {
      const matching = activeVariants.filter(
        (v) => v.size.toUpperCase() === sz.toUpperCase()
      );
      const inStockVariant =
        matching.find((v) => v.stockQty - v.reservedQty > 0) || matching[0] || null;
      const available = inStockVariant
        ? inStockVariant.stockQty - inStockVariant.reservedQty > 0 || Boolean(product.isPreorder)
        : activeVariants.length === 0;
      return {
        label: sz,
        variant: inStockVariant,
        available,
      };
    });
  }, [product, activeVariants]);

  // Reset selected size when switching inspected garment
  useEffect(() => {
    if (!product) return;
    setAddedFeedback(false);
    const preferred =
      sizeOptions.find((s) => s.label === 'M' && s.available) ||
      sizeOptions.find((s) => s.available) ||
      sizeOptions[0];
    if (preferred) {
      setSelectedSize(preferred.label);
    }
  }, [product?.id]);

  const effectivePrice = useMemo(() => {
    if (!product) return 0;
    return typeof product.promoPriceXof === 'number' && product.promoPriceXof > 0
      ? product.promoPriceXof
      : product.regularPriceXof;
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    const chosenOption = sizeOptions.find((s) => s.label === selectedSize);
    const chosenVariant =
      chosenOption?.variant ||
      activeVariants.find((v) => v.stockQty - v.reservedQty > 0) ||
      activeVariants[0];

    const fallbackColor = product.colors?.[0] || 'Standard';
    const variantId = chosenVariant
      ? chosenVariant.id
      : `doupi_${product.id}_${selectedSize}`;

    addToCart(
      {
        productId: product.id,
        variantId,
        slug: product.slug,
        name: product.name,
        imageUrl: product.images?.[0] || '',
        color: chosenVariant?.color || fallbackColor,
        colorHex: chosenVariant?.colorHex || '#111111',
        size: chosenVariant?.size || selectedSize,
        unitPriceXof: chosenVariant?.priceXof || effectivePrice,
        quantity: 1,
        sku: chosenVariant?.sku || product.sku,
        isPreorder: product.isPreorder,
      },
      false
    );

    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1800);
  };

  const formattedNumber = `${String(itemIndex + 1).padStart(2, '0')} / ${String(
    Math.max(1, totalCount)
  ).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      {product && (
        <motion.aside
          key={product.id}
          initial={{ opacity: 0, x: 28, y: 16 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 24, y: 16 }}
          transition={{ duration: 0.36, ease: KJ_EASE.editorial }}
          aria-label={product.name}
          className="fixed z-40 inset-x-3 bottom-3 md:inset-x-auto md:bottom-auto md:right-8 lg:right-12 md:top-1/2 md:-translate-y-1/2 md:w-[340px] lg:w-[368px] bg-[#FFFFFF] border border-black/12 shadow-[0_24px_60px_rgba(0,0,0,0.12)] text-black"
        >
          <div className="p-5 sm:p-6 md:p-7 space-y-5">
            {/* Top row: Index numbering + Close */}
            <div className="flex items-center justify-between border-b border-black/8 pb-3.5">
              <span className="text-[11px] font-light tracking-[0.26em] uppercase text-black/55 tabular-nums">
                {formattedNumber}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-[10.5px] font-normal uppercase tracking-[0.2em] text-black/65 hover:text-black transition-colors cursor-pointer"
              >
                <span>{tr('Fermer', 'Close')}</span>
                <X className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>

            {/* Product Name & Price */}
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-normal tracking-[-0.01em] text-black leading-snug">
                {product.name}
              </h2>
              <p className="text-sm font-light tracking-[0.04em] text-black/75 tabular-nums">
                {formatXOF(effectivePrice)}
              </p>
            </div>

            {/* Front / Back View Selector */}
            <div className="space-y-2">
              <p className="text-[10px] font-normal uppercase tracking-[0.24em] text-black/45">
                {tr('Vue', 'View')}
              </p>
              <div className="grid grid-cols-2 border border-black/15">
                <button
                  type="button"
                  onClick={() => onViewSideChange('front')}
                  className={`py-2 text-[10.5px] uppercase tracking-[0.2em] transition-colors cursor-pointer ${
                    viewSide === 'front'
                      ? 'bg-black text-white font-medium'
                      : 'bg-white text-black/65 hover:text-black font-light'
                  }`}
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => onViewSideChange('back')}
                  className={`py-2 text-[10.5px] uppercase tracking-[0.2em] border-l border-black/15 transition-colors cursor-pointer ${
                    viewSide === 'back'
                      ? 'bg-black text-white font-medium'
                      : 'bg-white text-black/65 hover:text-black font-light'
                  }`}
                >
                  Back
                </button>
              </div>
            </div>

            {/* Size Selector (S, M, L, XL) */}
            <div className="space-y-2">
              <p className="text-[10px] font-normal uppercase tracking-[0.24em] text-black/45">
                {tr('Taille', 'Size')}
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {sizeOptions.map((opt) => {
                  const isSelected = selectedSize === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      disabled={!opt.available}
                      onClick={() => setSelectedSize(opt.label)}
                      className={`h-10 border text-[11px] tracking-[0.14em] uppercase transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-black bg-black text-white font-medium'
                          : opt.available
                            ? 'border-black/15 bg-white text-black/80 hover:border-black font-light'
                            : 'border-black/8 bg-[#F7F7F7] text-black/25 line-through cursor-not-allowed'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions: Black Add to Cart + View Product Page */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full h-11 bg-black text-white text-[11px] font-medium uppercase tracking-[0.22em] hover:bg-black/88 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2]" />
                    <span>{tr('Ajouté au panier', 'Added to cart')}</span>
                  </>
                ) : (
                  <span>Add to cart</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/product/${product.slug}`)}
                className="w-full py-1.5 inline-flex items-center justify-center gap-1.5 text-[10.5px] font-light uppercase tracking-[0.22em] text-black/65 hover:text-black underline underline-offset-4 decoration-black/25 hover:decoration-black transition-colors cursor-pointer"
              >
                <span>View product page</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
