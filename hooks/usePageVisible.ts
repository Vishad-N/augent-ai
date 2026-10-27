"use client";

import { useSyncExternalStore } from "react";

/** False while the tab is backgrounded, so loops can pause and save battery. */
export function usePageVisible() {
  return useSyncExternalStore(
    (cb) => {
      document.addEventListener("visibilitychange", cb);
      return () => document.removeEventListener("visibilitychange", cb);
    },
    () => !document.hidden,
    () => true
  );
}
