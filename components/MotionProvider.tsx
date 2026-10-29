"use client";

import { LazyMotion, domMax } from "framer-motion";

// domMax (not domAnimation): the Solutions pipeline bar and the header indicator
// use shared-layout animations. Loaded synchronously: deferring the feature chunk
// moved ~40 elements' setup into one long task right after hydration (worse TBT).
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}
