import React, { useMemo, useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { MobileShopDirectory } from '../components/layout/MobileShopDirectory';
import { DivisionKey } from '../lib/navigationData';
import {
  getSuggestedSearchCategories,
  getTrendingSearches,
} from '../lib/i18n';

export function SearchPage({ initialQuery }: { initialQuery: string }) {
  const {
    products,
    getProductVariants,
    navigate,
    recentSearches,
    addRecentSearch,
  } = useStore();
  const { lang, tr } = useLanguage();
  const { isAppMode } = useExperienceMode();

  const [inputValue, setInputValue] = useState(initialQuery);
  const [selectedDivision, setSelectedDivision] = useState<DivisionKey>('women');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc'>('recommended');

  const trendingSearches = useMemo(() => getTrendingSearches(lang), [lang]);
  const suggestedCategories = useMemo(() => getSuggestedSearchCategories(lang), [lang]);

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

  // In App Mode with no active query, present the full visual division-tabbed Shop Directory
  if (isAppMode && !activeQuery) {
    return (
      <main className="pb-10 max-w-[1440px] mx-auto min-h-screen bg-white text-black">
        <MobileShopDirectory
          selectedDivision={selectedDivision}
          onSelectDivision={setSelectedDivision}
          onNavigate={navigate}
          searchValue={inputValue}
          onSearchChange={setInputValue}
          onSearchSubmit={(clean) => {
            setInputValue(clean);
            navigate(`/search?q=${encodeURIComponent(clean)}`);
          }}
          showSearchBar
        />
      </main>
    );
  }

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
              ? 'flex items-center gap-2.5 rounded-full bg-white border border-black/15 px-4 min-h-[44px]'
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
              isAppMode ? 'text-sm py-2' : 'text-xl sm:text-2xl'
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

      {/* Results or Web Discovery */}
      {!activeQuery ? (
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

