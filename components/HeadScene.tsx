"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { onAudioReady } from "@/lib/audio";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const VERT = /* glsl */ `
  uniform float uBendStrength;
  uniform vec3 uBendOrigin;
  uniform vec3 uBendAxis;
  uniform vec3 uBendNormal;
  varying float vBend;
  varying vec2 vUv;
  void main() {
    vec3 pos = position;
    vec3 axis = normalize(uBendAxis);
    vec3 nrm = normalize(uBendNormal);
    float d = dot(pos - uBendOrigin, axis);
    float bend = 0.0;
    if (d > 0.0) {
      const float MAXA = 3.141592;
      float k = uBendStrength;
      float radius = 1.0 / k;
      vec3 perp = pos - uBendOrigin - axis * d;
      float th = min(d * k, MAXA);
      float excess = max(0.0, d - MAXA / k);
      pos = uBendOrigin + perp + axis * sin(th) * radius + nrm * (1.0 - cos(th)) * radius - axis * excess;
      bend = th / MAXA;
    }
    vUv = uv;
    vBend = bend;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAG_FACE = /* glsl */ `
  uniform sampler2D tFace;
  uniform sampler2D tEyes;
  uniform sampler2D tSurprised;
  uniform vec2 uMouse;
  uniform vec4 uEye;
  uniform float uSurprised;
  uniform float uFade;
  varying float vBend;
  varying vec2 vUv;
  void main() {
    vec4 face = texture2D(tFace, vUv);
    if (face.a < 0.55) discard;
    vec3 col = face.rgb;

    vec2 img = vec2(vUv.x, 1.0 - vUv.y);
    vec2 band = (img - uEye.xy) / uEye.zw;
    if (band.x > 0.0 && band.x < 1.0 && band.y > 0.0 && band.y < 1.0) {
      float cx = clamp(floor((uMouse.x * 0.5 + 0.5) * 3.0), 0.0, 2.0);
      float cy = clamp(floor((1.0 - (uMouse.y * 0.5 + 0.5)) * 3.0), 0.0, 2.0);
      vec2 auv = vec2((cx + clamp(band.x, 0.0, 1.0)) / 3.0, 1.0 - (cy + clamp(band.y, 0.0, 1.0)) / 3.0);
      vec4 e = texture2D(tEyes, auv);
      float m = smoothstep(0.0, 0.10, band.x) * smoothstep(1.0, 0.90, band.x)
              * smoothstep(0.0, 0.18, band.y) * smoothstep(1.0, 0.82, band.y);
      col = mix(col, e.rgb, m);
    }
    vec4 sur = texture2D(tSurprised, vUv);
    col = mix(col, sur.rgb, uSurprised);
    gl_FragColor = vec4(col, uFade);
  }
`;

const VERT_PLAIN = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG_LID = /* glsl */ `
  uniform sampler2D tLid;
  uniform float uLidFade;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(tLid, vUv);
    if (c.a < 0.55) discard;
    gl_FragColor = vec4(c.rgb, uLidFade);
  }
`;

const FRAG_LID_BACK = /* glsl */ `
  uniform sampler2D tLid;
  uniform vec3 uPaperLight;
  uniform vec3 uPaperDark;
  uniform float uLidFade;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(tLid, vUv);
    if (c.a < 0.55) discard;
    gl_FragColor = vec4(mix(uPaperLight, uPaperDark, 0.18), uLidFade);
  }
`;

const FRAG_TREE = /* glsl */ `
  uniform sampler2D tTree;
  uniform float uFade;
  varying float vBend;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(tTree, vUv);
    if (c.a < 0.5) discard;
    vec3 col = mix(c.rgb, c.rgb * 0.45, smoothstep(0.5, 1.0, vBend));
    gl_FragColor = vec4(col, uFade);
  }
`;

const FRAG_BACK = /* glsl */ `
  uniform sampler2D tFace;
  uniform vec3 uPaperLight;
  uniform vec3 uPaperDark;
  uniform float uPaperPower;
  uniform float uFade;
  varying float vBend;
  varying vec2 vUv;
  void main() {
    vec4 face = texture2D(tFace, vUv);
    if (face.a < 0.55) discard;
    vec3 c = mix(uPaperLight, uPaperDark, pow(1.0 - vBend, uPaperPower));
    gl_FragColor = vec4(c, uFade * 0.42);
  }
`;

export default function HeadScene() {
  const host = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const hero = el.closest(".hero") as HTMLElement | null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * 0.8);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 26);

    const uniformShared = {
      uBendStrength: { value: 7.5 },
      uBendOrigin: { value: new THREE.Vector3(-1.6, -1.6, 0) },
      uBendAxis: { value: new THREE.Vector3(-1, -1, 0) },
      uBendNormal: { value: new THREE.Vector3(0, 0, 1) },
    };

    const manager = new THREE.LoadingManager();
    let assetsPct = 0;
    let loadedAll = false;
    manager.onProgress = (_u: string, loaded: number, total: number) => {
      assetsPct = Math.round((loaded / total) * 100);
    };
    manager.onLoad = () => { loadedAll = true; };

    const loader = new THREE.TextureLoader(manager);
    const tex = (f: string) => {
      const t = loader.load(`/head/${f}`);
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.anisotropy = 4;
      return t;
    };

    const tFace = tex("face-whole.webp");
    const tSurprised = tex("face-surprised-whole.webp");
    const tEyes = tex("eyes.webp");
    const tPaper = tex("paper.webp");

    const uniforms = {
      ...uniformShared,
      tFace: { value: tFace },
      tEyes: { value: tEyes },
      tSurprised: { value: tSurprised },
      uMouse: { value: new THREE.Vector2(0.2, 0.2) },
      uEye: { value: new THREE.Vector4(0.2, 0.305, 0.6, 0.15) },
      uSurprised: { value: 0 },
      uFade: { value: 1 },
      uPaperLight: { value: new THREE.Color(0xf8f8f6) },
      uPaperDark: { value: new THREE.Color(0x000000) },
      uPaperPower: { value: 1.5 },
      tPaper: { value: tPaper },
    };

    const geo = new THREE.PlaneGeometry(1.345, 2, 128, 128);
    const faceMat = new THREE.ShaderMaterial({
      uniforms, vertexShader: VERT, fragmentShader: FRAG_FACE,
      transparent: true, side: THREE.FrontSide,
    });
    const backMat = new THREE.ShaderMaterial({
      uniforms, vertexShader: VERT, fragmentShader: FRAG_BACK,
      side: THREE.BackSide, transparent: true,
    });

    const group = new THREE.Group();
    const front = new THREE.Mesh(geo, faceMat);
    const back = new THREE.Mesh(geo, backMat);
    back.position.z = -0.004;
    group.add(front, back);
    scene.add(group);

    // tree sticker as a shader plane so it peels like the head
    const tTree = tex("tree.webp");
    const treeUni = {
      uBendStrength: { value: 3.2 },
      uBendOrigin: { value: new THREE.Vector3(-1.5, -1.5, 0) },
      uBendAxis: { value: new THREE.Vector3(-1, -1, 0) },
      uBendNormal: { value: new THREE.Vector3(0, 0, 1) },
      uFade: { value: 1 },
      tTree: { value: tTree },
      tFace: { value: tTree },
      uPaperLight: { value: new THREE.Color(0xf8f8f6) },
      uPaperDark: { value: new THREE.Color(0x000000) },
      uPaperPower: { value: 1.5 },
    };
    const treeGeo = new THREE.PlaneGeometry(1, 1, 64, 64);
    const treeFrontMat = new THREE.ShaderMaterial({ uniforms: treeUni, vertexShader: VERT, fragmentShader: FRAG_TREE, transparent: true, side: THREE.FrontSide });
    const treeBackMat = new THREE.ShaderMaterial({ uniforms: treeUni, vertexShader: VERT, fragmentShader: FRAG_BACK, transparent: true, side: THREE.BackSide });
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-0.88, -0.44, 0.06);
    treeGroup.scale.set(0.25, 0.31, 1);
    treeGroup.rotation.z = -0.09;
    const treeFront = new THREE.Mesh(treeGeo, treeFrontMat);
    const treeBack = new THREE.Mesh(treeGeo, treeBackMat);
    treeBack.position.z = -0.004;
    treeGroup.add(treeFront, treeBack);
    scene.add(treeGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xfff2d6, 3.4);
    key.position.set(1.1, 1.6, 1.8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9fb6ff, 1.5);
    rim.position.set(-1.6, 0.6, -0.8);
    scene.add(rim);
    const warm = new THREE.PointLight(0xffb060, 2.2, 6);
    warm.position.set(0, -0.4, 1.2);
    scene.add(warm);

    let w = 0, h = 0;
    const resize = () => {
      const r = el.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const halfFov = Math.atan(1.18 / (2 * 3.95 * camera.aspect));
      camera.fov = Math.min(52, Math.max(30, (halfFov * 360) / Math.PI));
      camera.updateProjectionMatrix();
      const halfW = 3.95 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      treeGroup.position.x = -halfW * (camera.aspect < 0.85 ? 0.76 : 0.84);
      treeGroup.visible = camera.aspect >= 0.7;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let active = true;
    const io = new IntersectionObserver((es) => { active = es[0].isIntersecting; }, { rootMargin: "200px" });
    if (hero) io.observe(hero);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!active || document.hidden) return;
      renderer.render(scene, camera);
    };
    loop();

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = -((e.clientY / innerHeight) * 2 - 1);
      uniforms.uMouse.value.set(nx * 1.5, ny * 1.5);
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => uniforms.uMouse.value.set(0.2, 0.2), 1000) as unknown as number;
    };
    let idle = 0;
    if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

    const bend = { v: 1.1 };
    const apply = () => uniforms.uBendOrigin.value.set(bend.v, bend.v, 0);
    const restY = () => (camera.aspect < 0.85 ? -0.33 : -0.235);

    document.documentElement.classList.add("is-loading");
    const startedAt = performance.now();
    const MIN_LOAD_MS = 2800;
    let audioOk = false;
    const offAudio = onAudioReady(() => { audioOk = true; });
    const audioFallback = setTimeout(() => { audioOk = true; }, 9000);
    let finished = false;

    const begin = () => {
      setReady(true);
      const titleEl = hero?.querySelector(".hero-title") as HTMLElement | null;
      if (titleEl) gsap.set(titleEl, { opacity: 0, y: 26 });
      if (reduce) {
        bend.v = -1.6; apply();
        camera.position.z = 3.95;
        group.position.y = restY();
        if (titleEl) gsap.set(titleEl, { opacity: 1, y: 0 });
        return;
      }
      gsap.registerPlugin(ScrollTrigger);
      const tl = gsap.timeline({ delay: 0.5 });
      tl.fromTo(group.position, { y: -2.3 }, { y: restY(), duration: 1.2, ease: "expo.out" }, 0)
        .fromTo(camera.position, { z: 4.7 }, { z: 3.95, duration: 1.5, ease: "expo.out" }, 0)
        .to(bend, { v: -1.6, duration: 1.3, ease: "power2.out", onUpdate: apply }, 0);
      if (titleEl) tl.to(titleEl, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, 0.85);

      const peel = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "60% top", scrub: true, invalidateOnRefresh: true } });
      peel.fromTo(bend, { v: -1.6 }, { v: -1.1, duration: 0.06, ease: "none", onUpdate: apply }, 0)
        .fromTo(bend, { v: -1.1 }, { v: 0.55, duration: 0.82, ease: "none", onUpdate: apply }, 0.06)
        .fromTo(bend, { v: 0.55 }, { v: 1.45, duration: 0.08, ease: "none", onUpdate: apply }, 0.88)
        .fromTo(uniforms.uSurprised, { value: 0 }, { value: 1, duration: 0.01, ease: "steps(1)" }, 0.05);
      const fadeEls = hero?.querySelectorAll(".hero-copy, .hero-foot");
      if (fadeEls?.length) peel.to(fadeEls, { opacity: 0, duration: 0.18, ease: "none" }, 0.74);
      peel.to(camera.position, { z: 4.9, duration: 0.45, ease: "power1.inOut" }, 0.45);
      peel.to(group.position, { y: 0.16, duration: 0.45, ease: "power1.inOut" }, 0.45);
      peel.to(group.rotation, { z: -0.03, duration: 0.45, ease: "power1.inOut" }, 0.45);
      peel.fromTo(uniforms.uFade, { value: 1 }, { value: 0, duration: 0.05, ease: "none" }, 0.94);

      const treePeel = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "42% top", scrub: true, invalidateOnRefresh: true } });
      treePeel
        .fromTo(treeUni.uBendOrigin.value, { x: -1.25, y: -1.25 }, { x: 0.95, y: 0.95, duration: 0.72, ease: "none" }, 0.06)
        .to(treeUni.uFade, { value: 0, duration: 0.18, ease: "none" }, 0.62);
    };

    const gate = setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const timePct = Math.min(100, (elapsed / MIN_LOAD_MS) * 100);
      setProgress(Math.round(Math.min(assetsPct, timePct)));
      if (finished || !loadedAll || !audioOk || elapsed < MIN_LOAD_MS) return;
      finished = true;
      setProgress(100);
      clearInterval(gate);
      clearTimeout(audioFallback);
      setTimeout(() => {
        document.documentElement.classList.remove("is-loading");
        begin();
      }, 320);
    }, 60);


    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      if (idle) clearTimeout(idle);
      clearInterval(gate);
      clearTimeout(audioFallback);
      offAudio();
      document.documentElement.classList.remove("is-loading");
      gsap.killTweensOf([camera.position, group.position, uniforms.uSurprised, uniforms.uFade]);
      ScrollTrigger.getAll().forEach((s) => { if (s.trigger === hero) s.kill(); });
      geo.dispose();
      faceMat.dispose();
      backMat.dispose();
      [tFace, tSurprised, tEyes, tPaper, tTree].forEach((t) => t.dispose());
      treeGeo.dispose();
      treeFrontMat.dispose();
      treeBackMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <div className="hero-canvas" ref={host} aria-hidden />
      <div className={`preloader${ready ? " is-done" : ""}`}>
        <div className="preloader-num">{String(progress).padStart(2, "0")}</div>
        <div className="preloader-bar"><i style={{ transform: `scaleX(${progress / 100})` }} /></div>
      </div>
      {failed && <div className="hero-fallback" />}
    </>
  );
}
