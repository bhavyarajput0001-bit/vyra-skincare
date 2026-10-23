import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { useProducts, useDocumentTitle } from '../lib/hooks';
import { api, ApiError } from '../lib/api';
import { COLLECTIONS } from '../lib/collections';
import { money } from '../lib/format';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { Banner, Button, buttonClass, ConceptTag, Eyebrow, cx } from '../components/ui';

const ease = [0.22, 1, 0.36, 1] as const;
const rise = (d = 0) => ({ initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, delay: d, ease } });
const reveal = { initial: { opacity: 0, y: 32 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.9, ease } };

export default function Home() {
  useDocumentTitle('');
  const { data, loading, error, reload } = useProducts();
  const hero = data?.find((p) => p.slug === 'glass-skin');

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-12 lg:min-h-[calc(100svh-116px)]">
          <div className="relative z-10 flex flex-col justify-between px-5 pb-10 pt-10 md:px-10 lg:col-span-6 lg:pb-14 lg:pt-16">
            <motion.div {...rise(0.05)} className="flex items-center gap-3">
              <span className="h-px w-10 bg-obsidian" />
              <Eyebrow>Luxury Skincare. Unfiltered Confidence.</Eyebrow>
            </motion.div>

            <div className="my-10 lg:my-0">
              <h1 className="font-serif text-[clamp(4.2rem,13vw,11rem)] leading-[0.82] tracking-[-0.02em]">
                <motion.span {...rise(0.15)} className="block">Skin,</motion.span>
                <motion.span {...rise(0.28)} className="block italic text-rose lg:pl-[0.6em]">unfiltered.</motion.span>
              </h1>
              <motion.p {...rise(0.45)} className="mt-8 max-w-md text-[17px] leading-relaxed text-graphite">
                Six considered formulas for the way you actually live. Editorial textures, honest labels and a routine that
                bends to you — never the other way around.
              </motion.p>
              <motion.div {...rise(0.55)} className="mt-10 flex flex-wrap items-center gap-4">
                <Link to="/shop" className={buttonClass('primary', 'lg')}>
                  Shop Collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/philosophy" className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                  <span className="border-b border-obsidian/30 pb-1 transition-colors group-hover:border-obsidian">Our Philosophy</span>
                </Link>
              </motion.div>
            </div>

            <motion.dl {...rise(0.7)} className="grid max-w-md grid-cols-3 border-t border-line pt-5 text-[12px]">
              <div><dt className="text-muted">Formulas</dt><dd className="mt-1 font-serif text-2xl">06</dd></div>
              <div><dt className="text-muted">Rituals</dt><dd className="mt-1 font-serif text-2xl">04</dd></div>
              <div><dt className="text-muted">Status</dt><dd className="mt-1 font-serif text-2xl italic">Concept</dd></div>
            </motion.dl>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease }}
            className="grain relative min-h-[70vh] lg:col-span-6 lg:min-h-0"
          >
            <img src="/images/hero.jpg" alt="Campaign portrait: a young woman with natural, unretouched skin" className="absolute inset-0 h-full w-full object-cover object-[50%_25%]" />
            <div className="absolute left-5 top-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-obsidian/70 md:left-8 md:top-8">
              Campaign 01 — Unfiltered
            </div>
            {hero && (
              <motion.div {...rise(0.9)} className="absolute bottom-5 left-5 right-5 sm:right-auto md:bottom-8 md:left-8">
                <Link to={`/product/${hero.slug}`} className="group flex items-center gap-4 bg-ivory p-3 pr-6 transition-colors hover:bg-stone">
                  <img src={hero.image} alt="" className="h-20 w-16 object-cover" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Worn in campaign</p>
                    <p className="mt-1 font-serif text-2xl leading-none">{hero.name}</p>
                    <p className="mt-1 text-[13px] text-graphite">{hero.descriptor} · <span className="font-mono">{money(hero.price)}</span></p>
                  </div>
                  <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-obsidian bg-obsidian py-4 text-ivory" aria-hidden>
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex shrink-0 items-center">
              {['Your Skin. Your Rules.', 'Unfiltered Confidence', 'Fewer steps, better rituals', 'Honest labels', 'Texture is the point'].map((t) => (
                <span key={t} className="flex items-center font-serif text-2xl italic md:text-3xl">
                  <span className="px-8">{t}</span>
                  <span className="text-sm not-italic text-rose">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* BESTSELLERS */}
      <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32" aria-labelledby="edit-title">
        <div className="mb-14 grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow className="text-muted">01 — The Edit</Eyebrow>
            <h2 id="edit-title" className="mt-4 font-serif text-6xl leading-[0.9] md:text-8xl">
              Curated <em className="text-rose">bestsellers</em>
            </h2>
          </div>
          <div className="md:col-span-5 md:pb-2">
            <p className="text-[15px] leading-relaxed text-graphite">
              Our launch line-up, hand-picked as the first six to try. These are proposed concepts — we’ll only call
              something a bestseller once real people have chosen it.
            </p>
            <Link to="/shop" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] hover:text-graphite">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {error ? (
          <Banner>
            We couldn’t load products. <button onClick={() => reload()} className="underline">Try again</button>
          </Banner>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-3">
            {loading || !data
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : data.slice(0, 6).map((p, i) => (
                  <motion.div key={p.id} {...reveal} transition={{ ...reveal.transition, delay: (i % 3) * 0.08 }}>
                    <ProductCard product={p} index={i} />
                  </motion.div>
                ))}
          </div>
        )}
      </section>

      {/* PHILOSOPHY */}
      <section className="bg-stone" aria-labelledby="philo-title">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 md:px-10 md:py-32 lg:grid-cols-12 lg:gap-16">
          <motion.div {...reveal} className="grain relative lg:col-span-5">
            <img src="/images/philosophy.jpg" alt="Hands holding a drop of clear serum against travertine stone" loading="lazy" className="aspect-[3/4] w-full object-cover" />
            <span className="absolute -bottom-4 right-4 bg-obsidian px-4 py-2 font-serif text-lg italic text-ivory">less, but better.</span>
          </motion.div>
          <div className="flex flex-col justify-center lg:col-span-6 lg:col-start-7">
            <Eyebrow className="text-muted">02 — Our Philosophy</Eyebrow>
            <h2 id="philo-title" className="mt-5 font-serif text-5xl leading-[0.95] md:text-7xl">
              Skincare as self-expression, <em className="text-rose">not self-correction.</em>
            </h2>
            <p className="mt-8 max-w-lg text-[17px] leading-relaxed text-graphite">
              VYRA started with a simple frustration: luxury that talks down, and “fixes” nobody asked for. We’re building
              the opposite — beautiful formulas, plain-spoken labels, and a price that respects your rent.
            </p>
            <ol className="mt-12 divide-y divide-line border-y border-line">
              {[
                ['Fewer, better steps', 'Four rituals. Six formulas. A routine you can actually keep.'],
                ['Honest by default', 'No borrowed white coats, no invented stats. If it isn’t proven, we won’t claim it.'],
                ['Texture is the point', 'If it doesn’t feel good to use, it doesn’t make the line-up.'],
              ].map(([t, b], i) => (
                <li key={t} className="grid grid-cols-[48px_1fr] gap-4 py-5">
                  <span className="font-mono text-xs text-muted pt-1.5">0{i + 1}</span>
                  <div>
                    <p className="font-serif text-2xl leading-tight">{t}</p>
                    <p className="mt-1 text-[14px] text-muted">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link to="/philosophy" className={cx(buttonClass('secondary', 'md'), 'mt-10 self-start')}>
              Read our philosophy
            </Link>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32" aria-labelledby="coll-title">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Eyebrow className="text-muted">03 — Collections</Eyebrow>
            <h2 id="coll-title" className="mt-4 font-serif text-6xl leading-[0.9] md:text-8xl">Shop by ritual</h2>
          </div>
          <Link to="/collections" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] hover:text-graphite">
            All collections <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="border-t border-obsidian">
          {COLLECTIONS.map((c) => {
            const count = data?.filter((p) => p.category === c.category).length;
            return (
              <li key={c.category} className="border-b border-line">
                <Link to={`/shop?category=${c.category}`} className="group grid grid-cols-[1fr_auto] items-center gap-4 py-6 md:grid-cols-[120px_1fr_1.2fr_120px_auto] md:gap-8 md:py-8">
                  <span className="hidden font-mono text-xs text-muted md:block">{c.ritual}</span>
                  <span className="font-serif text-5xl leading-none transition-all duration-500 group-hover:italic group-hover:text-rose md:text-7xl">{c.title}</span>
                  <span className="col-span-2 row-start-2 text-[14px] text-muted md:col-span-1 md:row-start-auto">{c.line}</span>
                  <span className="hidden md:block">
                    <img src={c.image} alt="" loading="lazy" className="h-24 w-20 object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 scale-95 group-hover:scale-100" />
                  </span>
                  <span className="flex items-center gap-3 text-[12px] text-graphite">
                    <span className="font-mono">{count === undefined ? '—' : String(count).padStart(2, '0')}</span>
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-line transition-colors group-hover:border-obsidian group-hover:bg-obsidian group-hover:text-ivory">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* CAMPAIGN */}
      <section className="grain grain-light relative overflow-hidden bg-obsidian text-ivory" aria-labelledby="campaign-title">
        <img src="/images/campaign.jpg" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[70%_center] opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/70 to-transparent md:via-obsidian/30" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-[1440px] flex-col justify-between px-5 py-14 md:px-10 md:py-20">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.26em] text-ivory/60">
            <span>Campaign — 2026</span>
            <span>VYRA SKIN</span>
          </div>
          <motion.div {...reveal}>
            <h2 id="campaign-title" className="font-serif text-[clamp(4rem,12vw,10.5rem)] leading-[0.82] tracking-[-0.02em]">
              Your Skin.<br />
              <em className="text-rose">Your Rules.</em>
            </h2>
            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-sm text-[16px] leading-relaxed text-ivory/75">
                No filters, no fine print, no one-size-fits-all. Build the routine that fits your face, your schedule, your mood.
              </p>
              <Link to="/shop" className={buttonClass('light', 'lg')}>Build your ritual <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      await api.subscribe(email.trim());
      setState('success');
    } catch (err) {
      setState('error');
      setMsg(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="bg-champagne" aria-labelledby="news-title">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-24 md:px-10 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Eyebrow className="text-graphite">04 — Letters from VYRA</Eyebrow>
          <h2 id="news-title" className="mt-4 font-serif text-5xl leading-[0.95] md:text-7xl">
            Be first through <em>the door.</em>
          </h2>
        </div>
        <div className="flex flex-col justify-end lg:col-span-5 lg:col-start-8">
          <p className="mb-6 text-[15px] leading-relaxed text-graphite">
            Launch dates, formulation notes and the occasional unfiltered opinion. One email a month, at most.
          </p>
          {state === 'success' ? (
            <div role="status" className="flex items-center gap-4 border border-obsidian bg-ivory p-5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-obsidian text-ivory"><Check className="h-4 w-4" /></span>
              <div>
                <p className="font-serif text-2xl leading-none">You’re on the list.</p>
                <p className="mt-1 text-[13px] text-graphite">We’ll write when there’s something worth saying.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label htmlFor="news-email" className="sr-only">Email address</label>
              <div className={cx('flex flex-col border-b sm:flex-row', state === 'error' ? 'border-danger' : 'border-obsidian')}>
                <input
                  id="news-email" type="email" required placeholder="your@email.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
                  aria-invalid={state === 'error'} aria-describedby={state === 'error' ? 'news-error' : undefined}
                  className="h-14 flex-1 bg-transparent font-serif text-2xl placeholder:text-graphite/50 focus:outline-none"
                />
                <Button type="submit" loading={state === 'loading'} className="mb-3 sm:mb-2">Subscribe</Button>
              </div>
              {state === 'error' && <p id="news-error" role="alert" className="mt-3 text-[13px] text-danger">{msg}</p>}
              <p className="mt-4 text-[12px] text-graphite/80">Demo form — your email is stored only in this browser.</p>
            </form>
          )}
          <div className="mt-8"><ConceptTag /></div>
        </div>
      </div>
    </section>
  );
}
