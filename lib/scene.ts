// Shared by every WebGL scene on the site (hero constellation, deep-field background).

/** True when live 3D is worth running: motion allowed, not data-saver, tablet/desktop width, WebGL present. */
export function canRun3D(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  // Phones get static visuals only: three.js is never downloaded there.
  if (window.innerWidth < 768) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Calls `fn` once the page has loaded and the main thread is idle, so 3D never competes with LCP. Returns a cancel function. */
export function afterLoadIdle(fn: () => void): () => void {
  let cancelled = false;
  const hasIdle = typeof window.requestIdleCallback === "function"; // missing in Safari
  let idleId: number | undefined;
  const schedule = () => {
    if (cancelled) return;
    idleId = hasIdle ? window.requestIdleCallback(fn, { timeout: 3000 }) : window.setTimeout(fn, 1500);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (idleId === undefined) return;
    if (hasIdle) window.cancelIdleCallback(idleId);
    else window.clearTimeout(idleId);
  };
}

/** Re-runs `fn` when the theme changes, from the OS or from the navbar toggle (html[data-theme]). Returns a cleanup function. */
export function onThemeChange(fn: () => void): () => void {
  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener("change", fn);
  const mo = new MutationObserver(fn);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    scheme.removeEventListener("change", fn);
    mo.disconnect();
  };
}
