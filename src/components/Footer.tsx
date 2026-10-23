import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-obsidian text-ivory">
      <div className="mx-auto max-w-[1440px] px-5 pt-20 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-4xl leading-[1.05] md:text-5xl">
              Luxury skincare.<br />
              <em className="text-champagne">Unfiltered confidence.</em>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm md:col-span-7 md:grid-cols-3">
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ivory/50">Shop</p>
              <ul className="space-y-2.5 text-ivory/80">
                <li><Link className="hover:text-ivory" to="/shop">All products</Link></li>
                <li><Link className="hover:text-ivory" to="/shop?category=Cleanse">Cleanse</Link></li>
                <li><Link className="hover:text-ivory" to="/shop?category=Treat">Treat</Link></li>
                <li><Link className="hover:text-ivory" to="/shop?category=Hydrate">Hydrate</Link></li>
                <li><Link className="hover:text-ivory" to="/shop?category=Protect">Protect</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ivory/50">Brand</p>
              <ul className="space-y-2.5 text-ivory/80">
                <li><Link className="hover:text-ivory" to="/philosophy">Our Philosophy</Link></li>
                <li><Link className="hover:text-ivory" to="/collections">Collections</Link></li>
                <li><Link className="hover:text-ivory" to="/cart">Your bag</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ivory/50">Studio</p>
              <ul className="space-y-2.5 text-ivory/80">
                <li><Link className="hover:text-ivory" to="/admin/login">Admin login</Link></li>
                <li><span className="text-ivory/50">hello@vyraskin.demo</span></li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-16 max-w-3xl border-l border-rose/60 pl-4 text-[13px] leading-relaxed text-ivory/55">
          VYRA SKIN is a proposed brand. All products shown are illustrative concepts in development — not verified commercial
          products. No clinical testing, certification or dermatologist endorsement is claimed. Orders placed here are demos:
          no payment is taken and nothing ships.
        </p>

        <div aria-hidden className="pointer-events-none mt-10 select-none font-serif text-[27vw] leading-[0.75] tracking-[0.02em] text-ivory/[0.07] md:text-[22vw]">
          VYRA
        </div>
        <div className="flex flex-col gap-2 border-t border-ivory/10 py-6 text-[11px] uppercase tracking-[0.18em] text-ivory/45 sm:flex-row sm:justify-between">
          <span>© 2026 VYRA SKIN — Concept</span>
          <span>Your Skin. Your Rules.</span>
        </div>
      </div>
    </footer>
  );
}
