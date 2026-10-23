import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import type { Product } from '../lib/types';
import { stockState } from '../lib/types';
import { money } from '../lib/format';
import { useCart } from '../lib/cart';
import { cx, useToast, Skeleton } from './ui';

export function ProductCard({ product, index }: { product: Product; index?: number }) {
  const { add, items } = useCart();
  const toast = useToast();
  const [added, setAdded] = useState(false);
  const state = stockState(product);
  const inBag = items.find((i) => i.productId === product.id)?.qty ?? 0;
  const atMax = inBag >= product.stock;

  const quickAdd = () => {
    if (state === 'out' || atMax) return;
    add(product, 1);
    setAdded(true);
    toast({ tone: 'success', message: `${product.name} added to bag`, detail: `${product.descriptor} · ${money(product.price)}`, image: product.image });
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group relative flex flex-col">
      <div className="relative">
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-stone" aria-label={`${product.name}, ${product.descriptor}`}>
        <img
          src={product.image}
          alt={`${product.name} ${product.descriptor} — concept packaging`}
          loading="lazy"
          className={cx('h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]', state === 'out' && 'grayscale-[40%] opacity-80')}
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {typeof index === 'number' && (
            <span className="font-mono text-[10px] tracking-widest text-obsidian/70">{String(index + 1).padStart(2, '0')}</span>
          )}
        </div>
        <div className="absolute right-3 top-3">
          {state === 'out' ? (
            <span className="rounded-full bg-obsidian px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory">Sold out</span>
          ) : state === 'low' ? (
            <span className="rounded-full bg-ivory/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-warn">Only {product.stock} left</span>
          ) : null}
        </div>
      </Link>

      <button
        type="button"
        onClick={quickAdd}
        disabled={state === 'out' || atMax}
        className={cx(
          'absolute inset-x-3 bottom-3 flex h-10 md:h-11 items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-300',
          'bg-obsidian text-ivory hover:bg-graphite disabled:bg-graphite/80 disabled:cursor-not-allowed',
          'opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:focus-visible:opacity-100 md:focus-visible:translate-y-0',
        )}
        aria-label={state === 'out' ? `${product.name} is sold out` : `Quick add ${product.name} to bag`}
      >
        {added ? <><Check className="h-3.5 w-3.5" /> Added</> : state === 'out' ? 'Sold out' : atMax ? 'Max in bag' : <><Plus className="h-3.5 w-3.5" /> Quick add</>}
      </button>
      </div>

      <div className="flex items-start justify-between gap-4 pt-4">
        <div className="min-w-0">
          <h3 className="font-serif text-[26px] leading-none">
            <Link to={`/product/${product.slug}`} className="hover:text-graphite">{product.name}</Link>
          </h3>
          <p className="mt-1.5 text-[13px] text-muted">{product.descriptor} · {product.size}</p>
        </div>
        <p className="pt-1 font-mono text-sm tabular-nums">{money(product.price)}</p>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="mt-4 h-6 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </div>
  );
}
