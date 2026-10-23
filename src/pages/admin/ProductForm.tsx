import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ImageOff } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useDocumentTitle } from '../../lib/hooks';
import { IMAGE_LIBRARY } from '../../lib/seed';
import { CATEGORIES, stockState, type Category, type ProductInput, type ProductStatus } from '../../lib/types';
import { money } from '../../lib/format';
import { AdminHeader } from './AdminLayout';
import { Banner, Button, buttonClass, EmptyState, Field, Input, Select, Skeleton, StockBadge, Textarea, cx, useToast } from '../../components/ui';

interface FormState {
  name: string; descriptor: string; category: Category; status: ProductStatus;
  price: string; size: string; sku: string; stock: string; lowStockThreshold: string;
  image: string; shortDescription: string; description: string; keyIngredients: string;
  howToUse: string; skinTypes: string; transparencyNote: string; featured: number;
}

const blank: FormState = {
  name: '', descriptor: '', category: 'Treat', status: 'draft', price: '', size: '50 ml', sku: '', stock: '0', lowStockThreshold: '10',
  image: IMAGE_LIBRARY[0], shortDescription: '', description: '', keyIngredients: '', howToUse: '', skinTypes: 'Intended for all skin types', transparencyNote: '', featured: 99,
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Name is required.';
  if (!f.descriptor.trim()) e.descriptor = 'Add a short descriptor, e.g. “Hydrating Serum”.';
  if (!f.sku.trim()) e.sku = 'SKU is required.';
  else if (!/^[A-Za-z0-9-]{3,20}$/.test(f.sku.trim())) e.sku = 'Use 3–20 letters, numbers or hyphens.';
  const price = Number(f.price);
  if (!f.price || !(price > 0)) e.price = 'Enter a price greater than 0.';
  if (f.stock === '' || !Number.isInteger(Number(f.stock)) || Number(f.stock) < 0) e.stock = 'Whole number, 0 or more.';
  if (f.lowStockThreshold === '' || !Number.isInteger(Number(f.lowStockThreshold)) || Number(f.lowStockThreshold) < 0) e.lowStockThreshold = 'Whole number, 0 or more.';
  if (!f.image.trim()) e.image = 'Choose or paste an image.';
  if (!f.shortDescription.trim()) e.shortDescription = 'A one-line summary is required.';
  return e;
}

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  useDocumentTitle(isEdit ? 'Edit product' : 'Add product');
  const [form, setForm] = useState<FormState>(blank);
  const [errors, setErrors] = useState<Errors>({});
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing'>(isEdit ? 'loading' : 'ready');
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [imgBroken, setImgBroken] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!id) return;
    api.getProduct(id).then((p) => {
      if (!p) return setLoadState('missing');
      setForm({
        name: p.name, descriptor: p.descriptor, category: p.category, status: p.status, price: String(p.price), size: p.size, sku: p.sku,
        stock: String(p.stock), lowStockThreshold: String(p.lowStockThreshold), image: p.image, shortDescription: p.shortDescription,
        description: p.description, keyIngredients: p.keyIngredients.join(', '), howToUse: p.howToUse, skinTypes: p.skinTypes,
        transparencyNote: p.transparencyNote ?? '', featured: p.featured,
      });
      setLoadState('ready');
    });
  }, [id]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    if (k === 'image') setImgBroken(false);
  };
  const bind = (k: keyof FormState) => ({
    id: `f-${k}`,
    value: form[k] as string,
    'aria-invalid': !!errors[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value as never),
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    const input: ProductInput = {
      name: form.name.trim(), descriptor: form.descriptor.trim(), category: form.category, status: form.status,
      price: Math.round(Number(form.price) * 100) / 100, size: form.size.trim(), sku: form.sku.trim(),
      stock: Number(form.stock), lowStockThreshold: Number(form.lowStockThreshold), image: form.image.trim(),
      shortDescription: form.shortDescription.trim(), description: form.description.trim() || form.shortDescription.trim(),
      keyIngredients: form.keyIngredients.split(',').map((s) => s.trim()).filter(Boolean),
      howToUse: form.howToUse.trim(), skinTypes: form.skinTypes.trim(),
      transparencyNote: form.transparencyNote.trim() || undefined, featured: form.featured,
    };
    setSaving(true);
    try {
      const saved = isEdit ? await api.updateProduct(id!, input) : await api.createProduct(input);
      toast({ tone: 'success', message: isEdit ? 'Changes saved' : 'Product created', detail: saved.name, image: saved.image });
      navigate('/admin');
    } catch (err) {
      setSaving(false);
      if (err instanceof ApiError && err.field) setErrors((x) => ({ ...x, [err.field as keyof FormState]: err.message }));
      setServerError(err instanceof ApiError ? err.message : 'Could not save product.');
    }
  };

  if (loadState === 'missing') {
    return (
      <div className="p-8">
        <EmptyState title="Product not found" body="It may have been deleted." action={<Link to="/admin" className={buttonClass('primary')}>Back to inventory</Link>} />
      </div>
    );
  }

  const previewStock = { stock: Number(form.stock) || 0, lowStockThreshold: Number(form.lowStockThreshold) || 0 };

  return (
    <>
      <AdminHeader
        eyebrow={isEdit ? 'Studio · Edit product' : 'Studio · New product'}
        title={isEdit ? (form.name || 'Edit product') : 'Add product'}
        actions={<Link to="/admin" className={buttonClass('ghost', 'sm')}><ArrowLeft className="h-3.5 w-3.5" /> Inventory</Link>}
      />
      {loadState === 'loading' ? (
        <div className="grid gap-6 p-5 md:p-8 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-6 p-5 md:p-8 xl:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {serverError && <Banner onClose={() => setServerError(null)}>{serverError}</Banner>}

            <Section title="Basics">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Product name" htmlFor="f-name" error={errors.name}><Input placeholder="e.g. Glass Skin" {...bind('name')} /></Field>
                <Field label="Descriptor" htmlFor="f-descriptor" error={errors.descriptor}><Input placeholder="e.g. Hydrating Serum" {...bind('descriptor')} /></Field>
                <Field label="Category" htmlFor="f-category">
                  <Select {...bind('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
                </Field>
                <Field label="Visibility" htmlFor="f-status" hint={form.status === 'draft' ? 'Hidden from the storefront.' : 'Visible and purchasable in the storefront.'}>
                  <Select {...bind('status')}><option value="active">Active</option><option value="draft">Draft</option></Select>
                </Field>
              </div>
            </Section>

            <Section title="Pricing & inventory">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Price (USD)" htmlFor="f-price" error={errors.price}><Input type="number" step="0.01" min="0" inputMode="decimal" placeholder="0.00" {...bind('price')} /></Field>
                <Field label="Size" htmlFor="f-size"><Input placeholder="50 ml" {...bind('size')} /></Field>
                <Field label="SKU" htmlFor="f-sku" error={errors.sku}><Input className="font-mono uppercase" placeholder="VY-XX-000" {...bind('sku')} /></Field>
                <Field label="Stock on hand" htmlFor="f-stock" error={errors.stock}><Input type="number" min="0" step="1" inputMode="numeric" {...bind('stock')} /></Field>
                <Field label="Low-stock threshold" htmlFor="f-lowStockThreshold" error={errors.lowStockThreshold} hint="Flag when stock is at or below this."><Input type="number" min="0" step="1" inputMode="numeric" {...bind('lowStockThreshold')} /></Field>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-graphite">Stock status</span>
                  <div className="flex h-12 items-center"><StockBadge state={stockState(previewStock)} stock={previewStock.stock} /></div>
                </div>
              </div>
            </Section>

            <Section title="Media">
              <Field label="Product image" htmlFor="f-image" error={errors.image} hint="Choose from the concept library or paste an image URL.">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="Image library">
                  {IMAGE_LIBRARY.map((src) => {
                    const active = form.image === src;
                    return (
                      <button type="button" key={src} role="radio" aria-checked={active} onClick={() => set('image', src)} className={cx('relative aspect-[4/5] overflow-hidden border-2 transition-colors', active ? 'border-obsidian' : 'border-transparent hover:border-line')}>
                        <img src={src} alt={src.split('/').pop()?.replace('.jpg', '').replace('-', ' ')} className="h-full w-full object-cover" />
                        {active && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-obsidian text-ivory"><Check className="h-3 w-3" /></span>}
                      </button>
                    );
                  })}
                </div>
                <Input className="mt-2 font-mono text-[13px]" placeholder="https://… or /images/…" {...bind('image')} />
              </Field>
            </Section>

            <Section title="Content">
              <div className="grid gap-5">
                <Field label="Short description" htmlFor="f-shortDescription" error={errors.shortDescription} hint="Shown on product cards and at the top of the product page. Avoid efficacy claims.">
                  <Textarea className="min-h-20" {...bind('shortDescription')} />
                </Field>
                <Field label="Full description" htmlFor="f-description" optional><Textarea {...bind('description')} /></Field>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Proposed key ingredients" htmlFor="f-keyIngredients" hint="Comma-separated." optional><Input placeholder="Glycerin, Squalane" {...bind('keyIngredients')} /></Field>
                  <Field label="Skin types" htmlFor="f-skinTypes" optional><Input {...bind('skinTypes')} /></Field>
                </div>
                <Field label="How to use" htmlFor="f-howToUse" optional><Textarea className="min-h-20" {...bind('howToUse')} /></Field>
                <Field label="Transparency note" htmlFor="f-transparencyNote" optional hint="Use for regulated claims that are targets, not verified results (e.g. SPF)."><Textarea className="min-h-20" {...bind('transparencyNote')} /></Field>
              </div>
            </Section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="border border-line bg-ivory p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Storefront preview</p>
              <div className="mt-4 aspect-[4/5] overflow-hidden bg-stone">
                {imgBroken || !form.image ? (
                  <div className="grid h-full place-items-center text-muted"><div className="text-center"><ImageOff className="mx-auto h-6 w-6" /><p className="mt-2 text-[12px]">Image unavailable</p></div></div>
                ) : (
                  <img src={form.image} alt="Preview" onError={() => setImgBroken(true)} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-serif text-2xl leading-none">{form.name || 'Product name'}</p>
                  <p className="mt-1 truncate text-[12px] text-muted">{form.descriptor || 'Descriptor'} · {form.size}</p>
                </div>
                <p className="font-mono text-sm">{Number(form.price) > 0 ? money(Number(form.price)) : '$—'}</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <StockBadge state={stockState(previewStock)} stock={previewStock.stock} compact />
                <span className="text-[11px] text-muted">{form.status === 'draft' ? 'Draft' : 'Active'}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit" size="lg" full loading={saving}>{isEdit ? 'Save changes' : 'Create product'}</Button>
              <Link to="/admin" className={buttonClass('secondary', 'lg', true)}>Cancel</Link>
            </div>
          </aside>
        </form>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-ivory">
      <h2 className="border-b border-line px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-graphite">{title}</h2>
      <div className="p-5">{children}</div>
    </section>
  );
}
