"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { afterLoadIdle, canRun3D } from "@/lib/scene";

// Loaded only in the browser, after the page is idle: text always renders first.
const Stars = dynamic(() => import("./Stars"), { ssr: false });

/** Mounts the star-field backdrop only on wide screens with motion allowed and WebGL present. Elsewhere the CSS speckles remain. */
export default function Backdrop() {
  const [show, setShow] = useState(false);
  useEffect(() => afterLoadIdle(() => setShow(canRun3D())), []);
  return show ? <Stars /> : null;
}
