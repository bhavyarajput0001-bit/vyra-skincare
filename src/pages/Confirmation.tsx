import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { api } from '../lib/api';
import type { Order } from '../lib/types';
import { dateTime, money } from '../lib/format';
import { useDocumentTitle } from '../lib/hooks';
import { buttonClass, EmptyState, Eyebrow, Skeleton } from '../components/ui';

export default function Confirmation() {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  useDocumentTitle('Order confirmed');

  useEffect(() => {
    api.getOrder(id).then(setOrder);
  }, [id]);

  if (order === undefined) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-5 py-24" aria-busy="true">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (order === null) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24">
        <EmptyState title="Order not found" body="We couldn’t find that demo order in this browser." action={<Link to="/shop" className={buttonClass('primary')}>Back to shop</Link>} />
      </div>
    );
  }

  const c = order.customer;
  return (
    <div className="mx-auto max-w-[1100px] px-5 pb-28 pt-14 md:px-10 md:pt-20">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }} className="grid h-16 w-16 place-items-center rounded-full bg-obsidian text-ivory">
        <Check className="h-7 w-7" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.8 }}>
        <Eyebrow className="mt-8 text-muted">Order {order.number} · {dateTime(order.createdAt)}</Eyebrow>
        <h1 className="mt-4 font-serif text-6xl leading-[0.9] md:text-8xl">
          Thank you, <em className="text-rose">{c.firstName}.</em>
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-graphite">
          Your demo order has been received and saved. Inventory has been updated in the studio dashboard.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 border border-line bg-stone px-4 py-2 text-[13px] text-graphite">
          <span className="h-1.5 w-1.5 rounded-full bg-rose" /> Demo only — no payment was taken and nothing will ship.
        </div>
      </motion.div>

      <div className="mt-14 grid gap-10 border-t border-obsidian pt-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <Eyebrow>Items</Eyebrow>
          <ul className="mt-4 divide-y divide-line">
            {order.items.map((i) => (
              <li key={i.productId} className="flex items-center gap-4 py-4">
                <img src={i.image} alt="" className="h-20 w-16 object-cover" />
                <div className="flex-1">
                  <p className="font-serif text-2xl leading-none">{i.name}</p>
                  <p className="mt-1 text-[13px] text-muted">{i.descriptor} · Qty {i.qty}</p>
                </div>
                <p className="font-mono text-sm">{money(i.price * i.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[15px]">
            <div className="flex justify-between"><dt className="text-graphite">Subtotal</dt><dd className="font-mono">{money(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-graphite">Shipping</dt><dd className="font-mono">{order.shipping === 0 ? 'Free' : money(order.shipping)}</dd></div>
            <div className="flex justify-between border-t border-obsidian pt-3"><dt className="font-serif text-2xl">Total</dt><dd className="font-mono text-xl">{money(order.total)}</dd></div>
          </dl>
        </div>
        <div className="space-y-8 md:col-span-5">
          <div>
            <Eyebrow>Shipping to</Eyebrow>
            <address className="mt-4 not-italic leading-relaxed text-graphite">
              {c.firstName} {c.lastName}<br />
              {c.address}{c.apartment && `, ${c.apartment}`}<br />
              {c.city} {c.postalCode}<br />
              {c.country}
            </address>
          </div>
          <div>
            <Eyebrow>Contact</Eyebrow>
            <p className="mt-4 text-graphite">{c.email}{c.phone && <><br />{c.phone}</>}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/shop" className={buttonClass('primary', 'lg', true)}>Continue shopping</Link>
            <Link to="/" className={buttonClass('secondary', 'lg', true)}>Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
