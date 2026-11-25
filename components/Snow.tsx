"use client";
import { useEffect, useRef } from "react";

export default function Snow() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const g = c.getContext("2d");
    if (!g) return;
    let w = 0, h = 0, raf = 0, active = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const flakes = Array.from({ length: 110 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.6 + Math.random() * 1.7,
      vy: 0.00018 + Math.random() * 0.00042,
      vx: -0.00008 + Math.random() * 0.00016,
      p: Math.random() * Math.PI * 2,
    }));
    const resize = () => {
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const onVis = () => { active = !document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - last); last = now;
      if (!active) return;
      g.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += f.vy * dt;
        f.p += 0.0012 * dt;
        f.x += (f.vx + Math.sin(f.p) * 0.00012) * dt;
        if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
        if (f.x < -0.02) f.x = 1.02;
        if (f.x > 1.02) f.x = -0.02;
        g.beginPath();
        g.arc(f.x * w, f.y * h, f.r, 0, Math.PI * 2);
        g.fillStyle = `rgba(251,247,239,${0.15 + f.r * 0.12})`;
        g.fill();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return <canvas ref={ref} className="snow" aria-hidden />;
}
