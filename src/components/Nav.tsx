import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../lib/cart';
import { Wordmark } from './Wordmark';
import { cx } from './ui';

const links = [
  { to: '/shop', label: 'Shop' },
  { to: '/collections', label: 'Collections' },
  { to: '/philosophy', label: 'Our Philosophy' },
];

export function Nav() {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <>
      <div className="bg-obsidian px-4 py-2 text-center text-[11px] tracking-[0.12em] text-ivory/80">
        Concept storefront — products are proposed concepts. Demo orders only; no payment is taken.
      </div>
      <header className={cx('sticky top-0 z-50 transition-colors duration-500', scrolled || open ? 'bg-ivory/95 border-b border-line' : 'bg-ivory border-b border-transparent')}>
        <nav className="mx-auto grid h-16 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-5 md:h-20 md:px-10" aria-label="Main">
          <div className="flex items-center">
            <button className="-ml-2 p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <ul className="hidden items-center gap-9 md:flex">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      cx('group relative text-[12px] font-medium uppercase tracking-[0.18em] transition-colors', isActive ? 'text-obsidian' : 'text-graphite hover:text-obsidian')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {l.label}
                        <span className={cx('absolute -bottom-1.5 left-0 h-px bg-obsidian transition-all duration-300', isActive ? 'w-full' : 'w-0 group-hover:w-full')} />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <Link to="/" aria-label="VYRA SKIN home">
            <Wordmark />
          </Link>
          <div className="flex items-center justify-end">
            <Link to="/cart" className="group relative -mr-2 flex items-center gap-2 p-2" aria-label={`Shopping bag, ${count} item${count === 1 ? '' : 's'}`}>
              <span className="hidden text-[12px] font-medium uppercase tracking-[0.18em] text-graphite group-hover:text-obsidian sm:inline">Bag</span>
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}
                    className="absolute right-0 top-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose px-1 font-mono text-[10px] font-medium text-obsidian"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-x-0 bottom-0 top-[100px] z-40 flex flex-col justify-between bg-ivory px-6 pb-10 pt-8 md:hidden"
            >
              <ul className="flex flex-col gap-2">
                {[{ to: '/', label: 'Home' }, ...links, { to: '/cart', label: `Bag (${count})` }].map((l, i) => (
                  <motion.li key={l.to} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}>
                    <Link to={l.to} className="block border-b border-line py-4 font-serif text-5xl leading-none">
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Your Skin. Your Rules.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
