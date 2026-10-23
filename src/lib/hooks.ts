import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Product } from './types';

export function useProducts(opts: { includeDrafts?: boolean } = {}) {
  const [data, setData] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const include = !!opts.includeDrafts;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      setData(await api.listProducts({ includeDrafts: include }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [include]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, reload: load, setData };
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — VYRA SKIN` : 'VYRA SKIN — Luxury Skincare. Unfiltered Confidence.';
  }, [title]);
}
