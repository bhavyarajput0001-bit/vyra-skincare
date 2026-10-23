import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Nav } from './Nav';
import { Footer } from './Footer';

export function StoreLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-obsidian focus:px-4 focus:py-2 focus:text-ivory">
        Skip to content
      </a>
      <Nav />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
