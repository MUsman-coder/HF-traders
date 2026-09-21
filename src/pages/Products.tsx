import React, { useEffect, useState } from 'react';
import { Loader2, ImageOff } from 'lucide-react';
import PageShell from '../components/PageShell';
import QuoteModal from '../components/QuoteModal';
import ContactInfoModal from '../components/ContactInfoModal';
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
  imageUrl?: string | null;
}

const CATEGORY_ORDER = [
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

/** Product image with a graceful fallback when the file hasn't been added yet. */
const ProductImage: React.FC<{ src?: string | null; alt: string }> = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="h-40 bg-gradient-to-br from-[#e8702a]/25 to-white/5 flex flex-col items-center justify-center gap-1.5 text-white/30">
        <ImageOff size={20} />
        <span className="text-[10px] font-medium uppercase tracking-wide text-center px-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQuote, setActiveQuote] = useState<Product | null>(null);
  const [activeContact, setActiveContact] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest<{ products: Product[] }>('/products')
      .then((data) => {
        if (!cancelled) setProducts(data.products);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load products.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = CATEGORY_ORDER.map((title) => ({
    title,
    items: products.filter((p) => p.category === title),
  })).filter((group) => group.items.length > 0);

  return (
    <PageShell
      eyebrow="Products"
      title="Our Complete Scrap & Recycling Catalog"
      subtitle="From metal scrap to e-waste, drums, appliances, and industrial equipment — browse every category we buy, sell, and process."
    >
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-white/5" />
              <div className="p-5 flex flex-col gap-3">
                <div className="h-3 w-2/3 bg-white/10 rounded" />
                <div className="h-2.5 w-full bg-white/5 rounded" />
                <div className="h-2.5 w-4/5 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <p className="text-red-400 text-sm">
          {error} — is the backend running at the URL in <code>.env</code>?
        </p>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-16">
          {grouped.map((category) => (
            <div key={category.title}>
              <Reveal>
                <h2 className="text-white text-2xl font-playfair italic mb-6">{category.title}</h2>
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {category.items.map((product, i) => (
                  <Reveal key={product.id} delay={(i % 4) * 150}>
                    <div className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                      <div className="overflow-hidden">
                        <ProductImage src={product.imageUrl} alt={product.name} />
                      </div>
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-white text-sm font-semibold">{product.name}</h3>
                          <span
                            className={`text-[10px] font-medium px-2 py-1 rounded-full border shrink-0 ${availabilityStyle[product.availability]}`}
                          >
                            {product.availability}
                          </span>
                        </div>
                        <p className="text-white/55 text-xs leading-relaxed flex-1">{product.description}</p>
                        <p className="text-white/40 text-[11px]">Grade: <span className="text-white/70">{product.grade}</span></p>
                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveQuote(product)}
                            className="flex-1 bg-[#e8702a] hover:bg-[#d2611f] text-white text-xs font-medium px-3 py-2.5 rounded-full transition-all hover:scale-[1.03] active:scale-95"
                          >
                            Request Quote
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveContact(product)}
                            className="flex-1 text-center bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-2.5 rounded-full transition-all hover:scale-[1.03] border border-white/15"
                          >
                            Contact Us
                          </button>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeQuote && (
        <QuoteModal
          productId={activeQuote.id}
          productName={activeQuote.name}
          onClose={() => setActiveQuote(null)}
        />
      )}

      {activeContact && (
        <ContactInfoModal
          productName={activeContact.name}
          onClose={() => setActiveContact(null)}
        />
      )}
    </PageShell>
  );
};

export default Products;
