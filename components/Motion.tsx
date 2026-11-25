"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { tick as tickSound, unlock } from "@/lib/sfx";

export default function Motion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 28,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-tear]").forEach((el) => {
        gsap.fromTo(el, { yPercent: 45 }, {
          yPercent: -45, ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-peel]").forEach((el) => {
        gsap.fromTo(el,
          { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            rotate: -17, y: -44, scale: 0.94, opacity: 0, ease: "none",
            scrollTrigger: {
              trigger: el.closest(".hero") ?? el,
              start: "top top", end: "42% top",
              scrub: true, invalidateOnRefresh: true,
            },
          });
      });
      const wide = window.matchMedia("(min-width: 861px)").matches;
      const panels = gsap.utils.toArray<HTMLElement>("[data-stack]");
      if (wide) {
        panels.forEach((panel, i) => {
          const next = panels[i + 1];
          if (!next) return;
          gsap.to(panel, {
            scale: 0.95,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true },
          });
        });
      } else {
        panels.forEach((panel) => {
          const inner = panel.querySelector<HTMLElement>(".stack-inner");
          if (!inner) return;
          gsap.fromTo(inner, { y: 60 }, {
            y: -60,
            ease: "none",
            scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
          });
        });
      }
      const letters = gsap.utils.toArray<HTMLElement>(".hero-title .lt");
      if (letters.length) {
        gsap.set(letters, { willChange: "transform" });
        gsap.to(letters, {
          y: -8,
          duration: 1.7,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.085, from: "start" },
        });
        gsap.to(letters, {
          rotate: 1.5,
          duration: 2.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.11, from: "center" },
        });

        window.addEventListener("pointerdown", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });
        letters.forEach((el, i) => {
          const inner = el.firstElementChild as HTMLElement | null;
          if (!inner) return;
          const note = 1150 * Math.pow(2, (i % 7) / 12);
          el.addEventListener("pointerenter", (event) => {
            if ((event as PointerEvent).pointerType === "touch") return;
            gsap.to(inner, {
              y: -18,
              scale: 1.08,
              duration: 0.26,
              ease: "back.out(2.6)",
              overwrite: "auto",
            });
            tickSound(note, 0.13);
          });
          el.addEventListener("pointerleave", () => {
            gsap.to(inner, {
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "elastic.out(1, 0.4)",
              overwrite: "auto",
            });
          });
        });
      }
      gsap.utils.toArray<HTMLElement>("[data-tilt]").forEach((el) => {
        const q = { rx: 0, ry: 0 };
        const set = () => {
          el.style.transform = `perspective(900px) rotateX(${q.rx}deg) rotateY(${q.ry}deg)`;
        };
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          q.ry = ((e.clientX - r.left) / r.width - 0.5) * 9;
          q.rx = -((e.clientY - r.top) / r.height - 0.5) * 9;
          gsap.to(q, { rx: q.rx, ry: q.ry, duration: 0.5, onUpdate: set, overwrite: true });
        };
        const leave = () => gsap.to(q, { rx: 0, ry: 0, duration: 0.7, onUpdate: set });
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
      });
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}
