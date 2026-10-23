import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { api, ApiError, DEMO_ADMIN } from '../../lib/api';
import { useDocumentTitle } from '../../lib/hooks';
import { Wordmark } from '../../components/Wordmark';
import { Banner, Button, Field, Input } from '../../components/ui';

export default function AdminLogin() {
  useDocumentTitle('Studio sign in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/admin';

  if (api.isAuthed()) return <Navigate to="/admin" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = 'Enter your email.';
    if (!password) errs.password = 'Enter your password.';
    setErrors(errs);
    setError(null);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await api.login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="grain grain-light relative hidden overflow-hidden bg-obsidian text-ivory lg:block">
        <img src="/images/campaign.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[65%_center] opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-obsidian/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Wordmark tone="light" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-champagne">VYRA Studio</p>
            <p className="mt-4 font-serif text-7xl leading-[0.9]">Inventory,<br /><em className="text-rose">unfiltered.</em></p>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-6 py-8 md:px-16">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em] text-graphite hover:text-obsidian">
            <ArrowLeft className="h-4 w-4" /> Storefront
          </Link>
          <span className="lg:hidden"><Wordmark /></span>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="font-serif text-6xl leading-none">Studio sign in</h1>
          <p className="mt-3 text-[15px] text-muted">Manage products, stock levels and demo orders.</p>

          <div className="mt-8 border border-line bg-stone p-4 text-[13px] text-graphite">
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Demo credentials</p>
                <p className="mt-1 font-mono text-[12px]">{DEMO_ADMIN.email}<br />{DEMO_ADMIN.password}</p>
              </div>
              <button type="button" onClick={() => { setEmail(DEMO_ADMIN.email); setPassword(DEMO_ADMIN.password); setErrors({}); setError(null); }} className="text-[12px] font-semibold underline hover:text-obsidian">
                Autofill
              </button>
            </div>
          </div>

          <form onSubmit={submit} noValidate className="mt-8 space-y-5">
            {error && <Banner onClose={() => setError(null)}>{error}</Banner>}
            <Field label="Email" htmlFor="admin-email" error={errors.email}>
              <Input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
            </Field>
            <Field label="Password" htmlFor="admin-password" error={errors.password}>
              <Input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} />
            </Field>
            <Button type="submit" size="lg" full loading={loading}>Sign in</Button>
          </form>
        </div>
        <p className="text-[12px] text-muted">Demo authentication only — session is stored in this browser tab.</p>
      </div>
    </div>
  );
}
