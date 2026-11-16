"use client";

import { LazyMotion, MotionConfig } from "motion/react";

// Layout features load after hydration, so they never block first paint.
const loadFeatures = () => import("motion/react").then((m) => m.domMax);

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
