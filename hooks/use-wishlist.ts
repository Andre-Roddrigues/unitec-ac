"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "unitec.wishlist";
const SERVER_SNAPSHOT: string[] = [];

const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try {
    cache = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    cache = [];
  }
  return cache;
}

function persist(next: string[]) {
  cache = next;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return read();
}

export function useWishlist() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    persist(next);
    return next.includes(id);
  }, []);

  const has = useCallback((id: string) => read().includes(id), []);

  return { ids, toggle, has, hydrated };
}
