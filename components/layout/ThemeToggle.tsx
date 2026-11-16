"use client";

import PixelIcon from "@/components/ui/PixelIcon";

// No React state: the theme lives on <html data-theme>, and CSS shows the matching icon.
export default function ThemeToggle({ label }: { label: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const current = root.dataset.theme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode: the choice still applies for this page view.
    }
  };

  return (
    <button type="button" onClick={toggle} aria-label={label} className="flex h-11 w-11 items-center justify-center text-muted transition-colors pixel-border hover:text-text">
      <span className="only-light"><PixelIcon name="moon" /></span>
      <span className="only-dark"><PixelIcon name="sun" /></span>
    </button>
  );
}

// Runs before first paint (inline in <head>) so a saved choice never flashes the wrong theme.
export const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
