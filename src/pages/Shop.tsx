import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import { useProducts, useDocumentTitle } from '../lib/hooks';
import { CATEGORIES, type Category } from '../lib/types';
import { COLLECTIONS } from '../lib/collections';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { Banner, Button, EmptyState, Eyebrow, Select, cx } from '../components/ui';

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'name';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = (params.get('category') as Category | null) ?? null;
  const sort = (params.get('sort') as Sort | null) ?? 'featured';
  const valid = category && CATEGORIES.includes(category) ? category : null;
  useDocumentTitle(valid ? `Shop ${valid}` : 'Shop');
  const { data, loading, error, reload } = useProducts();

  const products = useMemo(() => {
    if (!data) return [];
    const list = valid ? data.filter((p) => p.category === valid) : [...data];
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [data, valid, sort]);

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };

  const meta = COLLECTIONS.find((c) => c.category === valid);

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-12 md:px-10 md:pt-20">
      <header className="grid gap-6 border-b border-obsidian pb-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <Eyebrow className="text-muted">{meta ? meta.ritual : 'The full line-up'}</Eyebrow>
          <h1 className="mt-4 font-serif text-7xl leading-[0.85] md:text-[9rem]">
            {valid ? valid : <>The <em className="text-rose">Collection</em></>}
          </h1>
        </div>
        <p className="text-[15px] leading-relaxed text-graphite md:col-span-4">
          {meta ? meta.line : 'Six proposed formulas across four rituals. Everything shown is a concept in development — orders placed here are demos.'}
        </p>
      </header>

      <div className="sticky top-16 z-20 -mx-5 flex flex-col gap-3 bg-ivory px-5 py-4 md:top-20 md:-mx-10 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0" role="tablist" aria-label="Filter by category">
          {[null, ...CATEGORIES].map((c) => {
            const active = c === valid;
            const n = data ? (c ? data.filter((p) => p.category === c).length : data.length) : null;
            return (
              <button
                key={c ?? 'all'} role="tab" aria-selected={active}
                onClick={() => set('category', c)}
                className={cx(
                  'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors',
                  active ? 'border-obsidian bg-obsidian text-ivory' : 'border-line text-graphite hover:border-obsidian hover:text-obsidian',
                )}
              >
                {c ?? 'All'}
                {n !== null && <span className={cx('font-mono text-[10px]', active ? 'text-ivory/60' : 'text-muted')}>{n}</span>}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Sort</label>
          <Select id="sort" value={sort} onChange={(e) => set('sort', e.target.value === 'featured' ? null : e.target.value)} className="h-10 w-48 text-sm">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </Select>
        </div>
      </div>

      <div className="mt-8">
        {error ? (
          <Banner>
            We couldn’t load the collection. <button className="underline" onClick={() => reload()}>Retry</button>
          </Banner>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<PackageOpen className="h-6 w-6" />}
            title="Nothing here yet"
            body={valid ? `There are no ${valid.toLowerCase()} products in the line-up right now.` : 'The collection is empty right now.'}
            action={<Button variant="secondary" onClick={() => set('category', null)}>View all products</Button>}
          />
        ) : (
          <>
            <p className="mb-6 text-[13px] text-muted" aria-live="polite">{products.length} product{products.length === 1 ? '' : 's'}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-3">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
