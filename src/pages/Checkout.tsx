import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useCart } from '../lib/cart';
import { money } from '../lib/format';
import { useDocumentTitle } from '../lib/hooks';
import type { Customer } from '../lib/types';
import { Banner, Button, Eyebrow, Field, Input, Select } from '../components/ui';

const empty: Customer = { firstName: '', lastName: '', email: '', phone: '', address: '', apartment: '', city: '', postalCode: '', country: 'United States' };
type Errors = Partial<Record<keyof Customer, string>>;

function validate(c: Customer): Errors {
  const e: Errors = {};
  if (!c.firstName.trim()) e.firstName = 'Enter your first name.';
  if (!c.lastName.trim()) e.lastName = 'Enter your last name.';
  if (!c.email.trim()) e.email = 'Enter your email.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email)) e.email = 'Enter a valid email, like you@example.com.';
  if (c.phone && !/^[+\d][\d\s().-]{6,}$/.test(c.phone)) e.phone = 'Enter a valid phone number.';
  if (!c.address.trim()) e.address = 'Enter your street address.';
  if (!c.city.trim()) e.city = 'Enter your city.';
  if (!c.postalCode.trim()) e.postalCode = 'Enter a postal code.';
  return e;
}

export default function Checkout() {
  useDocumentTitle('Checkout');
  const { items, subtotal, shipping, total, clear } = useCart();
  const [form, setForm] = useState<Customer>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!items.length && !submitting) return <Navigate to="/cart" replace />;

  const bind = (k: keyof Customer) => ({
    id: k,
    name: k,
    value: form[k],
    'aria-invalid': !!errors[k],
    'aria-describedby': errors[k] ? `${k}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
    },
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const order = await api.placeOrder(form, items.map((i) => ({ productId: i.productId, qty: i.qty })));
      clear();
      navigate(`/order/${order.id}`, { replace: true });
    } catch (err) {
      setSubmitting(false);
      setServerError(err instanceof ApiError ? err.message : 'We couldn’t place your order. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-12 md:px-10 md:pt-16">
      <header className="border-b border-obsidian pb-8">
        <Eyebrow className="text-muted">Bag → <span className="text-obsidian">Details</span> → Confirmation</Eyebrow>
        <h1 className="mt-4 font-serif text-6xl leading-none md:text-8xl">Checkout</h1>
      </header>

      <div className="grid gap-12 pt-10 lg:grid-cols-12">
        <form onSubmit={submit} noValidate className="space-y-12 lg:col-span-7" aria-label="Checkout form">
          {serverError && (
            <Banner onClose={() => setServerError(null)}>
              {serverError} <Link to="/cart" className="font-semibold underline">Review bag</Link>
            </Banner>
          )}

          <fieldset>
            <legend className="mb-6 font-serif text-3xl">Contact</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email" htmlFor="email" error={errors.email} className="sm:col-span-2">
                <Input type="email" autoComplete="email" placeholder="you@example.com" {...bind('email')} />
              </Field>
              <Field label="Phone" htmlFor="phone" error={errors.phone} optional className="sm:col-span-2">
                <Input type="tel" autoComplete="tel" placeholder="+1 555 000 0000" {...bind('phone')} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-6 font-serif text-3xl">Shipping address</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" htmlFor="firstName" error={errors.firstName}>
                <Input autoComplete="given-name" {...bind('firstName')} />
              </Field>
              <Field label="Last name" htmlFor="lastName" error={errors.lastName}>
                <Input autoComplete="family-name" {...bind('lastName')} />
              </Field>
              <Field label="Address" htmlFor="address" error={errors.address} className="sm:col-span-2">
                <Input autoComplete="address-line1" {...bind('address')} />
              </Field>
              <Field label="Apartment, suite" htmlFor="apartment" optional className="sm:col-span-2">
                <Input autoComplete="address-line2" {...bind('apartment')} />
              </Field>
              <Field label="City" htmlFor="city" error={errors.city}>
                <Input autoComplete="address-level2" {...bind('city')} />
              </Field>
              <Field label="Postal code" htmlFor="postalCode" error={errors.postalCode}>
                <Input autoComplete="postal-code" {...bind('postalCode')} />
              </Field>
              <Field label="Country" htmlFor="country" className="sm:col-span-2">
                <Select autoComplete="country-name" {...bind('country')}>
                  {['United States', 'Canada', 'United Kingdom', 'Ireland', 'Australia', 'New Zealand', 'Germany', 'France', 'Netherlands', 'Singapore'].map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-6 font-serif text-3xl">Payment</legend>
            <div className="flex items-start gap-4 border border-dashed border-line bg-stone/60 p-5">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-graphite" />
              <div>
                <p className="font-medium">No payment required — demo checkout</p>
                <p className="mt-1 text-[14px] text-muted">
                  This storefront doesn’t process payments. Placing an order saves a demo record and updates inventory. You won’t be charged and nothing will ship.
                </p>
              </div>
            </div>
          </fieldset>

          <Button type="submit" size="lg" full loading={submitting}>Place demo order — {money(total)}</Button>
        </form>

        <aside className="lg:col-span-5" aria-label="Order summary">
          <div className="bg-stone p-6 md:p-8 lg:sticky lg:top-28">
            <div className="flex items-center justify-between">
              <Eyebrow>In your bag</Eyebrow>
              <Link to="/cart" className="text-[12px] underline text-graphite hover:text-obsidian">Edit</Link>
            </div>
            <ul className="mt-6 divide-y divide-line">
              {items.map((i) => (
                <li key={i.productId} className="flex items-center gap-4 py-4">
                  <div className="relative">
                    <img src={i.image} alt="" className="h-20 w-16 object-cover" />
                    <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-obsidian px-1 font-mono text-[10px] text-ivory">{i.qty}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-xl leading-none">{i.name}</p>
                    <p className="mt-1 text-[12px] text-muted">{i.descriptor}</p>
                  </div>
                  <p className="font-mono text-sm tabular-nums">{money(i.price * i.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-3 border-t border-line pt-5 text-[15px]">
              <div className="flex justify-between"><dt className="text-graphite">Subtotal</dt><dd className="font-mono">{money(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-graphite">Shipping</dt><dd className="font-mono">{shipping === 0 ? 'Free' : money(shipping)}</dd></div>
              <div className="flex items-baseline justify-between border-t border-obsidian pt-4"><dt className="font-serif text-2xl">Total</dt><dd className="font-mono text-xl">{money(total)}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
