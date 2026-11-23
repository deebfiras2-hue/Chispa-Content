// 3D mode (@remotion/three + @react-three/fiber): premium, slow, softly lit scenes in the theme palette.
// Scene types: 3d-phone, 3d-store, 3d-tiles, 3d-tags, 3d-text. They share the LINEART stage (background, title,
// mono label, typed narration, `items` overlays) and add a WebGL layer with studio lighting + fog.
// Renders headless with --gl=swangle (set in remotion.config.ts and scripts/stills.mjs).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {Sfx, Word} from '../spec';
import {useFontsReady} from '../themes';
import {Ctx, Item, ItemEl, LAProps, rel, Stage, TimeRef, useCtx} from '../lineart/LineArt';
import {clamp, ease, lerp, rand, smooth} from '../lib/anim';
import {drawFreshTile, drawGreyTile, drawReceipt, drawScreen, drawTag, FONT, Motif, P, rr, ScreenSpec} from './draw';

// ---------------------------------------------------------------- keyframes
type Key = {at: TimeRef; dur?: number; ease?: 'inOut' | 'out' | 'snap'; [k: string]: unknown};
/** numeric props of `base` are moved to each key's values (eased, from the previous state) */
const keyed = <T extends Record<string, number>>(base: T, keys: Key[] | undefined, c: Ctx): T => {
  const st = {...base};
  for (const k of keys ?? []) {
    const a = rel(k.at, c.words, c.t0);
    const d = k.dur ?? 1.2;
    const e = k.ease === 'out' ? ease.out : k.ease === 'snap' ? ease.snap : ease.inOut;
    const q = d <= 0 ? (c.t >= a ? 1 : 0) : e(clamp((c.t - a) / d));
    for (const p of Object.keys(st)) if (typeof k[p] === 'number') (st as Record<string, number>)[p] = lerp(st[p], k[p] as number, q);
  }
  return st;
};

// ---------------------------------------------------------------- shared 3D stage
type Cam = {az: number; el: number; dist: number; tx: number; ty: number; tz: number; fov: number};
const CamRig: React.FC<{cam: Cam}> = ({cam}) => {
  const {camera} = useThree();
  const pc = camera as THREE.PerspectiveCamera;
  const az = (cam.az * Math.PI) / 180, el = (cam.el * Math.PI) / 180;
  pc.fov = cam.fov;
  pc.near = 0.1;
  pc.far = 200;
  pc.updateProjectionMatrix();
  pc.position.set(cam.tx + cam.dist * Math.sin(az) * Math.cos(el), cam.ty + cam.dist * Math.sin(el), cam.tz + cam.dist * Math.cos(az) * Math.cos(el));
  pc.lookAt(cam.tx, cam.ty, cam.tz);
  return null;
};

const Lights: React.FC<{accent?: number}> = ({accent = 0}) => (
  <>
    <ambientLight intensity={0.55} color={P.nebel} />
    <hemisphereLight args={[P.nebel, P.tinte, 0.55]} />
    <directionalLight position={[-5, 7, 9]} intensity={2.3} color="#FFF5EA" />
    <directionalLight position={[6, 3, -7]} intensity={1.6} color="#4FB3C0" />
    {accent > 0 && <pointLight position={[2.5, 1.5, 3]} intensity={accent * 6} distance={9} color={P.funke} />}
  </>
);

export type P3 = LAProps & {cam?: Key[]; fog?: [number, number]; light?: number};
const Scene3D: React.FC<{p: P3; c: Ctx; camBase: Cam; children: React.ReactNode; front?: React.ReactNode}> = ({p, c, camBase, children, front}) => {
  const cam = keyed(camBase, p.cam, c);
  // slow confident drift so a held shot never freezes
  cam.az += Math.sin((c.t + c.t0) * 0.22) * 1.2;
  cam.el += Math.sin((c.t + c.t0) * 0.17) * 0.6;
  const [near, far] = p.fog ?? [cam.dist * 0.8, cam.dist * 2.6];
  const items: Item[] = p.items ?? [];
  // mount WebGL only after the theme fonts are loaded: canvas textures with text are drawn on the first GL frame
  const fontsOk = useFontsReady(p.theme);
  return (
    <Stage p={{...p, drift: 0, items: []}} c={c} items={[]} front={front}>
      <AbsoluteFill>
        {fontsOk && <ThreeCanvas width={1080} height={1920} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}} camera={{fov: cam.fov, position: [0, 0, cam.dist]}}>
          <fog attach="fog" args={[P.tinte, near, far]} />
          <CamRig cam={cam} />
          <Lights accent={p.light ?? 0} />
          {children}
        </ThreeCanvas>}
      </AbsoluteFill>
      {items.map((it, i) => (
        <ItemEl key={i} it={it} c={{...c, uid: `3d${Math.round(c.t0 * 100)}_${i}`}} />
      ))}
    </Stage>
  );
};

// ---------------------------------------------------------------- canvas textures (redrawn each frame: fonts are ready by then)
const useCanvasTex = (w: number, h: number, n = 1) =>
  useMemo(
    () =>
      Array.from({length: n}, () => {
        const cv = document.createElement('canvas');
        cv.width = w;
        cv.height = h;
        const tex = new THREE.CanvasTexture(cv);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        return {cv, ctx: cv.getContext('2d')!, tex};
      }),
    [w, h, n],
  );

const shadowTex = (() => {
  let t: THREE.Texture | null = null;
  return () => {
    if (t) return t;
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const g = cv.getContext('2d')!;
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(0,0,0,0.55)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    t = new THREE.CanvasTexture(cv);
    return t;
  };
})();
const SoftShadow: React.FC<{y?: number; w?: number; d?: number; o?: number; x?: number; z?: number}> = ({y = 0, w = 3, d = 1.2, o = 1, x = 0, z = 0}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, y, z]}>
    <planeGeometry args={[w, d]} />
    <meshBasicMaterial map={shadowTex()} transparent opacity={o} depthWrite={false} />
  </mesh>
);

// time refs inside screen specs -> scene-local seconds
type ScreenIn = Omit<ScreenSpec, 'freshAt' | 'staleAt' | 'stamp' | 'checks' | 'messages'> & {
  at?: TimeRef;
  freshAt?: TimeRef;
  staleAt?: TimeRef;
  stamp?: {text: string; at: TimeRef};
  checks?: {key: 'photo' | 'hours' | 'week'; at: TimeRef}[];
  messages?: {from: 'me' | 'them'; text: string; at: TimeRef}[];
};
const resolveScreen = (s: ScreenIn, c: Ctx): ScreenSpec => {
  const r = (v: TimeRef | undefined) => (v === undefined ? undefined : rel(v, c.words, c.t0));
  return {
    ...(s as ScreenSpec),
    freshAt: r(s.freshAt),
    staleAt: r(s.staleAt),
    stamp: s.stamp ? {text: s.stamp.text, at: r(s.stamp.at)!} : undefined,
    checks: s.checks?.map((k) => ({key: k.key, at: r(k.at)!})),
    messages: s.messages?.map((m) => ({...m, at: r(m.at)!})),
  };
};

// ---------------------------------------------------------------- phone
const SW = 640, SH = 1390;
const PhoneMesh: React.FC<{screen: ScreenSpec; t: number; glow?: number}> = ({screen, t, glow = 0}) => {
  const [s] = useCanvasTex(SW, SH);
  s.ctx.clearRect(0, 0, SW, SH);
  s.ctx.save();
  rr(s.ctx, 0, 0, SW, SH, 70);
  s.ctx.clip();
  drawScreen(s.ctx, SW, SH, screen, t);
  s.ctx.restore();
  s.tex.needsUpdate = true;
  const body = useMemo(() => new RoundedBoxGeometry(2.0, 4.3, 0.2, 6, 0.24), []);
  const bump = useMemo(() => new RoundedBoxGeometry(0.7, 0.7, 0.08, 4, 0.12), []);
  return (
    <group>
      <mesh geometry={body}>
        <meshStandardMaterial color="#163A40" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.102]}>
        <planeGeometry args={[1.86, 4.04]} />
        <meshBasicMaterial map={s.tex} transparent toneMapped={false} />
      </mesh>
      <mesh geometry={bump} position={[-0.5, 1.6, -0.12]}>
        <meshStandardMaterial color="#1D4950" metalness={0.5} roughness={0.35} />
      </mesh>
      {[0.9, 0.4].map((y) => (
        <mesh key={y} position={[1.01, y, 0]}>
          <boxGeometry args={[0.04, 0.32, 0.08]} />
          <meshStandardMaterial color="#1D4950" metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
      {glow > 0 && (
        <mesh position={[0, 0, -0.2]}>
          <planeGeometry args={[4, 6.5]} />
          <meshBasicMaterial map={shadowTex()} color={P.nebel} transparent opacity={0.0} />
        </mesh>
      )}
    </group>
  );
};

/** 3d-phone: a stylised smartphone floating/rotating; its screen shows a feed, profile, chat, post or a shop window. */
export const ThreePhone: React.FC<P3 & {phone?: Key[]; screens?: ScreenIn[]; screen?: ScreenIn; float?: number; shadow?: boolean}> = (p) => {
  const c = useCtx(p);
  const ph = keyed({x: 0, y: -0.2, z: 0, rx: -0.08, ry: -0.35, rz: 0.04, s: 1}, p.phone, c);
  const fl = p.float ?? 1;
  const list = p.screens ?? (p.screen ? [{...p.screen, at: 0}] : [{kind: 'blank' as const, at: 0}]);
  let cur = list[0];
  for (const s of list) if (rel(s.at ?? 0, c.words, c.t0) <= c.t + 1e-4) cur = s;
  const scr = resolveScreen(cur, c);
  return (
    <Scene3D p={p} c={c} camBase={{az: 0, el: 4, dist: 13, tx: 0, ty: 0, tz: 0, fov: 30}}>
      <group
        position={[ph.x, ph.y + Math.sin((c.t + c.t0) * 1.3) * 0.06 * fl, ph.z]}
        rotation={[ph.rx + Math.sin((c.t + c.t0) * 0.9) * 0.02 * fl, ph.ry + Math.sin((c.t + c.t0) * 0.6) * 0.05 * fl, ph.rz]}
        scale={ph.s}
      >
        <PhoneMesh screen={scr} t={c.t} />
      </group>
      {p.shadow !== false && <SoftShadow y={-2.75} w={3.4 * ph.s} d={1.0} x={ph.x} o={0.8} />}
    </Scene3D>
  );
};

// ---------------------------------------------------------------- store
const SignTex: React.FC<{text: string; w: number; h: number; dim?: number}> = ({text, w, h, dim = 0}) => {
  const [s] = useCanvasTex(512, Math.round((512 * h) / w));
  const g = s.ctx, H = s.cv.height;
  g.fillStyle = dim ? '#1A3A3F' : P.tinte;
  g.fillRect(0, 0, 512, H);
  g.fillStyle = dim ? '#6F8F86' : P.nebel;
  g.font = `700 ${H * 0.62}px "${FONT.title}"`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 256, H * 0.55);
  s.tex.needsUpdate = true;
  return <meshStandardMaterial map={s.tex} roughness={0.7} />;
};
const stripeTex = (() => {
  const cache: Record<string, THREE.Texture> = {};
  return (a: string, b: string) => {
    const k = a + b;
    if (cache[k]) return cache[k];
    const cv = document.createElement('canvas');
    cv.width = 256;
    cv.height = 64;
    const g = cv.getContext('2d')!;
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? b : a;
      g.fillRect(i * 32, 0, 32, 64);
    }
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    cache[k] = t;
    return t;
  };
})();

const Shop: React.FC<{x: number; sign: string; hero?: boolean; lit?: number; wall?: string}> = ({x, sign, hero, lit = 1, wall}) => {
  const wc = wall ?? (hero ? '#DCE5DF' : '#8FA59C');
  const glass = new THREE.Color('#0F5560').lerp(new THREE.Color('#5FB4BE'), hero ? 0.35 * lit : 0.05);
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 1.75, -0.5]}>
        <boxGeometry args={[3.2, 3.5, 1]} />
        <meshStandardMaterial color={wc} roughness={0.85} />
      </mesh>
      {/* window */}
      <mesh position={[-0.55, 1.3, 0.005]}>
        <planeGeometry args={[1.8, 1.6]} />
        <meshStandardMaterial color={glass} emissive={glass} emissiveIntensity={hero ? 0.5 + 0.6 * lit : 0.15} roughness={0.15} metalness={0.2} />
      </mesh>
      {hero &&
        [0, 1, 2].map((i) => (
          <mesh key={i} position={[-1.05 + i * 0.5, 0.75 + (i % 2) * 0.12, 0.05]}>
            <boxGeometry args={[0.3, 0.3 + (i % 2) * 0.24, 0.1]} />
            <meshStandardMaterial color={P.nebel} emissive={P.nebel} emissiveIntensity={0.15 * lit} roughness={0.6} />
          </mesh>
        ))}
      <mesh position={[-0.55, 0.47, 0.06]}>
        <boxGeometry args={[1.9, 0.06, 0.14]} />
        <meshStandardMaterial color={wc} roughness={0.8} />
      </mesh>
      {/* door */}
      <mesh position={[0.95, 1.05, 0.005]}>
        <planeGeometry args={[0.85, 2.1]} />
        <meshStandardMaterial color={hero ? '#0E3A40' : '#355A57'} roughness={0.5} />
      </mesh>
      <mesh position={[1.22, 1.05, 0.03]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={P.nebel} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* awning */}
      <mesh position={[0, 2.5, 0.45]} rotation={[0.55, 0, 0]}>
        <boxGeometry args={[3.3, 0.04, 1.0]} />
        <meshStandardMaterial map={hero ? stripeTex(P.funke, P.nebel) : stripeTex('#6F8F86', '#A9BDB4')} roughness={0.75} />
      </mesh>
      {/* sign */}
      <mesh position={[0, 3.05, 0.02]}>
        <boxGeometry args={[2.6, 0.5, 0.06]} />
        <SignTex text={sign} w={2.6} h={0.5} dim={hero ? 0 : 1} />
      </mesh>
    </group>
  );
};

type Walker = {at: TimeRef; from: number; to: number; dur?: number; z?: number; phone?: boolean};
const Person: React.FC<{x: number; z: number; t: number; walking: boolean; phone: boolean; face: number}> = ({x, z, t, walking, phone, face}) => {
  const sw = walking ? Math.sin(t * 7) * 0.45 : 0;
  const col = '#B9C9C1';
  return (
    <group position={[x, Math.abs(Math.sin(t * 7)) * (walking ? 0.03 : 0), z]} rotation={[0, face, 0]}>
      {[-1, 1].map((sgn) => (
        <mesh key={sgn} position={[0.0, 0.42, sgn * 0.09]} rotation={[0, 0, sgn * sw]}>
          <capsuleGeometry args={[0.07, 0.6, 4, 8]} />
          <meshStandardMaterial color="#5F7F78" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.19, 0.5, 6, 12]} />
        <meshStandardMaterial color={col} roughness={0.75} />
      </mesh>
      <mesh position={[0.08, 1.62, 0]}>
        <sphereGeometry args={[0.15, 20, 20]} />
        <meshStandardMaterial color={col} roughness={0.7} />
      </mesh>
      {phone && (
        <group position={[0.3, 1.18, 0.05]} rotation={[0, 0, 0.9]}>
          <mesh>
            <boxGeometry args={[0.03, 0.22, 0.12]} />
            <meshStandardMaterial color="#163A40" />
          </mesh>
          <mesh position={[0.02, 0, 0]}>
            <boxGeometry args={[0.005, 0.2, 0.1]} />
            <meshBasicMaterial color={P.nebel} toneMapped={false} />
          </mesh>
          <pointLight position={[0.12, 0.1, 0]} intensity={0.6} distance={0.8} color={P.nebel} />
        </group>
      )}
    </group>
  );
};

/** 3d-store: low-poly street with the hero storefront (Funke awning), neighbours, people walking past on their phones. */
export const ThreeStore: React.FC<P3 & {sign?: string; neighbors?: string[] | false; walkers?: Walker[]; litAt?: TimeRef}> = (p) => {
  const c = useCtx(p);
  const lit = p.litAt !== undefined ? smooth((c.t - rel(p.litAt, c.words, c.t0)) / 0.8) : 1;
  const nb = p.neighbors === false ? [] : p.neighbors ?? ['BÄCKEREI', 'SALON'];
  return (
    <Scene3D p={p} c={c} camBase={{az: 18, el: 10, dist: 15, tx: 0, ty: 1.6, tz: 0, fov: 32}}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 4]}>
        <planeGeometry args={[120, 80]} />
        <meshStandardMaterial color="#0F2F34" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.05, 1.2]}>
        <boxGeometry args={[30, 0.12, 2.6]} />
        <meshStandardMaterial color="#2B4E52" roughness={0.9} />
      </mesh>
      <Shop x={0} sign={p.sign ?? 'DEIN LADEN'} hero lit={lit} />
      {nb[0] && <Shop x={-3.6} sign={nb[0]} />}
      {nb[1] && <Shop x={3.6} sign={nb[1]} />}
      {nb[2] && <Shop x={-7.2} sign={nb[2]} />}
      {nb[3] && <Shop x={7.2} sign={nb[3]} />}
      {(p.walkers ?? []).map((w, i) => {
        const a = rel(w.at, c.words, c.t0), d = w.dur ?? 6;
        const q = clamp((c.t - a) / d);
        const x = lerp(w.from, w.to, q);
        return <Person key={i} x={x} z={w.z ?? 1.4} t={c.t + i} walking={q > 0 && q < 1} phone={w.phone !== false} face={w.to > w.from ? 0 : Math.PI} />;
      })}
    </Scene3D>
  );
};

// ---------------------------------------------------------------- tiles
/** 3d-tiles: feed tiles floating in space; irregular grey tiles flip one by one to a calm, consistent Chispa feed. */
export const ThreeTiles: React.FC<P3 & {cols?: number; rows?: number; motifs?: Motif[]; flipAt?: TimeRef; step?: number; order?: 'row' | 'random'; accentTile?: number; gap?: number; spread?: TimeRef}> = (p) => {
  const c = useCtx(p);
  const cols = p.cols ?? 3, rows = p.rows ?? 3, n = cols * rows;
  const tex = useCanvasTex(320, 320, n * 2);
  const motifs = p.motifs ?? ['cup', 'croissant', 'store', 'bean', 'text:Heute|frisch', 'cake', 'hours', 'cup', 'pin'];
  for (let i = 0; i < n; i++) {
    drawGreyTile(tex[i].ctx, 0, 0, 320, i + 11);
    tex[i].tex.needsUpdate = true;
    drawFreshTile(tex[n + i].ctx, 0, 0, 320, motifs[i % motifs.length], i, i === p.accentTile);
    tex[n + i].tex.needsUpdate = true;
  }
  const mats = useMemo(
    () =>
      Array.from({length: n}, (_, i) => {
        const side = new THREE.MeshStandardMaterial({color: '#D9E2DC', roughness: 0.6});
        return [side, side, side, side, new THREE.MeshStandardMaterial({map: tex[i].tex, roughness: 0.55}), new THREE.MeshStandardMaterial({map: tex[n + i].tex, roughness: 0.45})];
      }),
    [n, tex],
  );
  const flip0 = p.flipAt !== undefined ? rel(p.flipAt, c.words, c.t0) : 1e9;
  const step = p.step ?? 0.18;
  const order = Array.from({length: n}, (_, i) => i);
  if (p.order === 'random') order.sort((a, b) => rand(a + 3) - rand(b + 3));
  const gap = p.gap ?? 1.1;
  // before: scattered in depth (spread 1), after the last flip: a tidy grid
  const settle = smooth((c.t - (flip0 + n * step)) / 0.9);
  return (
    <Scene3D p={p} c={c} camBase={{az: -14, el: 8, dist: 9.5, tx: 0, ty: 0, tz: 0, fov: 32}}>
      {order.map((idx, k) => {
        const i = idx;
        const col = i % cols, row = Math.floor(i / cols);
        const ft = flip0 + k * step;
        const f = ease.inOut(clamp((c.t - ft) / 0.55));
        const mess = 1 - settle;
        const x = (col - (cols - 1) / 2) * gap + (rand(i + 1) - 0.5) * 0.35 * mess;
        const y = ((rows - 1) / 2 - row) * gap + (rand(i + 2) - 0.5) * 0.35 * mess + Math.sin((c.t + c.t0) * 1.1 + i) * 0.04 * mess;
        const z = (rand(i + 5) - 0.5) * 1.6 * mess + Math.sin(f * Math.PI) * 0.6;
        const rx = (rand(i + 7) - 0.5) * 0.5 * mess, rz = (rand(i + 9) - 0.5) * 0.35 * mess;
        return (
          <mesh key={i} position={[x, y, z]} rotation={[rx, f * Math.PI, rz]} material={mats[i]}>
            <boxGeometry args={[1, 1, 0.06]} />
          </mesh>
        );
      })}
    </Scene3D>
  );
};

// ---------------------------------------------------------------- tags / receipts
type Tag = {text: string; sub?: string; at: TimeRef; accent?: boolean; kind?: 'tag' | 'receipt'; lines?: string[]; total?: string; x?: number};
const TagMesh: React.FC<{tg: Tag}> = ({tg}) => {
  const isR = tg.kind === 'receipt';
  const [s] = useCanvasTex(isR ? 400 : 512, isR ? 720 : 256);
  if (isR) drawReceipt(s.ctx, 400, 720, tg.lines ?? [], tg.total);
  else drawTag(s.ctx, 512, 256, tg.text, tg.sub, !!tg.accent);
  s.tex.needsUpdate = true;
  const geo = useMemo(() => {
    if (isR) return new THREE.BoxGeometry(1.4, 2.5, 0.02);
    const sh = new THREE.Shape();
    sh.moveTo(-1, -0.5);
    sh.lineTo(0.6, -0.5);
    sh.lineTo(1, 0);
    sh.lineTo(0.6, 0.5);
    sh.lineTo(-1, 0.5);
    sh.closePath();
    const hole = new THREE.Path();
    hole.absarc(0.62, 0, 0.08, 0, Math.PI * 2, true);
    sh.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(sh, {depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2});
    g.rotateY(Math.PI); // hole on the left
    // planar UVs on the front
    const pos = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + 1) / 2, (pos.getY(i) + 0.5));
    return g;
  }, [isR]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial map={s.tex} roughness={0.6} />
    </mesh>
  );
};
/** 3d-tags: price tags or receipts drop in, bounce and stack. */
export const ThreeTags: React.FC<P3 & {tags: Tag[]}> = (p) => {
  const c = useCtx(p);
  return (
    <Scene3D p={p} c={c} camBase={{az: 0, el: 18, dist: 11, tx: 0, ty: 0.4, tz: 0, fov: 30}}>
      {p.tags.map((tg, i) => {
        const a = rel(tg.at, c.words, c.t0);
        const q = clamp((c.t - a) / 0.7);
        const b = q < 1 ? 1 - Math.abs(Math.cos(q * Math.PI * 1.5)) * (1 - q) : 1;
        const restY = -1.6 + i * 0.75;
        const y = lerp(7, restY, ease.out(q)) + (q < 1 ? (1 - b) * 0.15 : 0);
        const rz = lerp((rand(i + 2) - 0.5) * 1.6, (rand(i + 4) - 0.5) * 0.18, ease.out(q));
        if (c.t < a) return null;
        return (
          <group key={i} position={[tg.x ?? (rand(i + 6) - 0.5) * 0.6, y, i * 0.07]} rotation={[-0.35 + 0.3 * q, 0, rz]}>
            <TagMesh tg={tg} />
          </group>
        );
      })}
      <SoftShadow y={-2.2} w={4} d={1.4} />
    </Scene3D>
  );
};

// ---------------------------------------------------------------- text planes
type Line3 = {text: string; at?: TimeRef; fromWord?: number; size?: number; y?: number; accent?: boolean; font?: 'title' | 'text'};
const TextPlane: React.FC<{ln: Line3; q: number}> = ({ln, q}) => {
  const size = ln.size ?? 1;
  const [s] = useCanvasTex(1600, 260);
  const g = s.ctx;
  g.clearRect(0, 0, 1600, 260);
  g.font = `700 ${ln.font === 'text' ? 120 : 210}px "${ln.font === 'text' ? FONT.text : FONT.title}"`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = ln.accent ? P.funke : P.nebel;
  g.fillText(ln.text, 800, 140);
  const w = Math.min(1560, g.measureText(ln.text).width);
  if (ln.accent) g.fillRect(800 - w / 2, 236, w * q, 10);
  s.tex.needsUpdate = true;
  return (
    <mesh>
      <planeGeometry args={[size * 6.15, size]} />
      <meshBasicMaterial map={s.tex} transparent opacity={q} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};
/** 3d-text: headline lines on planes that swing up out of depth (Karantina), one optional Funke line. */
export const ThreeText: React.FC<P3 & {lines: Line3[]}> = (p) => {
  const c = useCtx(p);
  return (
    <Scene3D p={p} c={c} camBase={{az: -8, el: 6, dist: 10, tx: 0, ty: 0, tz: 0, fov: 30}}>
      {p.lines.map((ln, i) => {
        const a = ln.fromWord !== undefined ? c.words[Math.min(ln.fromWord, c.words.length - 1)][1] - c.t0 : rel(ln.at ?? 0.2 + i * 0.4, c.words, c.t0);
        const q = ease.out(clamp((c.t - a) / 0.8));
        return (
          <group key={i} position={[0, ln.y ?? 1 - i * 1.2, lerp(-5, 0, q)]} rotation={[lerp(-1.1, 0, q), 0, 0]}>
            <TextPlane ln={ln} q={q} />
          </group>
        );
      })}
      <SoftShadow y={-2.4} w={7} d={1.6} o={0.5} />
    </Scene3D>
  );
};

// ---------------------------------------------------------------- SFX
export const threeCues = (p: P3 & Record<string, unknown>, _dur: number, words?: Word[]): Sfx[] => {
  const w = words ?? (p.words as Word[]) ?? [];
  const t0 = (p.sceneStart as number) ?? 0;
  const r = (v: TimeRef) => (typeof v === 'number' ? v : rel(v, w, t0));
  const out: Sfx[] = [];
  for (const k of p.cam ?? []) if ((k.dur ?? 1.2) > 0.3 && r(k.at) > 0.05) out.push({src: 'sfx/whoosh-deep.mp3', at: r(k.at), volume: 0.22});
  for (const k of (p.phone as Key[] | undefined) ?? []) if (r(k.at) > 0.05 && typeof k.ry === 'number') out.push({src: 'sfx/whoosh-fast.mp3', at: r(k.at), volume: 0.14});
  if (p.type === '3d-tiles' && p.flipAt !== undefined) {
    const n = ((p.cols as number) ?? 3) * ((p.rows as number) ?? 3);
    for (let i = 0; i < n; i++) out.push({src: 'sfx/tick.mp3', at: r(p.flipAt as TimeRef) + i * ((p.step as number) ?? 0.18) + 0.25, volume: 0.16});
    out.push({src: 'sfx/pop.mp3', at: r(p.flipAt as TimeRef) + n * ((p.step as number) ?? 0.18) + 0.5, volume: 0.3});
  }
  for (const tg of (p.tags as Tag[] | undefined) ?? []) out.push({src: 'sfx/hit.mp3', at: r(tg.at) + 0.45, volume: 0.25});
  for (const ln of (p.lines as Line3[] | undefined) ?? []) {
    const a = ln.fromWord !== undefined && w.length ? w[ln.fromWord][1] - t0 : ln.at !== undefined ? r(ln.at) : null;
    if (a !== null && a > 0.05) out.push({src: 'sfx/whoosh-fast.mp3', at: a - 0.05, volume: 0.16});
  }
  for (const s of (p.screens as ScreenIn[] | undefined) ?? []) {
    if (s.at !== undefined && r(s.at) > 0.05) out.push({src: 'sfx/tick.mp3', at: r(s.at), volume: 0.2});
    for (const k of s.checks ?? []) out.push({src: 'sfx/pop.mp3', at: r(k.at), volume: 0.3});
    for (const m of s.messages ?? []) out.push({src: 'sfx/pop.mp3', at: r(m.at), volume: 0.18});
    if (s.stamp) out.push({src: 'sfx/snap.mp3', at: r(s.stamp.at), volume: 0.3});
    if (s.freshAt !== undefined) for (let i = 0; i < 9; i += 2) out.push({src: 'sfx/pop.mp3', at: r(s.freshAt) + i * (s.step ?? 0.12), volume: 0.14});
  }
  return out;
};
