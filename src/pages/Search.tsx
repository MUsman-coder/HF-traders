import React, { useEffect, useMemo, useState } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import PageShell from '../components/PageShell';
import Reveal from '../components/Reveal';
import { apiRequest } from '../api';

interface Product {
  id: string;
  name: string;
  category: string;
  type: string;
  grade: string;
  availability: 'In Stock' | 'Limited' | 'On Order';
  description: string;
}

const CATEGORIES = [
  'All',
  'Metal Scrap',
  'Plastic & Drums',
  'Batteries & Power',
  'Electronics & IT',
  'Home Appliances',
  'Industrial Equipment',
  'General Waste & Materials',
];

const availabilityStyle: Record<Product['availability'], string> = {
  'In Stock': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Limited: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'On Order': 'bg-white/10 text-white/60 border-white/20',
};

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiRequest<{ products: Product[] }>('/products')
      .then((data) => {
        if (!cancelled) {
          setProducts(data.products);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load materials.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  const results = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesQuery =
        query.trim() === '' ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.type.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, query, category]);

  return (
    <PageShell
      eyebrow="Search"
      title="Search scrap products & materials"
      subtitle="Search across all our materials by name or type, and filter by category to find what you need."
    >
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* ===================== SIDEBAR: CATEGORIES ===================== */}
        <aside className="md:sticky md:top-24 md:self-start bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-white/40 text-[11px] uppercase tracking-wide font-medium px-2 mb-2">
            Categories
          </p>
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center justify-between gap-2 shrink-0 md:shrink text-left text-xs font-medium px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap md:whitespace-normal ${
                  category === cat
                    ? 'bg-[#e8702a] text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{cat}</span>
                <span className={category === cat ? 'text-white/80' : 'text-white/30'}>
                  {categoryCounts[cat] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* ===================== MAIN: SEARCH + RESULTS ===================== */}
        <div>
          <div className="relative">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product or metal type (e.g. copper, laptop, drums)"
              className="w-full bg-white/5 border border-white/15 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#e8702a] transition-colors"
            />
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-white/50 text-sm mt-8">
              <Loader2 size={16} className="animate-spin" /> Loading materials…
            </div>
          )}

          {error && !loading && (
            <p className="mt-8 text-red-400 text-sm">
              {error} — is the backend running at the URL in <code>.env</code>?
            </p>
          )}

          {!loading && !error && (
            <>
              <p className="mt-6 text-white/50 text-xs">
                Showing {results.length} of {products.length} materials
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((product, i) => (
                  <Reveal key={product.id} delay={(i % 6) * 130}>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-3 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300">
                      <div>
                        <h3 className="text-white text-sm font-semibold">{product.name}</h3>
                        <p className="text-white/50 text-xs mt-1">{product.category} · {product.type}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border shrink-0 ${availabilityStyle[product.availability]}`}>
                        {product.availability}
                      </span>
                    </div>
                  </Reveal>
                ))}

                {results.length === 0 && (
                  <p className="col-span-full text-center text-white/40 text-sm py-10">
                    No materials match your search. Try a different keyword or category.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default Search;
