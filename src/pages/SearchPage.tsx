import React, { useMemo, useState, useEffect } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { getSectionImage } from '../lib/storefrontMedia';
import {
  getLocalizedBrands,
  getLocalizedCategories,
  getLocalizedCollections,
  getSuggestedSearchCategories,
  getTrendingSearches,
} from '../lib/i18n';

export function SearchPage({ initialQuery }: { initialQuery: string }) {
  const {
    products,
    storefrontConfig,
    getProductVariants,
    navigate,
    recentSearches,
    addRecentSearch,
  } = useStore();
  const { lang, tr } = useLanguage();
  const { isAppMode } = useExperienceMode();

  const [inputValue, setInputValue] = useState(initialQuery);
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc'>('recommended');

  const trendingSearches = useMemo(() => getTrendingSearches(lang), [lang]);
  const suggestedCategories = useMemo(() => getSuggestedSearchCategories(lang), [lang]);
  const localizedBrands = useMemo(() => getLocalizedBrands(lang), [lang]);
  const localizedCategories = useMemo(() => getLocalizedCategories(lang), [lang]);
  const localizedCollections = useMemo(() => getLocalizedCollections(lang), [lang]);

  useEffect(() => {
    setInputValue(initialQuery);
  }, [initialQuery]);

  const activeQuery = inputValue.trim();

  const results = useMemo(() => {
    if (!activeQuery) return [];
    const q = activeQuery.toLowerCase();
    const matched = products.filter((p) => {
      if (audienceFilter !== 'all' && p.audience !== audienceFilter) return false;
      const haystack = [
        p.name,
        p.categoryName,
        p.brandName || '',
        p.audience || '',
        p.subCategory || '',
        p.description,
        ...(p.styleTags || []),
        ...(p.collectionSlugs || []),
        ...(p.colors || []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    return [...matched].sort((a, b) => {
      const pA = a.promoPriceXof && a.promoPriceXof > 0 ? a.promoPriceXof : a.regularPriceXof;
      const pB = b.promoPriceXof && b.promoPriceXof > 0 ? b.promoPriceXof : b.regularPriceXof;
      if (sortBy === 'price-asc') return pA - pB;
      if (sortBy === 'price-desc') return pB - pA;
      return (a.newDropOrder || 999) - (b.newDropOrder || 999);
    });
  }, [products, activeQuery, audienceFilter, sortBy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim();
    if (clean) {
      addRecentSearch(clean);
      navigate(`/search?q=${encodeURIComponent(clean)}`);
    }
  };

  return (
    <main
      className={`${
        isAppMode ? 'pt-3 pb-8' : 'pt-[88px] lg:pt-[96px] pb-10'
      } max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6 min-h-screen bg-white text-black`}
    >
      {/* Search Bar Header */}
      <div className={`${isAppMode ? 'pt-1 pb-4' : 'pt-4 pb-5'} border-b border-black/10 space-y-3.5`}>
        {!isAppMode && (
          <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-black/45">
            {tr('Rechercher sur KIKI JONES', 'Search KIKI JONES')}
          </p>
        )}
        <form
          onSubmit={handleSubmit}
          className={
            isAppMode
              ? 'flex items-center gap-2.5 bg-[#F5F5F5] border border-black/10 px-3.5 min-h-[46px]'
              : 'flex items-center gap-3 border-b border-black pb-3 max-w-3xl'
          }
        >
          <Search className="w-[18px] h-[18px] text-black/65 shrink-0" strokeWidth={1.7} />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={tr(
              'Rechercher des pièces, marques, collections...',
              'Search pieces, brands, collections...'
            )}
            aria-label={tr('Recherche', 'Search query')}
            className={`flex-1 bg-transparent font-light text-black placeholder:text-black/40 focus:outline-none ${
              isAppMode ? 'text-sm py-2.5' : 'text-xl sm:text-2xl'
            }`}
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                navigate('/search');
              }}
              aria-label={tr('Effacer', 'Clear search')}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-black/50 hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {activeQuery && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: 'all', label: tr('Tout', 'All') },
                { id: 'women', label: tr('Femme', 'Women') },
                { id: 'men', label: tr('Homme', 'Men') },
                { id: 'girls', label: tr('Filles', 'Girls') },
                { id: 'boys', label: tr('Garçons', 'Boys') },
                { id: 'accessories', label: tr('Accessoires', 'Accessories') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAudienceFilter(tab.id)}
                  className={`whitespace-nowrap cursor-pointer pb-1 min-h-[36px] ${
                    audienceFilter === tab.id
                      ? 'font-bold text-black border-b border-black'
                      : 'font-light text-black/55 hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-black/50 tabular-nums">
                {results.length}{' '}
                {tr(results.length <= 1 ? 'résultat' : 'résultats', results.length === 1 ? 'result' : 'results')}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label={tr('Trier les résultats', 'Sort search results')}
                className="bg-[#F5F5F5] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] focus:outline-none cursor-pointer"
              >
                <option value="recommended">{tr('Recommandés', 'Recommended')}</option>
                <option value="price-asc">{tr('Prix croissant', 'Price: Low to High')}</option>
                <option value="price-desc">{tr('Prix décroissant', 'Price: High to Low')}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results or Discovery */}
      {!activeQuery ? (
        isAppMode ? (
          <div className="py-5 space-y-8">
            {/* Quick Shortcuts */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { label: tr('Nouveautés', 'New In'), href: '/new-in' },
                { label: tr('Soldes', 'Sale'), href: '/sale' },
                { label: tr('Femme', 'Women'), href: '/women' },
                { label: tr('Homme', 'Men'), href: '/men' },
                { label: tr('Enfants', 'Kids'), href: '/brand/kiki-kids' },
                { label: tr('Accessoires', 'Accessories'), href: '/accessories' },
              ].map((s) => (
                <button
                  key={s.href}
                  type="button"
                  onClick={() => navigate(s.href)}
                  className="min-h-[40px] px-4 border border-black/15 bg-white text-[11px] font-bold uppercase tracking-[0.14em] whitespace-nowrap shrink-0 hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Trending Searches */}
            <section className="space-y-3">
              <h2 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-black/50">
                {tr('Recherches tendances', 'Trending Searches')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setInputValue(term);
                      addRecentSearch(term);
                      navigate(`/search?q=${encodeURIComponent(term)}`);
                    }}
                    className="min-h-[40px] px-3.5 py-2 bg-[#F5F5F5] text-xs font-medium text-black active:bg-black active:text-white transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <section className="space-y-2.5">
                <h2 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-black/50">
                  {tr('Recherches récentes', 'Recent Searches')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setInputValue(term);
                        navigate(`/search?q=${encodeURIComponent(term)}`);
                      }}
                      className="min-h-[38px] px-3.5 py-1.5 border border-black/15 text-xs font-light text-black/80 cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Shop by Brand Horizontal Rail */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-black/50">
                  {tr('Nos Maisons', 'Shop by Brand')}
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/brands')}
                  className="text-[11px] font-bold uppercase tracking-[0.14em] text-black inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{tr('Tout voir', 'View All')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-3 px-3">
                {localizedBrands.map((brand) => (
                  <button
                    key={brand.slug}
                    type="button"
                    onClick={() => navigate(`/brand/${brand.slug}`)}
                    className="w-[146px] sm:w-[172px] shrink-0 snap-start text-left space-y-2 cursor-pointer"
                  >
                    <div className="aspect-[3/4] w-full bg-[#F5F5F5] overflow-hidden">
                      <img
                        src={getSectionImage(storefrontConfig, `brand:${brand.slug}`, brand.heroImage)}
                        alt={brand.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-black truncate">
                        {brand.name}
                      </p>
                      <p className="text-[11px] font-light text-black/55 truncate">
                        {brand.tagline}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Shop by Category Visual Grid */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-black/50">
                  {tr('Par Catégorie', 'Browse Categories')}
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/categories')}
                  className="text-[11px] font-bold uppercase tracking-[0.14em] text-black inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{tr('Tout voir', 'View All')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {localizedCategories.slice(0, 8).map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => navigate(`/category/${cat.slug}`)}
                    className="relative aspect-[4/5] w-full overflow-hidden bg-black text-left cursor-pointer"
                  >
                    <img
                      src={getSectionImage(storefrontConfig, `category:${cat.slug}`, cat.imageUrl)}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-white">
                        {cat.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Collections Spotlight */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-black/50">
                  Collections
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/collections')}
                  className="text-[11px] font-bold uppercase tracking-[0.14em] text-black inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{tr('Tout voir', 'View All')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {localizedCollections.slice(0, 3).map((col) => (
                  <button
                    key={col.slug}
                    type="button"
                    onClick={() => navigate(`/collection/${col.slug}`)}
                    className="relative aspect-[16/10] w-full overflow-hidden bg-black text-left cursor-pointer"
                  >
                    <img
                      src={getSectionImage(storefrontConfig, `collection:${col.slug}`, col.campaignImage)}
                      alt={col.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                      <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/75">
                        {col.seasonTag}
                      </p>
                      <p className="text-base font-bold uppercase tracking-[0.04em]">{col.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                {tr('Recherches tendances', 'Trending Searches')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setInputValue(term);
                      addRecentSearch(term);
                      navigate(`/search?q=${encodeURIComponent(term)}`);
                    }}
                    className="px-4 py-2 border border-black/15 text-xs font-light hover:border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                {tr('Recherches récentes', 'Recent Searches')}
              </h2>
              {recentSearches.length === 0 ? (
                <p className="text-xs font-light text-black/50">
                  {tr('Aucune recherche récente.', 'No recent searches yet.')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {recentSearches.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => {
                          setInputValue(term);
                          navigate(`/search?q=${encodeURIComponent(term)}`);
                        }}
                        className="text-sm font-light text-black/80 hover:text-black hover:underline underline-offset-4 cursor-pointer"
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                {tr('Parcourir les catégories', 'Browse Categories')}
              </h2>
              <ul className="space-y-2.5">
                {suggestedCategories.map((cat) => (
                  <li key={cat.href}>
                    <button
                      type="button"
                      onClick={() => navigate(cat.href)}
                      className="text-sm font-light text-black/80 hover:text-black hover:underline underline-offset-4 cursor-pointer"
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      ) : results.length === 0 ? (
        <div className="py-16 text-center space-y-5">
          <h2 className="font-editorial text-3xl text-black">
            {tr(`Aucun résultat pour « ${activeQuery} »`, `No results for "${activeQuery}"`)}
          </h2>
          <p className="text-sm font-light text-black/65 max-w-md mx-auto">
            {tr(
              'Essayez un autre mot-clé ou parcourez nos collections pour Femme, Homme, Filles et Garçons.',
              'Try another keyword or explore our curated collections across Women, Men, Girls, and Boys.'
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {trendingSearches.slice(0, 5).map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setInputValue(term);
                  navigate(`/search?q=${encodeURIComponent(term)}`);
                }}
                className="min-h-[40px] px-4 py-2 border border-black/15 text-xs font-light hover:border-black cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-x-1.5 gap-y-4 sm:gap-x-2 sm:gap-y-5 items-stretch">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} variants={getProductVariants(p.id)} />
          ))}
        </div>
      )}
    </main>
  );
}

