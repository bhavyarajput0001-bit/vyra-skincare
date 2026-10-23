import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { COLLECTIONS } from '../lib/collections';
import { useProducts, useDocumentTitle } from '../lib/hooks';
import { Eyebrow, Skeleton } from '../components/ui';

export default function Collections() {
  useDocumentTitle('Collections');
  const { data, loading } = useProducts();
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-12 md:px-10 md:pt-20">
      <header className="mb-14 border-b border-obsidian pb-10">
        <Eyebrow className="text-muted">Four rituals</Eyebrow>
        <h1 className="mt-4 font-serif text-7xl leading-[0.85] md:text-[9rem]">Collections</h1>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {COLLECTIONS.map((c, i) => {
          const items = data?.filter((p) => p.category === c.category) ?? [];
          return (
            <motion.div key={c.category} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: (i % 2) * 0.1 }}>
              <Link to={`/shop?category=${c.category}`} className="group relative block overflow-hidden bg-stone">
                <img src={c.image} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.04] md:aspect-[5/6]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/80 via-obsidian/30 to-transparent p-6 pt-24 text-ivory md:p-8 md:pt-32">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="font-mono text-[11px] text-ivory/70">{c.ritual}</p>
                      <h2 className="mt-2 font-serif text-6xl leading-none group-hover:italic md:text-7xl">{c.title}</h2>
                      <p className="mt-3 max-w-xs text-[14px] text-ivory/80">{c.line}</p>
                    </div>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ivory/40 transition-colors group-hover:bg-ivory group-hover:text-obsidian">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-ivory/20 pt-4 text-[12px]">
                    {loading ? (
                      <Skeleton className="h-5 w-40 bg-ivory/20" />
                    ) : items.length ? (
                      items.map((p) => <span key={p.id} className="rounded-full border border-ivory/30 px-3 py-1">{p.name}</span>)
                    ) : (
                      <span className="text-ivory/60">Coming soon</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
