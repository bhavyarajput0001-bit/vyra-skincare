import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../lib/hooks';
import { buttonClass, Eyebrow } from '../components/ui';

const principles = [
  ['Fewer, better steps', 'A routine should fit into a real morning. Four rituals — cleanse, treat, hydrate, protect — and six formulas you can mix without a flowchart.'],
  ['Honest by default', 'We describe what a product is designed to feel like and what’s proposed to go in it. We don’t borrow white coats, invent percentages or quote studies we haven’t run.'],
  ['Texture is the point', 'The best routine is the one you look forward to. Every concept starts with how it should feel on skin, then works backwards.'],
  ['Luxury, priced fairly', 'Considered packaging and editorial design shouldn’t need a three-figure price tag. Our concepts are planned between $24 and $42.'],
];

export default function Philosophy() {
  useDocumentTitle('Our Philosophy');
  return (
    <>
      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-12 md:px-10 md:pt-20">
        <Eyebrow className="text-muted">Our Philosophy</Eyebrow>
        <h1 className="mt-6 max-w-6xl font-serif text-6xl leading-[0.9] md:text-[8.5rem]">
          Self-expression, <em className="text-rose">not self-correction.</em>
        </h1>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-12 px-5 pb-24 md:px-10 lg:grid-cols-12">
        <div className="grain relative lg:col-span-6">
          <img src="/images/philosophy.jpg" alt="Hands holding a drop of clear serum" className="aspect-[4/5] w-full object-cover" />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <p className="font-serif text-3xl leading-snug md:text-4xl">
            We’re a proposed skincare brand for people who grew up with filters — and are done with them.
          </p>
          <p className="mt-8 text-[16px] leading-relaxed text-graphite">
            VYRA SKIN sits between two worlds: the restraint and craft of luxury beauty, and the honesty and humour of a
            generation that can spot a marketing claim from a mile away. Our job is to make products that look beautiful on
            your shelf and talk to you like an adult.
          </p>
          <ol className="mt-12 space-y-8">
            {principles.map(([t, b], i) => (
              <li key={t} className="grid grid-cols-[44px_1fr] gap-4 border-t border-line pt-6">
                <span className="font-mono text-xs text-muted pt-2">0{i + 1}</span>
                <div>
                  <h2 className="font-serif text-3xl leading-tight">{t}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{b}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-obsidian text-ivory">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-24 md:px-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow className="text-champagne">Transparency</Eyebrow>
            <h2 className="mt-4 font-serif text-5xl leading-[0.95] md:text-6xl">What we won’t claim.</h2>
          </div>
          <ul className="grid gap-6 text-[15px] leading-relaxed text-ivory/75 sm:grid-cols-2 lg:col-span-7">
            {[
              ['Concept status', 'Every product on this site is an illustrative concept. Formulas, ingredients and packaging may change.'],
              ['No clinical claims', 'We haven’t run clinical trials, so we don’t publish results, percentages or “proven” language.'],
              ['No endorsements', 'No dermatologist, certification body or publication has endorsed VYRA. We won’t imply otherwise.'],
              ['No fake social proof', 'No invented reviews, star ratings or sales counts. Real feedback will be labelled as real when it exists.'],
            ].map(([t, b]) => (
              <li key={t} className="border-t border-ivory/15 pt-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose">{t}</p>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-24 text-center md:px-10">
        <p className="font-serif text-5xl italic md:text-7xl">Your Skin. Your Rules.</p>
        <Link to="/shop" className={`${buttonClass('primary', 'lg')} mt-10`}>Shop the collection <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </>
  );
}
