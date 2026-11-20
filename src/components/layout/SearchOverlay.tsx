import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatXOF } from '../../lib/format';
import {
  TRENDING_SEARCHES,
  SUGGESTED_SEARCH_CATEGORIES,
} from '../../lib/navigationData';

export function SearchOverlay() {
  const {
    searchOpen,
    setSearchOpen,
    products,
    navigate,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(timer);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchOpen, setSearchOpen]);

  const instantResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => {
        const haystack = [
          p.name,
          p.categoryName,
          p.brandName || '',
          p.brandSlug || '',
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
      })
      .slice(0, 8);
  }, [products, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;
    addRecentSearch(clean);
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(clean)}`);
  };

  const runQuickSearch = (term: string) => {
    setQuery(term);
    addRecentSearch(term);
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-[1px] z-50"
          />

          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-label="Search KIKI JONES"
            className="fixed top-0 inset-x-0 bg-white text-black z-50 border-b border-black/10 shadow-2xl max-h-[88vh] overflow-y-auto"
          >
            <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-6 space-y-8">
              {/* Top Search Bar */}
              <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-black pb-3">
                <Search className="w-5 h-5 text-black shrink-0" strokeWidth={1.6} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search clothing, matching sets, outerwear, accessories..."
                  aria-label="Search KIKI JONES products"
                  className="flex-1 bg-transparent text-base md:text-lg font-light text-black placeholder:text-black/40 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search query"
                    className="p-1 text-black/50 hover:text-black cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="p-1.5 text-black/70 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" strokeWidth={1.6} />
                </button>
              </form>

              {/* Empty Query State: Recent Searches, Trending Searches, Suggested Categories */}
              {!query.trim() ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-4">
                  {/* Recent Searches */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-black/50" />
                        Recent Searches
                      </p>
                      {recentSearches.length > 0 && (
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/45 hover:text-black cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {recentSearches.length === 0 ? (
                      <p className="text-xs font-light text-black/45">
                        Your recent searches will appear here.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {recentSearches.map((term) => (
                          <li key={term} className="flex items-center justify-between group">
                            <button
                              type="button"
                              onClick={() => runQuickSearch(term)}
                              className="text-sm font-light text-black/80 hover:text-black hover:underline underline-offset-4 cursor-pointer"
                            >
                              {term}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeRecentSearch(term)}
                              aria-label={`Remove ${term}`}
                              className="p-1 text-black/30 hover:text-black cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Trending Searches */}
                  <div className="md:col-span-4 space-y-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-black/50" />
                      Trending Now
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => runQuickSearch(term)}
                          className="px-3.5 py-1.5 border border-black/15 text-xs font-light text-black hover:border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Categories */}
                  <div className="md:col-span-4 space-y-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black">
                      Suggested Categories
                    </p>
                    <div className="space-y-2">
                      {SUGGESTED_SEARCH_CATEGORIES.map((cat) => (
                        <button
                          key={cat.href}
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            navigate(cat.href);
                          }}
                          className="w-full flex items-center justify-between py-1.5 border-b border-black/10 text-xs font-medium text-black/80 hover:text-black cursor-pointer"
                        >
                          <span>{cat.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-black/45" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Instant Product Results */
                <div className="space-y-5 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/60">
                      Instant Results ({instantResults.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => runQuickSearch(query.trim())}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-black hover:underline underline-offset-4 cursor-pointer"
                    >
                      View All Results
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {instantResults.length === 0 ? (
                    <div className="py-10 text-center space-y-3">
                      <p className="font-editorial text-2xl text-black">
                        No pieces matched &ldquo;{query}&rdquo;
                      </p>
                      <p className="text-xs font-light text-black/60">
                        Try searching for hoodies, blazers, matching sets, denim, or sunglasses.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {instantResults.map((p) => {
                        const price =
                          typeof p.promoPriceXof === 'number' &&
                          p.promoPriceXof > 0 &&
                          p.promoPriceXof < p.regularPriceXof
                            ? p.promoPriceXof
                            : p.regularPriceXof;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              addRecentSearch(query.trim());
                              setSearchOpen(false);
                              navigate(`/product/${p.slug}`);
                            }}
                            className="group text-left space-y-2 cursor-pointer"
                          >
                            <div className="aspect-[4/5] bg-[#F5F5F5] overflow-hidden">
                              {p.images?.[0] && (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/45">
                                {p.categoryName}
                              </p>
                              <p className="text-xs font-bold uppercase tracking-[0.05em] text-black line-clamp-1">
                                {p.name}
                              </p>
                              <p className="text-xs font-light text-black/75 tabular-nums">
                                {formatXOF(price)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
