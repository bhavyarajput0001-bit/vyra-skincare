import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ShoppingBag, Truck } from 'lucide-react';
import { api } from '../lib/api';
import type { Product } from '../lib/types';
import { stockState } from '../lib/types';
import { FREE_SHIPPING_AT, money } from '../lib/format';
import { useCart } from '../lib/cart';
import { useDocumentTitle, useProducts } from '../lib/hooks';
import { ProductCard } from '../components/ProductCard';
import { Button, buttonClass, ConceptTag, EmptyState, QtyStepper, Skeleton, StockBadge, useToast, cx } from '../components/ui';

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { add, items } = useCart();
  const toast = useToast();
  const { data: all } = useProducts();
  useDocumentTitle(product ? product.name : product === null ? 'Not found' : '');

  useEffect(() => {
    let live = true;
    setProduct(undefined);
    setQty(1);
    api.getProductBySlug(slug).then((p) => live && setProduct(p));
    return () => { live = false; };
  }, [slug]);

  if (product === undefined) {
    return (
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 md:px-10 lg:grid-cols-2" aria-busy="true">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="space-y-4 pt-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="mt-10 h-24 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24">
        <EmptyState title="Product not found" body="This product may have been removed or renamed." action={<Link to="/shop" className={buttonClass('primary')}>Back to shop</Link>} />
      </div>
    );
  }

  const state = stockState(product);
  const inBag = items.find((i) => i.productId === product.id)?.qty ?? 0;
  const available = Math.max(0, product.stock - inBag);

  const onAdd = () => {
    setAdding(true);
    setTimeout(() => {
      add(product, qty);
      setAdding(false);
      setAdded(true);
      toast({ tone: 'success', message: `${qty} × ${product.name} added`, detail: 'View your bag to check out', image: product.image });
      setQty(1);
      setTimeout(() => setAdded(false), 2000);
    }, 450);
  };

  const related = (all ?? []).filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <nav aria-label="Breadcrumb" className="py-6 text-[12px] text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link to="/shop" className="hover:text-obsidian">Shop</Link></li>
            <li aria-hidden>/</li>
            <li><Link to={`/shop?category=${product.category}`} className="hover:text-obsidian">{product.category}</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-obsidian">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 pb-24 lg:grid-cols-12 lg:gap-16">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="lg:col-span-7">
            <div className="grain relative bg-stone lg:sticky lg:top-24">
              <img src={product.image} alt={`${product.name} — concept packaging photography`} className="aspect-[4/5] w-full object-cover" />
              <ConceptTag className="absolute left-4 top-4" />
              <span className="absolute bottom-4 right-4 bg-ivory/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-graphite">Illustrative packaging</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{product.category} · {product.sku}</p>
            <h1 className="mt-4 font-serif text-6xl leading-[0.88] md:text-7xl">{product.name}</h1>
            <p className="mt-3 text-[17px] text-graphite">{product.descriptor}</p>

            <div className="mt-8 flex items-baseline justify-between border-y border-line py-5">
              <p className="font-mono text-2xl tabular-nums">{money(product.price)}</p>
              <p className="text-[13px] text-muted">{product.size}</p>
            </div>

            <p className="mt-6 text-[16px] leading-relaxed text-graphite">{product.shortDescription}</p>

            <div className="mt-8">
              <StockBadge state={state} stock={product.stock} />
            </div>

            <div className="mt-5 flex gap-3">
              {state !== 'out' && available > 0 && (
                <QtyStepper value={qty} onChange={setQty} max={available} />
              )}
              <Button
                size="lg" full loading={adding}
                disabled={state === 'out' || available === 0}
                onClick={onAdd}
                className="flex-1"
              >
                {state === 'out' ? 'Sold out' : available === 0 ? 'All available stock in bag' : added ? <><Check className="h-4 w-4" /> Added to bag</> : <><ShoppingBag className="h-4 w-4" /> Add to bag — {money(product.price * qty)}</>}
              </Button>
            </div>
            {inBag > 0 && (
              <p className="mt-3 text-[13px] text-muted">
                {inBag} already in your bag · <Link to="/cart" className="underline hover:text-obsidian">View bag</Link>
              </p>
            )}
            <p className="mt-5 flex items-center gap-2 text-[13px] text-muted">
              <Truck className="h-4 w-4" /> Demo shipping is free over {money(FREE_SHIPPING_AT)}. Nothing actually ships.
            </p>

            <div className="mt-10 border-t border-obsidian">
              <Accordion title="About this concept" defaultOpen>
                <p>{product.description}</p>
                <p className="mt-3 text-muted">{product.skinTypes}.</p>
              </Accordion>
              <Accordion title="Proposed key ingredients">
                <ul className="space-y-2">
                  {product.keyIngredients.map((k) => (
                    <li key={k} className="flex items-center gap-3"><span className="h-1 w-1 rounded-full bg-rose" />{k}</li>
                  ))}
                </ul>
                <p className="mt-4 text-[13px] text-muted">Ingredients are proposed for this concept and are not a final INCI list. Always check final packaging.</p>
              </Accordion>
              <Accordion title="How to use">
                <p>{product.howToUse}</p>
              </Accordion>
              <Accordion title="Transparency note">
                {product.transparencyNote && <p className="mb-3">{product.transparencyNote}</p>}
                <p>
                  This is an illustrative product concept from a proposed brand. It has not been clinically tested, certified or
                  endorsed by any dermatologist, and no efficacy results are claimed.
                </p>
              </Accordion>
            </div>
          </motion.div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-stone">
          <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10">
            <h2 className="mb-10 font-serif text-5xl leading-none md:text-6xl">Complete the <em className="text-rose">ritual</em></h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-3">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Accordion({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const id = title.replace(/\s+/g, '-').toLowerCase();
  return (
    <div className="border-b border-line">
      <h3>
        <button className="flex w-full items-center justify-between py-5 text-left text-[12px] font-semibold uppercase tracking-[0.18em]" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
          {title}
          <ChevronDown className={cx('h-4 w-4 transition-transform duration-300', open && 'rotate-180')} />
        </button>
      </h3>
      <div id={id} hidden={!open} className="pb-6 text-[15px] leading-relaxed text-graphite">{children}</div>
    </div>
  );
}
