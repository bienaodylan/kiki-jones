import React, { useMemo, useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/storefront/ProductCard';
import { TRENDING_SEARCHES, SUGGESTED_SEARCH_CATEGORIES } from '../lib/navigationData';

export function SearchPage({ initialQuery }: { initialQuery: string }) {
  const {
    products,
    getProductVariants,
    navigate,
    recentSearches,
    addRecentSearch,
  } = useStore();

  const [inputValue, setInputValue] = useState(initialQuery);
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc'>('recommended');

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
    <main className="pt-[88px] lg:pt-[96px] pb-10 max-w-[1440px] mx-auto px-2.5 sm:px-4 lg:px-6 min-h-screen bg-white text-black">
      {/* Search Bar Header */}
      <div className="pt-4 pb-5 border-b border-black/10 space-y-4">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-black/45">
          Search KIKI JONES
        </p>
        <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-black pb-3 max-w-3xl">
          <Search className="w-5 h-5 text-black shrink-0" strokeWidth={1.6} />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search pieces, categories, collections..."
            aria-label="Search query"
            className="flex-1 bg-transparent text-xl sm:text-2xl font-light text-black placeholder:text-black/35 focus:outline-none"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                navigate('/search');
              }}
              aria-label="Clear search"
              className="p-1 text-black/45 hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {activeQuery && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'women', label: 'Women' },
                { id: 'men', label: 'Men' },
                { id: 'girls', label: 'Girls' },
                { id: 'boys', label: 'Boys' },
                { id: 'accessories', label: 'Accessories' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAudienceFilter(tab.id)}
                  className={`whitespace-nowrap cursor-pointer pb-1 ${
                    audienceFilter === tab.id
                      ? 'font-bold text-black border-b border-black'
                      : 'font-light text-black/55 hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-black/50 tabular-nums">
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort search results"
                className="bg-[#F5F5F5] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] focus:outline-none cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results or Discovery */}
      {!activeQuery ? (
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
              Trending Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((term) => (
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
              Recent Searches
            </h2>
            {recentSearches.length === 0 ? (
              <p className="text-xs font-light text-black/50">No recent searches yet.</p>
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
              Browse Categories
            </h2>
            <ul className="space-y-2.5">
              {SUGGESTED_SEARCH_CATEGORIES.map((cat) => (
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
            No results for &ldquo;{activeQuery}&rdquo;
          </h2>
          <p className="text-sm font-light text-black/65 max-w-md mx-auto">
            Try another keyword or explore our curated collections across Women, Men, Girls, and Boys.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {TRENDING_SEARCHES.slice(0, 5).map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setInputValue(term);
                  navigate(`/search?q=${encodeURIComponent(term)}`);
                }}
                className="px-4 py-2 border border-black/15 text-xs font-light hover:border-black cursor-pointer"
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
