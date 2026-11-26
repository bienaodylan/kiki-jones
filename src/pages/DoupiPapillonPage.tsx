import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight, Check, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { formatXOF, getAvailableStock, getColorHex } from '../lib/format';
import { Product, ProductVariant } from '../types/commerce';

const COLLECTION_SLUG = 'doupi-papillon';

export function DoupiPapillonPage() {
  const { products, getProductVariants, addToCart, navigate } = useStore();
  const { tr } = useLanguage();
  const { isAppMode } = useExperienceMode();
  const railSectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);

  const collectionProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.status === 'published' &&
          product.brandSlug === 'kiki-luxe' &&
          (product.collectionSlugs || []).includes(COLLECTION_SLUG)
      ),
    [products]
  );

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const { scrollYProgress } = useScroll({
    target: railSectionRef,
    offset: ['start start', 'end end'],
  });
  const maxRailTravel = Math.max(0, collectionProducts.length * 360 - 1040);
  const railX = useTransform(scrollYProgress, [0, 1], [0, -maxRailTravel]);

  const selectedVariants = useMemo(
    () => (selectedProduct ? getProductVariants(selectedProduct.id).filter((v) => v.isActive) : []),
    [selectedProduct, getProductVariants]
  );
  const availableColors = useMemo(
    () => Array.from(new Map(selectedVariants.map((v) => [v.color, v.colorHex || getColorHex(v.color)])).entries()),
    [selectedVariants]
  );
  const activeVariant: ProductVariant | undefined =
    selectedVariants.find((v) => v.color === selectedColor && v.size === selectedSize) ||
    selectedVariants.find((v) => getAvailableStock(v) > 0) ||
    selectedVariants[0];
  const availableStock = activeVariant ? getAvailableStock(activeVariant) : 0;

  useEffect(() => {
    if (!selectedProduct) return;
    const variants = getProductVariants(selectedProduct.id).filter((v) => v.isActive);
    const firstAvailable = variants.find((v) => getAvailableStock(v) > 0) || variants[0];
    setSelectedColor(firstAvailable?.color || '');
    setSelectedSize(firstAvailable?.size || '');
    setActiveImage(0);
    setAdded(false);
  }, [selectedProduct?.id, getProductVariants]);

  useEffect(() => {
    if (!selectedProduct) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProduct(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedProduct]);

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveImage(0);
  };

  const addSelectedToCart = () => {
    if (!selectedProduct || !activeVariant || (availableStock <= 0 && !selectedProduct.isPreorder)) return;
    const image = selectedProduct.images?.[activeImage] || selectedProduct.images?.[0] || '';
    addToCart({
      variantId: activeVariant.id,
      productId: selectedProduct.id,
      slug: selectedProduct.slug,
      name: selectedProduct.name,
      sku: activeVariant.sku,
      color: activeVariant.color,
      colorHex: activeVariant.colorHex || getColorHex(activeVariant.color),
      size: activeVariant.size,
      unitPriceXof: activeVariant.priceXof || selectedProduct.promoPriceXof || selectedProduct.regularPriceXof,
      quantity: 1,
      imageUrl: image,
      isPreorder: selectedProduct.isPreorder && availableStock <= 0,
    });
    setAdded(true);
  };

  return (
    <main className={`${isAppMode ? 'pt-0' : 'pt-[76px] lg:pt-[88px]'} bg-[#eeeae4] text-[#171613] min-h-screen overflow-hidden`}>
      <section className="relative min-h-[78vh] lg:min-h-[88vh] bg-[#171613] text-white flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(164,139,111,0.42),transparent_48%),linear-gradient(115deg,#171613_8%,#383027_58%,#171613)]" />
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(90deg, transparent 49.8%, rgba(255,255,255,.12) 50%, transparent 50.2%), linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '100% 100%, 100% 72px' }} />
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pb-14 lg:pb-20">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.34em] text-white/60 mb-5">KIKI JONES PREMIUM PRESENTS</p>
          <h1 className="font-editorial text-[clamp(2.8rem,8vw,7.5rem)] leading-[0.92] tracking-[-0.045em] max-w-5xl">
            KIKI JONES <span className="text-white/45">×</span><br />DOUPI PAPILLON
          </h1>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/55 mb-2">PRIVATE COLLECTION</p>
              <p className="font-light text-sm sm:text-base text-white/80 max-w-md">A new expression of Kiki Jones. A meeting of fashion, attitude and creative vision.</p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('doupi-rail')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-3 border border-white/60 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
            >
              {tr('Découvrir la collection', 'Discover the collection')}
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-12 text-[9px] uppercase tracking-[0.2em] text-white/35">OFFICIAL CAMPAIGN IMAGE · ASSET PLACEHOLDER</p>
        </div>
        <div className="absolute top-8 right-6 sm:right-10 text-[9px] uppercase tracking-[0.24em] text-white/45 [writing-mode:vertical-rl]">KJ / DP — EDITION 01</div>
      </section>

      <section className="px-6 sm:px-10 lg:px-16 py-14 lg:py-20 max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/45 mb-3">THE COLLABORATION</p>
          <h2 className="font-editorial text-4xl sm:text-6xl leading-[0.98]">On The Rail</h2>
        </div>
        <p className="max-w-sm text-sm font-light leading-relaxed text-black/65">
          {tr('Découvrez les pièces de la collaboration comme dans un showroom éditorial. Faites défiler le portant et sélectionnez une silhouette pour voir ses détails.', 'Explore the collaboration as an editorial showroom. Move along the rail and select a silhouette to reveal its details.')}
        </p>
      </section>

      {collectionProducts.length > 0 ? (
        <section
          id="doupi-rail"
          ref={railSectionRef}
          className="relative bg-[#d9d3ca]"
          style={{ height: isMobile ? 'auto' : `${Math.max(220, collectionProducts.length * 46)}vh` }}
        >
          <div className="md:sticky md:top-0 md:h-screen flex flex-col justify-center overflow-hidden py-12 md:py-0">
            <div className="px-6 sm:px-10 lg:px-16 mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.28em] text-black/45 mb-2">01 — THE GARMENTS</p>
                <h3 className="font-editorial text-2xl sm:text-3xl">Select a piece</h3>
              </div>
              <p className="hidden sm:block text-[9px] uppercase tracking-[0.18em] text-black/45">Scroll to explore · Select to view</p>
            </div>
            <div className="overflow-x-auto md:overflow-visible no-scrollbar touch-pan-x">
              <motion.div
                style={{ x: isMobile ? 0 : railX }}
                className="flex items-center gap-5 sm:gap-8 px-6 sm:px-10 lg:px-16 w-max"
              >
                {collectionProducts.map((product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => openProduct(product)}
                    className="group relative w-[72vw] sm:w-[42vw] md:w-[320px] shrink-0 text-left"
                    aria-label={`View ${product.name}`}
                  >
                    <div className="relative h-[54vh] min-h-[340px] max-h-[590px] bg-[#c8c0b5] overflow-hidden flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} loading="lazy" className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.04]" />
                      ) : (
                        <span className="text-[10px] uppercase tracking-[0.2em] text-black/40">Image coming soon</span>
                      )}
                      <span className="absolute top-4 left-4 text-[9px] tracking-[0.2em] text-black/50">0{index + 1}</span>
                      <span className="absolute bottom-4 right-4 w-10 h-10 rounded-full border border-black/30 flex items-center justify-center bg-[#eeeae4]/70 group-hover:bg-black group-hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="pt-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.1em]">{product.name}</p>
                        <p className="text-[9px] uppercase tracking-[0.18em] text-black/45 mt-1">Kiki Jones × Doupi Papillon</p>
                      </div>
                      <p className="text-xs tabular-nums whitespace-nowrap">{formatXOF(product.promoPriceXof || product.regularPriceXof)}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            </div>
            <div className="px-6 sm:px-10 lg:px-16 mt-8 flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-black/45">
              <span className="w-12 h-px bg-black/35" />
              {collectionProducts.length} {tr('pièces disponibles dans la sélection', 'pieces in this edit')}
            </div>
          </div>
        </section>
      ) : (
        <section id="doupi-rail" className="min-h-[48vh] bg-[#d9d3ca] flex items-center justify-center px-6 py-20 text-center">
          <div className="max-w-lg">
            <p className="text-[9px] uppercase tracking-[0.28em] text-black/45 mb-4">ON THE RAIL · COMING SOON</p>
            <h3 className="font-editorial text-3xl sm:text-4xl mb-4">{tr('La sélection arrive bientôt', 'The collection is coming soon')}</h3>
            <p className="text-sm font-light leading-relaxed text-black/60">
              {tr('Aucune pièce n’est encore publiée dans cette collaboration. Ajoutez les produits officiels au catalogue et associez-les à Kiki Jones Premium et à la collection Doupi Papillon pour les afficher ici.', 'No products have been published for this collaboration yet. Publish the official products in the catalog and assign both Kiki Jones Premium and the Doupi Papillon collection to display them here.')}
            </p>
          </div>
        </section>
      )}

      <section className="bg-[#171613] text-white px-6 sm:px-10 lg:px-16 py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-white/45 mb-4">KIKI JONES PREMIUM</p>
            <h2 className="font-editorial text-3xl sm:text-5xl max-w-2xl">A collaboration made to be discovered.</h2>
          </div>
          <button type="button" onClick={() => navigate('/brand/kiki-luxe')} className="inline-flex items-center gap-3 border border-white/55 px-6 py-3 text-[10px] uppercase tracking-[0.18em] hover:bg-white hover:text-black transition-colors">
            {tr('Explorer Kiki Jones Premium', 'Explore Kiki Jones Premium')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={selectedProduct.name}
              className="relative bg-[#eeeae4] text-black w-full max-w-5xl max-h-[94vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2"
              initial={{ y: 36, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" onClick={() => setSelectedProduct(null)} aria-label="Close product preview" className="absolute z-10 top-4 right-4 w-10 h-10 bg-[#eeeae4] rounded-full flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <div className="bg-[#d9d3ca] min-h-[42vh] md:min-h-[620px] flex flex-col">
                <div className="flex-1 min-h-0 flex items-center justify-center p-6">
                  {selectedProduct.images?.[activeImage] ? (
                    <img src={selectedProduct.images[activeImage]} alt={selectedProduct.name} className="max-h-[62vh] w-full object-contain" />
                  ) : (
                    <span className="text-xs uppercase tracking-[0.18em] text-black/40">Image coming soon</span>
                  )}
                </div>
                {selectedProduct.images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto px-5 pb-5">
                    {selectedProduct.images.map((image, index) => (
                      <button key={image + index} type="button" onClick={() => setActiveImage(index)} className={`w-14 h-16 shrink-0 bg-white/40 border ${activeImage === index ? 'border-black' : 'border-transparent'}`}>
                        <img src={image} alt={`${selectedProduct.name} view ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-9 lg:p-12 flex flex-col justify-center">
                <p className="text-[9px] uppercase tracking-[0.24em] text-black/45 mb-4">KIKI JONES × DOUPI PAPILLON</p>
                <h3 className="font-editorial text-3xl sm:text-4xl leading-tight">{selectedProduct.name}</h3>
                <p className="text-lg font-medium mt-4 tabular-nums">{formatXOF(activeVariant?.priceXof || selectedProduct.promoPriceXof || selectedProduct.regularPriceXof)}</p>
                {selectedProduct.description && <p className="text-sm font-light leading-relaxed text-black/65 mt-5">{selectedProduct.description}</p>}

                {availableColors.length > 0 && (
                  <div className="mt-8">
                    <p className="text-[9px] uppercase tracking-[0.2em] mb-3">{tr('Couleur', 'Color')} · {selectedColor}</p>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map(([color, hex]) => (
                        <button key={color} type="button" onClick={() => { setSelectedColor(color); const first = selectedVariants.find((v) => v.color === color && getAvailableStock(v) > 0) || selectedVariants.find((v) => v.color === color); setSelectedSize(first?.size || ''); }} aria-label={color} className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-black' : 'border-black/15'}`} style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                  </div>
                )}

                {selectedVariants.length > 0 && (
                  <div className="mt-7">
                    <p className="text-[9px] uppercase tracking-[0.2em] mb-3">{tr('Taille', 'Size')}</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(selectedVariants.filter((v) => v.color === selectedColor).map((v) => v.size))).map((size) => {
                        const variant = selectedVariants.find((v) => v.color === selectedColor && v.size === size);
                        const inStock = Boolean(variant && getAvailableStock(variant) > 0);
                        return (
                          <button key={size} type="button" disabled={!inStock && !selectedProduct.isPreorder} onClick={() => setSelectedSize(size)} className={`min-w-12 px-3 py-2 border text-xs ${selectedSize === size ? 'bg-black text-white border-black' : 'border-black/20'} ${!inStock && !selectedProduct.isPreorder ? 'opacity-30 cursor-not-allowed' : ''}`}>
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-black/50 mt-6">{availableStock > 0 ? `${availableStock} ${tr('en stock', 'in stock')}` : selectedProduct.isPreorder ? tr('Précommande disponible', 'Pre-order available') : tr('Indisponible', 'Unavailable')}</p>
                <button type="button" disabled={!activeVariant || (availableStock <= 0 && !selectedProduct.isPreorder)} onClick={addSelectedToCart} className="mt-4 w-full bg-black text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold disabled:opacity-35 flex items-center justify-center gap-2">
                  {added ? <><Check className="w-4 h-4" />{tr('Ajouté au panier', 'Added to bag')}</> : tr('Ajouter au panier', 'Add to bag')}
                </button>
                <button type="button" onClick={() => { setSelectedProduct(null); navigate(`/product/${selectedProduct.slug}`); }} className="mt-4 text-[9px] uppercase tracking-[0.18em] underline underline-offset-4 text-black/60">
                  {tr('Voir la fiche produit complète', 'View full product details')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
