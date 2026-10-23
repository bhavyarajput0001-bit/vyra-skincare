import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../lib/cart';
import { FREE_SHIPPING_AT, money } from '../lib/format';
import { useDocumentTitle } from '../lib/hooks';
import { buttonClass, EmptyState, Eyebrow, QtyStepper } from '../components/ui';

export default function Cart() {
  useDocumentTitle('Your bag');
  const { items, setQty, remove, subtotal, shipping, total, count } = useCart();

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" strokeWidth={1.5} />}
          title="Your bag is empty"
          body="Nothing here yet. Start with a ritual — or go straight for the one you’ve been eyeing."
          action={<Link to="/shop" className={buttonClass('primary', 'lg')}>Shop collection <ArrowRight className="h-4 w-4" /></Link>}
        />
      </div>
    );
  }

  const toFree = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100);

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-12 md:px-10 md:pt-16">
      <header className="flex items-end justify-between border-b border-obsidian pb-8">
        <h1 className="font-serif text-6xl leading-none md:text-8xl">Your bag</h1>
        <p className="pb-2 font-mono text-sm text-muted">{count} item{count === 1 ? '' : 's'}</p>
      </header>

      <div className="grid gap-12 pt-8 lg:grid-cols-12">
        <ul className="lg:col-span-8" aria-label="Items in bag">
          <AnimatePresence initial={false}>
            {items.map((i) => (
              <motion.li key={i.productId} layout exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden border-b border-line">
                <div className="grid grid-cols-[88px_1fr] gap-5 py-6 sm:grid-cols-[120px_1fr]">
                  <Link to={`/product/${i.slug}`} className="block bg-stone">
                    <img src={i.image} alt={i.name} className="aspect-[4/5] w-full object-cover" />
                  </Link>
                  <div className="flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link to={`/product/${i.slug}`} className="font-serif text-3xl leading-none hover:text-graphite">{i.name}</Link>
                        <p className="mt-1.5 text-[13px] text-muted">{i.descriptor} · {i.size}</p>
                        <p className="mt-1 font-mono text-[13px] text-graphite">{money(i.price)} each</p>
                      </div>
                      <button onClick={() => remove(i.productId)} className="-mr-2 -mt-1 p-2 text-muted transition-colors hover:text-danger" aria-label={`Remove ${i.name} from bag`}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <QtyStepper value={i.qty} max={i.maxQty} onChange={(n) => setQty(i.productId, n)} size="sm" label={`Quantity for ${i.name}`} />
                        {i.qty >= i.maxQty && <p className="mt-1.5 text-[11px] text-warn">Max available ({i.maxQty})</p>}
                      </div>
                      <p className="font-mono text-base tabular-nums">{money(i.price * i.qty)}</p>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          <Link to="/shop" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] hover:text-graphite">← Continue shopping</Link>
        </ul>

        <aside className="lg:col-span-4" aria-label="Order summary">
          <div className="bg-stone p-6 md:p-8 lg:sticky lg:top-28">
            <Eyebrow>Summary</Eyebrow>
            <div className="mt-6">
              <p className="text-[13px] text-graphite">
                {toFree > 0 ? <>You’re <span className="font-mono">{money(toFree)}</span> away from free demo shipping.</> : 'You’ve unlocked free demo shipping.'}
              </p>
              <div className="mt-3 h-[3px] w-full bg-line" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
                <div className="h-full bg-obsidian transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <dl className="mt-8 space-y-3 text-[15px]">
              <div className="flex justify-between"><dt className="text-graphite">Subtotal</dt><dd className="font-mono tabular-nums">{money(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-graphite">Shipping</dt><dd className="font-mono tabular-nums">{shipping === 0 ? 'Free' : money(shipping)}</dd></div>
              <div className="flex justify-between"><dt className="text-graphite">Tax</dt><dd className="text-muted">Not applicable (demo)</dd></div>
              <div className="flex items-baseline justify-between border-t border-obsidian pt-4"><dt className="font-serif text-2xl">Total</dt><dd className="font-mono text-xl tabular-nums">{money(total)}</dd></div>
            </dl>
            <Link to="/checkout" className={`${buttonClass('primary', 'lg', true)} mt-8`}>Checkout <ArrowRight className="h-4 w-4" /></Link>
            <p className="mt-4 text-center text-[12px] text-muted">Demo checkout — no payment details are requested.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
