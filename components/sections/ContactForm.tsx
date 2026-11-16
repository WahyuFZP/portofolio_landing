"use client";

import { useState } from "react";
import { m } from "motion/react";
import PixelIcon from "@/components/ui/PixelIcon";
import type { Dictionary } from "@/lib/dictionary";
import { btnPrimary } from "@/components/ui/styles";

const ENDPOINT = `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID || "xojbeear"}`;

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm({ dict }: { dict: Dictionary["contact"] }) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error"); // keep the typed message so the user can retry
    }
  }

  const input =
    "mt-2 w-full bg-surface px-3 py-2.5 pixel-border placeholder:text-muted focus-visible:[--pb:var(--accent)] disabled:opacity-60";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Honeypot: Formspree drops submissions that fill `_gotcha`. */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div>
        <label htmlFor="name" className="font-pixel text-sm">{dict.name}</label>
        <input id="name" name="name" type="text" autoComplete="name" required maxLength={100} disabled={status === "sending"} className={input} />
      </div>
      <div>
        <label htmlFor="email" className="font-pixel text-sm">{dict.email}</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={200} disabled={status === "sending"} className={input} />
      </div>
      <div>
        <label htmlFor="message" className="font-pixel text-sm">{dict.message}</label>
        <textarea id="message" name="message" rows={5} required maxLength={5000} disabled={status === "sending"} className={`${input} resize-y`} />
      </div>

      <button type="submit" disabled={status === "sending"} className={`${btnPrimary} w-full disabled:opacity-60`}>
        <PixelIcon name="send" className={`h-3.5 w-3.5 ${status === "sending" ? "animate-pulse" : ""}`} />
        {status === "sending" ? dict.sending : dict.send}
      </button>

      <p aria-live="polite" role="status" className={`flex items-center gap-2 text-sm ${status === "error" ? "text-danger" : "text-accent"}`}>
        {status === "success" && (
          <>
            <m.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
              <PixelIcon name="check" className="h-4 w-4" />
            </m.span>
            {dict.success}
          </>
        )}
        {status === "error" && dict.error}
      </p>
    </form>
  );
}
