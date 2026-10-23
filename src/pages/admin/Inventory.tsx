import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Loader2, Minus, Pencil, Plus, RotateCcw, Search, Trash2, PackageOpen } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useDocumentTitle, useProducts } from '../../lib/hooks';
import { stockState, type Product } from '../../lib/types';
import { money, shortDate } from '../../lib/format';
import { AdminHeader } from './AdminLayout';
import { Banner, Button, buttonClass, EmptyState, Modal, Select, Skeleton, StockBadge, cx, useToast } from '../../components/ui';

type Filter = 'all' | 'in' | 'low' | 'out' | 'draft';

export default function Inventory() {
  useDocumentTitle('Inventory');
  const { data, loading, error, reload, setData } = useProducts({ includeDrafts: true });
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.listOrders().then((o) => setOrderCount(o.length));
  }, [data]);

  const stats = useMemo(() => {
    const list = data ?? [];
    return {
      skus: list.filter((p) => p.status === 'active').length,
      drafts: list.filter((p) => p.status === 'draft').length,
      units: list.reduce((s, p) => s + p.stock, 0),
      low: list.filter((p) => stockState(p) === 'low'),
      out: list.filter((p) => stockState(p) === 'out'),
      value: list.reduce((s, p) => s + p.stock * p.price, 0),
    };
  }, [data]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((p) => {
      if (term && !`${p.name} ${p.sku} ${p.descriptor} ${p.category}`.toLowerCase().includes(term)) return false;
      if (filter === 'draft') return p.status === 'draft';
      if (filter !== 'all') return stockState(p) === filter;
      return true;
    });
  }, [data, q, filter]);

  const onStockSaved = (p: Product) => setData((prev) => prev?.map((x) => (x.id === p.id ? p : x)) ?? null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.deleteProduct(toDelete.id);
      setData((prev) => prev?.filter((x) => x.id !== toDelete.id) ?? null);
      toast({ tone: 'success', message: `${toDelete.name} deleted` });
      setToDelete(null);
    } catch {
      toast({ tone: 'error', message: 'Could not delete product' });
    } finally {
      setDeleting(false);
    }
  };

  const doReset = async () => {
    setResetting(true);
    await api.resetDemo();
    await reload(true);
    setResetting(false);
    setResetOpen(false);
    toast({ tone: 'success', message: 'Demo data restored' });
  };

  return (
    <>
      <AdminHeader
        eyebrow="Studio · Inventory"
        title="Inventory"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setResetOpen(true)}><RotateCcw className="h-3.5 w-3.5" /> Reset demo</Button>
            <Link to="/admin/products/new" className={buttonClass('primary', 'sm')}><Plus className="h-3.5 w-3.5" /> Add product</Link>
          </>
        }
      />

      <div className="space-y-6 p-5 md:p-8">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-5" aria-label="Inventory summary">
          {[
            { label: 'Active SKUs', value: loading ? null : String(stats.skus), sub: stats.drafts ? `${stats.drafts} draft` : 'No drafts' },
            { label: 'Units on hand', value: loading ? null : stats.units.toLocaleString(), sub: 'Across all products' },
            { label: 'Low stock', value: loading ? null : String(stats.low.length), sub: 'At or below threshold', tone: stats.low.length ? 'text-warn' : '' },
            { label: 'Out of stock', value: loading ? null : String(stats.out.length), sub: 'Unavailable to buy', tone: stats.out.length ? 'text-danger' : '' },
            { label: 'Stock value (retail)', value: loading ? null : money(stats.value), sub: orderCount === null ? '—' : `${orderCount} demo order${orderCount === 1 ? '' : 's'}` },
          ].map((s, i) => (
            <div key={s.label} className={cx('bg-ivory p-4 md:p-5', i === 4 && 'col-span-2 lg:col-span-1')}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{s.label}</p>
              {s.value === null ? <Skeleton className="mt-3 h-8 w-16" /> : <p className={cx('mt-2 font-serif text-4xl leading-none tabular-nums', s.tone)}>{s.value}</p>}
              <p className="mt-2 text-[12px] text-muted">{s.sub}</p>
            </div>
          ))}
        </section>

        {/* Alerts */}
        {!loading && (stats.low.length > 0 || stats.out.length > 0) && (
          <section className="flex flex-col gap-3 border border-warn/30 bg-warn/[0.06] p-4 md:flex-row md:items-center" aria-label="Stock alerts">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-warn">
              <AlertTriangle className="h-4 w-4" /> Needs attention
            </div>
            <div className="flex flex-wrap gap-2">
              {[...stats.out, ...stats.low].map((p) => (
                <Link key={p.id} to={`/admin/products/${p.id}/edit`} className="inline-flex items-center gap-2 rounded-full border border-line bg-ivory py-1 pl-1 pr-3 text-[12px] hover:border-obsidian">
                  <img src={p.image} alt="" className="h-6 w-6 rounded-full object-cover" />
                  {p.name}
                  <span className={cx('font-mono', p.stock === 0 ? 'text-danger' : 'text-warn')}>{p.stock}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <label htmlFor="inv-search" className="sr-only">Search products</label>
            <input id="inv-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, SKU, category…" className="h-10 w-full border border-line bg-ivory pl-9 pr-3 text-sm focus:border-obsidian focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="inv-filter" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Show</label>
            <Select id="inv-filter" value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="h-10 w-44 bg-ivory text-sm">
              <option value="all">All products</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
              <option value="draft">Drafts</option>
            </Select>
          </div>
        </div>

        {error ? (
          <Banner>Couldn’t load inventory. <button className="underline" onClick={() => reload()}>Retry</button></Banner>
        ) : loading ? (
          <div className="space-y-px border border-line bg-line">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 bg-ivory p-4"><Skeleton className="h-12 w-10" /><Skeleton className="h-4 flex-1" /><Skeleton className="h-4 w-24" /></div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<PackageOpen className="h-6 w-6" />}
            title={data?.length ? 'No matches' : 'No products yet'}
            body={data?.length ? 'Try a different search or filter.' : 'Add your first product to start tracking inventory.'}
            action={data?.length ? <Button variant="secondary" onClick={() => { setQ(''); setFilter('all'); }}>Clear filters</Button> : <Link to="/admin/products/new" className={buttonClass('primary')}>Add product</Link>}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto border border-line bg-ivory md:block">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-line bg-stone/60 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3">Product</th>
                    <th scope="col" className="px-4 py-3">SKU</th>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3 text-right">Price</th>
                    <th scope="col" className="px-4 py-3">Stock</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Updated</th>
                    <th scope="col" className="px-4 py-3 text-right"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-stone/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt="" className="h-12 w-10 object-cover" />
                          <div className="min-w-0">
                            <p className="font-serif text-lg leading-none">{p.name}</p>
                            <p className="mt-1 truncate text-[12px] text-muted">{p.descriptor}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-graphite">{p.sku}</td>
                      <td className="px-4 py-3 text-graphite">{p.category}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{money(p.price)}</td>
                      <td className="px-4 py-3"><StockEditor product={p} onSaved={onStockSaved} /></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <StockBadge state={stockState(p)} stock={p.stock} compact />
                          {p.status === 'draft' && <span className="text-[11px] text-muted">Draft · hidden</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted whitespace-nowrap">{shortDate(p.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link to={`/admin/products/${p.id}/edit`} className="grid h-8 w-8 place-items-center text-graphite hover:bg-stone hover:text-obsidian" aria-label={`Edit ${p.name}`}><Pencil className="h-3.5 w-3.5" /></Link>
                          <button onClick={() => setToDelete(p)} className="grid h-8 w-8 place-items-center text-graphite hover:bg-danger/10 hover:text-danger" aria-label={`Delete ${p.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="space-y-3 md:hidden">
              {rows.map((p) => (
                <li key={p.id} className="border border-line bg-ivory p-4">
                  <div className="flex gap-3">
                    <img src={p.image} alt="" className="h-16 w-14 object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-serif text-xl leading-none">{p.name}</p>
                        <StockBadge state={stockState(p)} stock={p.stock} compact />
                      </div>
                      <p className="mt-1 text-[12px] text-muted">{p.sku} · {p.category} · <span className="font-mono">{money(p.price)}</span></p>
                      {p.status === 'draft' && <p className="mt-1 text-[11px] text-muted">Draft · hidden from store</p>}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <StockEditor product={p} onSaved={onStockSaved} />
                    <div className="flex gap-1">
                      <Link to={`/admin/products/${p.id}/edit`} className="grid h-9 w-9 place-items-center border border-line" aria-label={`Edit ${p.name}`}><Pencil className="h-3.5 w-3.5" /></Link>
                      <button onClick={() => setToDelete(p)} className="grid h-9 w-9 place-items-center border border-line text-danger" aria-label={`Delete ${p.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-[12px] text-muted">Showing {rows.length} of {data?.length ?? 0} products. Stock edits save automatically.</p>
          </>
        )}
      </div>

      <Modal open={!!toDelete} onClose={() => !deleting && setToDelete(null)} title="Delete product?">
        <p className="text-[15px] text-graphite">
          <strong className="font-semibold">{toDelete?.name}</strong> will be removed from the catalogue and inventory. Existing demo orders are kept. This can’t be undone.
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setToDelete(null)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>

      <Modal open={resetOpen} onClose={() => !resetting && setResetOpen(false)} title="Reset demo data?">
        <p className="text-[15px] text-graphite">Restores the six original product concepts and stock levels, and clears all demo orders and subscribers.</p>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setResetOpen(false)} disabled={resetting}>Cancel</Button>
          <Button loading={resetting} onClick={doReset}>Reset</Button>
        </div>
      </Modal>
    </>
  );
}

function StockEditor({ product, onSaved }: { product: Product; onSaved: (p: Product) => void }) {
  const [value, setValue] = useState(String(product.stock));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(false);
  const toast = useToast();

  useEffect(() => setValue(String(product.stock)), [product.stock]);

  const commit = async (n: number) => {
    if (n === product.stock) return;
    if (!Number.isInteger(n) || n < 0) {
      setErr(true);
      setValue(String(product.stock));
      toast({ tone: 'error', message: 'Stock must be a whole number ≥ 0' });
      return;
    }
    setErr(false);
    setValue(String(n));
    setSaving(true);
    try {
      const p = await api.setStock(product.id, n);
      onSaved({ ...p });
    } catch (e) {
      setValue(String(product.stock));
      toast({ tone: 'error', message: e instanceof ApiError ? e.message : 'Could not update stock' });
    } finally {
      setSaving(false);
    }
  };

  const n = Number(value);
  return (
    <div className="flex items-center gap-2">
      <div className={cx('inline-flex h-8 items-stretch border bg-ivory', err ? 'border-danger' : 'border-line')}>
        <button className="grid w-7 place-items-center hover:bg-stone disabled:opacity-30" onClick={() => commit(Math.max(0, product.stock - 1))} disabled={saving || product.stock <= 0} aria-label={`Decrease stock for ${product.name}`}><Minus className="h-3 w-3" /></button>
        <input
          type="number" min={0} inputMode="numeric" value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => commit(n)}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setValue(String(product.stock)); }}
          className="w-12 border-x border-line bg-transparent text-center font-mono text-[13px] tabular-nums focus:outline-none"
          aria-label={`Stock for ${product.name}`}
          disabled={saving}
        />
        <button className="grid w-7 place-items-center hover:bg-stone disabled:opacity-30" onClick={() => commit(product.stock + 1)} disabled={saving} aria-label={`Increase stock for ${product.name}`}><Plus className="h-3 w-3" /></button>
      </div>
      <span className="w-4">{saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" aria-label="Saving" />}</span>
    </div>
  );
}
