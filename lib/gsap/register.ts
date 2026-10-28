"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

export function registerGsapPlugins() {
  if (registered) return;

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, useGSAP);
  registered = true;
}
