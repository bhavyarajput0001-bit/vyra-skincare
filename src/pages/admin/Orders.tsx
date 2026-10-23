import { useEffect, useState } from 'react';
import { Receipt, ChevronDown } from 'lucide-react';
import { api } from '../../lib/api';
import type { Order } from '../../lib/types';
import { dateTime, money } from '../../lib/format';
import { useDocumentTitle } from '../../lib/hooks';
import { AdminHeader } from './AdminLayout';
import { EmptyState, Skeleton, cx } from '../../components/ui';

export default function Orders() {
  useDocumentTitle('Demo orders');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    api.listOrders().then(setOrders);
  }, []);

  const revenue = orders?.reduce((s, o) => s + o.total, 0) ?? 0;
  const units = orders?.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0) ?? 0;

  return (
    <>
      <AdminHeader eyebrow="Studio · Orders" title="Demo orders" />
      <div className="space-y-6 p-5 md:p-8">
        <section className="grid grid-cols-3 gap-px border border-line bg-line">
          {[
            ['Orders', orders ? String(orders.length) : null],
            ['Units', orders ? String(units) : null],
            ['Demo value', orders ? money(revenue) : null],
          ].map(([l, v]) => (
            <div key={l} className="bg-ivory p-4 md:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{l}</p>
              {v === null ? <Skeleton className="mt-3 h-8 w-16" /> : <p className="mt-2 font-serif text-3xl leading-none md:text-4xl">{v}</p>}
            </div>
          ))}
        </section>
        <p className="text-[12px] text-muted">Demo orders are test records only — no payment was collected.</p>

        {orders === null ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState icon={<Receipt className="h-6 w-6" />} title="No demo orders yet" body="Place an order from the storefront and it will appear here, with inventory updated automatically." />
        ) : (
          <ul className="divide-y divide-line border border-line bg-ivory">
            {orders.map((o) => {
              const isOpen = open === o.id;
              return (
                <li key={o.id}>
                  <button onClick={() => setOpen(isOpen ? null : o.id)} aria-expanded={isOpen} className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-stone/40 md:grid-cols-[140px_1fr_160px_100px_110px_24px]">
                    <span className="font-mono text-[13px]">{o.number}</span>
                    <span className="hidden truncate text-[13px] md:block">{o.customer.firstName} {o.customer.lastName} <span className="text-muted">· {o.customer.email}</span></span>
                    <span className="hidden text-[12px] text-muted md:block">{dateTime(o.createdAt)}</span>
                    <span className="hidden text-[12px] text-muted md:block">{o.items.reduce((a, i) => a + i.qty, 0)} items</span>
                    <span className="text-right font-mono text-[13px]">{money(o.total)}</span>
                    <ChevronDown className={cx('hidden h-4 w-4 transition-transform md:block', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <div className="grid gap-6 border-t border-line bg-stone/40 px-4 py-5 md:grid-cols-2">
                      <ul className="space-y-3">
                        {o.items.map((i) => (
                          <li key={i.productId} className="flex items-center gap-3 text-[13px]">
                            <img src={i.image} alt="" className="h-12 w-10 object-cover" />
                            <span className="flex-1">{i.name} <span className="text-muted">× {i.qty}</span></span>
                            <span className="font-mono">{money(i.price * i.qty)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-[13px] leading-relaxed text-graphite">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Ship to</p>
                        {o.customer.firstName} {o.customer.lastName}<br />
                        {o.customer.address}{o.customer.apartment && `, ${o.customer.apartment}`}, {o.customer.city} {o.customer.postalCode}, {o.customer.country}<br />
                        {o.customer.email}{o.customer.phone && ` · ${o.customer.phone}`}
                        <p className="mt-3 inline-block rounded-full bg-champagne/50 px-2.5 py-1 text-[11px] font-semibold">{o.status}</p>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
