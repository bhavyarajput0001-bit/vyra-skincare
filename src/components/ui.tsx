import { createContext, useCallback, useContext, useState, forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, ChevronDown, Info, Loader2, Minus, Plus, X } from 'lucide-react';
import type { StockState } from '../lib/types';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ---------------- Button ---------------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'danger' | 'rose';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-obsidian text-ivory hover:bg-graphite border border-obsidian',
  secondary: 'bg-transparent text-obsidian border border-obsidian hover:bg-obsidian hover:text-ivory',
  ghost: 'bg-transparent text-obsidian border border-transparent hover:border-line',
  light: 'bg-ivory text-obsidian border border-ivory hover:bg-champagne hover:border-champagne',
  danger: 'bg-danger text-ivory border border-danger hover:bg-[#8a3532]',
  rose: 'bg-rose text-obsidian border border-rose hover:bg-[#b97f81]',
};
const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[11px]',
  md: 'h-11 px-6 text-xs',
  lg: 'h-14 px-8 text-xs',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
}

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', full?: boolean) =>
  cx(
    'relative inline-flex items-center justify-center gap-2 font-sans font-semibold uppercase tracking-[0.18em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-45 select-none',
    variants[variant],
    sizes[size],
    full && 'w-full',
  );

export function Button({ variant = 'primary', size = 'md', loading, full, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={cx(buttonClass(variant, size, full), className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      <span className={cx('inline-flex items-center gap-2', loading && 'invisible')}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span className="sr-only">Loading</span>
        </span>
      )}
    </button>
  );
}

/* ---------------- Form controls ---------------- */
const controlBase =
  'w-full bg-transparent border border-line px-4 text-[15px] text-obsidian placeholder:text-muted/70 transition-colors focus:outline-none focus:border-obsidian aria-[invalid=true]:border-danger disabled:opacity-50';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cx(controlBase, 'h-12', className)} {...p} />;
});

export function Textarea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(controlBase, 'py-3 min-h-28 leading-relaxed', className)} {...p} />;
}

export function Select({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cx(controlBase, 'h-12 appearance-none pr-10', className)} {...p}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" aria-hidden />
    </div>
  );
}

export function Field({ label, htmlFor, error, hint, children, className, optional }: { label: string; htmlFor: string; error?: string; hint?: string; children: ReactNode; className?: string; optional?: boolean }) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-graphite">
        {label}
        {optional && <span className="font-normal normal-case tracking-normal text-muted">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="flex items-center gap-1.5 text-[13px] text-danger">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden /> {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/* ---------------- Quantity stepper ---------------- */
export function QtyStepper({ value, onChange, min = 1, max, size = 'md', label = 'Quantity' }: { value: number; onChange: (n: number) => void; min?: number; max: number; size?: 'sm' | 'md'; label?: string }) {
  const h = size === 'sm' ? 'h-9' : 'h-12';
  const w = size === 'sm' ? 'w-9' : 'w-12';
  return (
    <div className={cx('inline-flex items-stretch border border-line', h)} role="group" aria-label={label}>
      <button type="button" className={cx(w, 'grid place-items-center transition-colors hover:bg-stone disabled:opacity-30 disabled:hover:bg-transparent')} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={cx('grid min-w-10 place-items-center px-1 font-mono text-sm tabular-nums')} aria-live="polite">{value}</span>
      <button type="button" className={cx(w, 'grid place-items-center transition-colors hover:bg-stone disabled:opacity-30 disabled:hover:bg-transparent')} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ---------------- Badges ---------------- */
export function ConceptTag({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
        tone === 'dark' ? 'border-obsidian/20 text-graphite bg-ivory/80' : 'border-ivory/30 text-ivory',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-rose" aria-hidden />
      Product concept
    </span>
  );
}

export function StockBadge({ state, stock, compact }: { state: StockState; stock: number; compact?: boolean }) {
  const map = {
    in: { label: compact ? 'In stock' : 'In stock', cls: 'text-success bg-success/10', dot: 'bg-success' },
    low: { label: compact ? 'Low' : `Low — ${stock} left`, cls: 'text-warn bg-warn/10', dot: 'bg-warn' },
    out: { label: compact ? 'Out' : 'Out of stock', cls: 'text-danger bg-danger/10', dot: 'bg-danger' },
  }[state];
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap', map.cls)}>
      <span className={cx('h-1.5 w-1.5 rounded-full', map.dot)} aria-hidden />
      {map.label}
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('text-[11px] font-semibold uppercase tracking-[0.24em]', className)}>{children}</p>;
}

/* ---------------- States ---------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse bg-stone', className)} aria-hidden />;
}

export function Banner({ tone = 'error', children, onClose }: { tone?: 'error' | 'success' | 'info'; children: ReactNode; onClose?: () => void }) {
  const styles = {
    error: 'border-danger/30 bg-danger/[0.06] text-danger',
    success: 'border-success/30 bg-success/[0.07] text-success',
    info: 'border-line bg-stone text-graphite',
  }[tone];
  const Icon = tone === 'error' ? AlertCircle : tone === 'success' ? Check : Info;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx('flex items-start gap-3 border px-4 py-3 text-sm', styles)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="flex-1 leading-relaxed">{children}</div>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, body, action, icon }: { title: string; body: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-line px-6 py-20 text-center">
      {icon && <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-stone text-graphite">{icon}</div>}
      <h3 className="font-serif text-4xl leading-none">{title}</h3>
      <p className="mt-3 max-w-sm text-[15px] text-muted">{body}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

/* ---------------- Modal ---------------- */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-obsidian/60" onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            className="relative w-full max-w-md bg-ivory p-8"
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} transition={{ duration: 0.25 }}
          >
            <button onClick={onClose} className="absolute right-4 top-4 p-1 text-muted hover:text-obsidian" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-serif text-3xl leading-tight">{title}</h2>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Toasts ---------------- */
interface Toast { id: number; message: string; tone: 'success' | 'error' | 'info'; detail?: string; image?: string }
const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { ...t, id }]);
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 3600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 left-4 z-[90] flex flex-col items-end gap-2 sm:left-auto" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              className="pointer-events-auto flex w-full items-center gap-4 bg-obsidian p-3 pr-5 text-ivory shadow-2xl sm:w-[360px]"
            >
              {t.image ? (
                <img src={t.image} alt="" className="h-14 w-12 object-cover" />
              ) : (
                <span className={cx('grid h-8 w-8 place-items-center rounded-full', t.tone === 'error' ? 'bg-danger' : t.tone === 'success' ? 'bg-champagne text-obsidian' : 'bg-graphite')}>
                  {t.tone === 'error' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.message}</p>
                {t.detail && <p className="truncate text-xs text-ivory/60">{t.detail}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
