import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Boxes, ExternalLink, LogOut, PlusSquare, Receipt } from 'lucide-react';
import { api } from '../../lib/api';
import { Wordmark } from '../../components/Wordmark';
import { cx } from '../../components/ui';

const nav = [
  { to: '/admin', label: 'Inventory', icon: Boxes, end: true },
  { to: '/admin/orders', label: 'Demo orders', icon: Receipt },
  { to: '/admin/products/new', label: 'Add product', icon: PlusSquare },
];

export default function AdminLayout() {
  const loc = useLocation();
  const navigate = useNavigate();
  if (!api.isAuthed()) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;

  const signOut = () => {
    api.logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F3EEE6] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 z-30 flex flex-col bg-obsidian text-ivory lg:h-screen">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-6 lg:py-7">
          <Link to="/admin" className="block">
            <Wordmark tone="light" />
            <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.3em] text-champagne lg:block">Studio</span>
          </Link>
          <button onClick={signOut} className="p-2 text-ivory/70 hover:text-ivory lg:hidden" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-ivory/10 px-3 py-2 lg:flex-1 lg:flex-col lg:border-0 lg:px-3 lg:py-0" aria-label="Studio">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                cx('flex shrink-0 items-center gap-3 px-3 py-2.5 text-[13px] transition-colors', isActive ? 'bg-ivory/10 text-ivory' : 'text-ivory/60 hover:bg-ivory/5 hover:text-ivory')
              }
            >
              <Icon className="h-4 w-4" strokeWidth={1.6} /> {label}
            </NavLink>
          ))}
          <Link to="/" target="_blank" className="flex shrink-0 items-center gap-3 px-3 py-2.5 text-[13px] text-ivory/60 hover:text-ivory lg:mt-auto">
            <ExternalLink className="h-4 w-4" strokeWidth={1.6} /> View storefront
          </Link>
        </nav>
        <div className="hidden border-t border-ivory/10 p-4 lg:block">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-champagne font-serif text-lg text-obsidian">A</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px]">Studio Admin</p>
              <p className="truncate text-[11px] text-ivory/50">Demo account</p>
            </div>
            <button onClick={signOut} className="p-2 text-ivory/60 hover:text-ivory" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminHeader({ eyebrow, title, actions }: { eyebrow: string; title: string; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 border-b border-line bg-ivory px-5 py-6 md:flex-row md:items-end md:justify-between md:px-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-4xl leading-none md:text-5xl">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
