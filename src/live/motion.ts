"use client";
import { useEffect, type RefObject } from "react";
import { motionTokens } from "./motion/tokens";

/** Lazy loaded editorial motion; the complete baseline remains visible. */
export function useEditorialMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add(
          {
            motion: "(prefers-reduced-motion: no-preference)",
            desktop: motionTokens.desktop,
          },
          (context) => {
            if (!context.conditions?.motion) return;
            const q = gsap.utils.selector(element);
            const hero = element.querySelector<HTMLElement>(".home-hero");
            if (hero) {
              gsap
                .timeline({ defaults: { ease: motionTokens.ease } })
                .fromTo(
                  q(".hero-line > span"),
                  { yPercent: 35 },
                  {
                    yPercent: 0,
                    duration: motionTokens.reveal,
                    stagger: motionTokens.stagger,
                  },
                  0,
                )
                .fromTo(
                  q(".home-portrait"),
                  { clipPath: "inset(0 0 0 3%)" },
                  {
                    clipPath: "inset(0 0 0 0%)",
                    duration: motionTokens.reveal,
                  },
                  0,
                )
                .fromTo(
                  q(
                    ".home-hero-caption, .home-hero-intro, .hero-quick-search, .home-hero-base",
                  ),
                  { y: 10 },
                  {
                    y: 0,
                    duration: motionTokens.reveal,
                    stagger: motionTokens.stagger,
                  },
                  0.15,
                );
              gsap
                .timeline({
                  scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "bottom top",
                    scrub: 0.65,
                    invalidateOnRefresh: true,
                  },
                })
                .to(
                  q(".portrait-parallax"),
                  {
                    y: context.conditions.desktop ? 12 : 0,
                    ease: "none",
                  },
                  0,
                );
            }
            q("[data-reveal]").forEach((node: HTMLElement) => {
              gsap.fromTo(
                node.firstElementChild,
                { y: 14 },
                {
                  y: 0,
                  duration: motionTokens.reveal,
                  ease: motionTokens.ease,
                  scrollTrigger: {
                    trigger: node,
                    start: "top 92%",
                    once: true,
                  },
                },
              );
            });
            element.dataset.motionReady = "true";
            return () => {
              delete element.dataset.motionReady;
            };
          },
          element,
        );
        cleanup = () => media.revert();
      })
      .catch(() => {
        /* Static content is the intentional fallback. */
      });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [root]);
}
