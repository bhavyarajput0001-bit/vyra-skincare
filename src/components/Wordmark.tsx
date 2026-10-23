import { cx } from './ui';

export function Wordmark({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  return (
    <span className={cx('inline-flex items-baseline gap-2 leading-none', tone === 'light' ? 'text-ivory' : 'text-obsidian', className)}>
      <span className="font-serif text-[28px] tracking-[0.08em]">VYRA</span>
      <span className="text-[9px] font-semibold tracking-[0.42em]">SKIN</span>
    </span>
  );
}
