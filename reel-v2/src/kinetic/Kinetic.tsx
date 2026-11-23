// KINETIC mode: Swiss / kinetic typography. Huge Karantina words snap, mask, slide or stack on a flat Nebel,
// Petrol or Tinte field, a thin Swiss grid with tiny mono meta text, and exactly ONE Funke stroke per beat.
// Scene type: kin-words (beats in sync with the voice).
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sfx, Word} from '../spec';
import {getTheme, useFontsReady} from '../themes';
import {rel, TimeRef} from '../lineart/LineArt';
import {clamp, ease, lerp, smooth} from '../lib/anim';

type KLine = {text: string; size?: number; accent?: string[]; fromWord?: number; at?: TimeRef; font?: 'title' | 'text' | 'mono'; color?: 'muted'};
type Beat = {
  at?: TimeRef;
  fromWord?: number;
  lines: KLine[];
  anim?: 'snap' | 'mask' | 'slide' | 'stack';
  stroke?: 'under' | 'bar' | 'strike' | 'circle' | 'none';
  align?: 'left' | 'center';
  y?: number;
  bg?: 'nebel' | 'petrol' | 'tinte';
};
export type KinProps = {
  type: string;
  theme?: string;
  bg?: 'nebel' | 'petrol' | 'tinte';
  meta?: string; // tiny mono text top-left, e.g. "TIPP / 03"
  beats: Beat[];
  dur: number;
  words: Word[];
  sceneStart: number;
  [k: string]: unknown;
};

const BG = {nebel: '#EEF4EF', petrol: '#0F5560', tinte: '#0B2125'};
const FG = {nebel: '#0B2125', petrol: '#EEF4EF', tinte: '#EEF4EF'};
const MUTED = {nebel: '#5F7F78', petrol: '#9DB8A4', tinte: '#9DB8A4'};
let mspan: HTMLSpanElement | null = null;
/** text width in px, measured in the DOM with the real (already loaded) font */
const measure = (text: string, fam: string, size: number) => {
  if (typeof document === 'undefined') return text.length * size * 0.4;
  if (!mspan) {
    mspan = document.createElement('span');
    Object.assign(mspan.style, {position: 'absolute', visibility: 'hidden', whiteSpace: 'pre', left: '-9999px', top: '0', fontWeight: '700'});
    document.body.appendChild(mspan);
  }
  mspan.style.fontFamily = fam;
  mspan.style.fontSize = size + 'px';
  mspan.textContent = text;
  const mw = mspan.getBoundingClientRect().width;
  return mw;
};
const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\d]/gu, '');

const beatStart = (b: Beat, words: Word[], t0: number) =>
  b.fromWord !== undefined ? words[Math.min(b.fromWord, words.length - 1)][1] - t0 - 0.04 : rel(b.at ?? 0, words, t0);

export const KinWords: React.FC<KinProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const th = getTheme(p.theme);
  useFontsReady(p.theme);
  const starts = p.beats.map((b) => beatStart(b, p.words, p.sceneStart));
  let bi = 0;
  starts.forEach((s, i) => {
    if (t >= s - 1e-4) bi = i;
  });
  const beat = p.beats[bi];
  const bgK = beat.bg ?? p.bg ?? 'nebel';
  const prevBg = bi > 0 ? p.beats[bi - 1].bg ?? p.bg ?? 'nebel' : bgK;
  const bgQ = bi > 0 && prevBg !== bgK ? ease.inOut(clamp((t - starts[bi]) / 0.35)) : 1;
  const fg = FG[bgK], muted = MUTED[bgK];
  const b0 = starts[bi];
  const next = starts[bi + 1] ?? p.dur + 1;
  const exit = ease.in(clamp((t - (next - 0.2)) / 0.2));
  const anim = beat.anim ?? 'snap';
  const align = beat.align ?? 'left';
  const famOf = (l: KLine) => (l.font === 'text' ? th.fonts.text : l.font === 'mono' ? th.fonts.mono : th.fonts.title);
  const sizes = beat.lines.map((l) => {
    const s0 = l.size ?? (l.font === 'text' ? 64 : l.font === 'mono' ? 34 : 230);
    const w = measure(l.text, famOf(l), s0) + s0 * 0.22 * (l.text.split(' ').length - 1) * 0.3;
    return w > 930 ? Math.floor((s0 * 930) / w) : s0;
  });
  const heights = sizes.map((s, i) => s * (beat.lines[i].font === 'title' || !beat.lines[i].font ? 0.9 : 1.25));
  const total = heights.reduce((a, b) => a + b, 0);
  let y = (beat.y ?? 880) - total / 2;
  const els: React.ReactNode[] = [];
  let strokeBox: {x: number; y: number; w: number; h: number; at: number} | null = null;
  beat.lines.forEach((ln, li) => {
    const size = sizes[li];
    const lt = ln.fromWord !== undefined ? p.words[Math.min(ln.fromWord, p.words.length - 1)][1] - p.sceneStart - 0.04 : ln.at !== undefined ? rel(ln.at, p.words, p.sceneStart) : b0 + li * 0.12;
    const q = clamp((t - lt) / (anim === 'slide' ? 0.42 : 0.3));
    const fam = ln.font === 'text' ? th.fonts.text : ln.font === 'mono' ? th.fonts.mono : th.fonts.title;
    let tf = '', op = 1, blur = 0;
    if (anim === 'snap') {
      const e = ease.snap(q);
      tf = `scale(${lerp(1.35, 1, e)})`;
      op = clamp(q * 3);
      blur = (1 - clamp(q * 2)) * 14;
    } else if (anim === 'mask') {
      tf = `translateY(${(1 - ease.out(q)) * 105}%)`;
    } else if (anim === 'slide') {
      tf = `translateX(${(1 - ease.out(q)) * (li % 2 ? 1100 : -1100)}px) skewX(${(1 - ease.out(q)) * -14}deg)`;
    } else {
      tf = `translateY(${(1 - ease.snap(q)) * -160}px)`;
      op = clamp(q * 2.5);
    }
    if (exit > 0) tf += ` translateY(${-exit * 110}%)`;
    const h = heights[li];
    const ws = ln.text.split(' ');
    const acc = (w: string) => (ln.accent ?? []).some((a) => norm(a) === norm(w));
    els.push(
      <div key={li} style={{position: 'absolute', left: 72, right: 72, top: y, height: h, overflow: anim === 'mask' || exit > 0 ? 'hidden' : 'visible', textAlign: align}}>
        <div
          style={{
            fontFamily: fam,
            fontWeight: 700,
            fontSize: size,
            lineHeight: `${h}px`,
            letterSpacing: ln.font === 'mono' ? 6 : ln.font === 'text' ? 0 : 1,
            color: ln.color === 'muted' ? muted : fg,
            transform: tf,
            transformOrigin: align === 'left' ? 'left center' : 'center center',
            opacity: op * (1 - (anim === 'mask' ? 0 : exit)),
            filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
            whiteSpace: 'nowrap',
          }}
        >
          {ws.map((w, i) => (
            <span key={i} data-acc={acc(w) ? 1 : 0} style={{color: acc(w) ? th.accent : undefined, marginRight: '0.22em'}}>
              {w}
            </span>
          ))}
        </div>
      </div>,
    );
    if ((ln.accent ?? []).length && !strokeBox) {
      // accent word box from DOM measurements (fonts are loaded: useFontsReady)
      let x = 72;
      const widths = ws.map((w) => measure(w, fam, size));
      const lineW = widths.reduce((a, b) => a + b, 0) + (ws.length - 1) * size * 0.22;
      if (align === 'center') x = 540 - lineW / 2;
      for (let i = 0; i < ws.length; i++) {
        if (acc(ws[i])) {
          strokeBox = {x, y, w: widths[i], h, at: lt + 0.25};
          break;
        }
        x += widths[i] + size * 0.22;
      }
    }
    y += h;
  });
  // the ONE Funke stroke
  const stroke = beat.stroke ?? (strokeBox ? 'under' : 'bar');
  let strokeEl: React.ReactNode = null;
  const sq = (a: number) => ease.inOut(clamp((t - a) / 0.45)) * (1 - exit);
  if (stroke === 'under' && strokeBox) {
    const sb = strokeBox as {x: number; y: number; w: number; h: number; at: number};
    strokeEl = <div style={{position: 'absolute', left: sb.x, top: sb.y + sb.h * 0.98, height: 14, width: sb.w * sq(sb.at), background: th.accent}} />;
  } else if (stroke === 'strike' && strokeBox) {
    const sb = strokeBox as {x: number; y: number; w: number; h: number; at: number};
    strokeEl = <div style={{position: 'absolute', left: sb.x - 10, top: sb.y + sb.h * 0.5, height: 16, width: (sb.w + 20) * sq(sb.at), background: th.accent, transform: 'rotate(-4deg)'}} />;
  } else if (stroke === 'circle' && strokeBox) {
    const sb = strokeBox as {x: number; y: number; w: number; h: number; at: number};
    const L = 2 * Math.PI * Math.max(sb.w, sb.h);
    strokeEl = (
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <ellipse cx={sb.x + sb.w / 2} cy={sb.y + sb.h / 2} rx={sb.w * 0.62} ry={sb.h * 0.55} fill="none" stroke={th.accent} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={L} strokeDashoffset={L * (1 - sq(sb.at))} transform={`rotate(-6 ${sb.x + sb.w / 2} ${sb.y + sb.h / 2})`} />
      </svg>
    );
  } else if (stroke === 'bar') {
    const top0 = (beat.y ?? 880) - total / 2;
    strokeEl = <div style={{position: 'absolute', left: 40, top: top0, width: 12, height: total * sq(b0 + 0.1), background: th.accent}} />;
  }
  return (
    <AbsoluteFill style={{background: BG[prevBg]}}>
      <AbsoluteFill style={{background: BG[bgK], clipPath: `inset(${(1 - bgQ) * 100}% 0 0 0)`}} />
      {/* Swiss grid: thin rules + tiny meta */}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 0.5}}>
        {[72, 1008].map((x) => (
          <line key={x} x1={x} x2={x} y1={250} y2={250 + 1250 * smooth(t / 0.8)} stroke={muted} strokeWidth={1.2} />
        ))}
        <line x1={72} x2={72 + 936 * smooth(t / 0.8)} y1={250} y2={250} stroke={muted} strokeWidth={1.2} />
        <line x1={72} x2={72 + 936 * smooth(t / 0.8)} y1={1500} y2={1500} stroke={muted} strokeWidth={1.2} />
      </svg>
      <div style={{position: 'absolute', left: 72, top: 212, fontFamily: th.fonts.mono, fontSize: 26, letterSpacing: 5, color: muted}}>{p.meta ?? 'CHISPA'}</div>
      <div style={{position: 'absolute', right: 72, top: 212, fontFamily: th.fonts.mono, fontSize: 26, letterSpacing: 5, color: muted}}>
        {String(bi + 1).padStart(2, '0')} / {String(p.beats.length).padStart(2, '0')}
      </div>
      {els}
      {strokeEl}
    </AbsoluteFill>
  );
};

export const kinCues = (p: KinProps, _dur: number, words?: Word[]): Sfx[] => {
  const w = words ?? p.words ?? [];
  return p.beats.flatMap((b, i) => {
    const a = beatStart(b, w, p.sceneStart ?? 0);
    const anim = b.anim ?? 'snap';
    const src = anim === 'slide' ? 'sfx/whoosh-fast.mp3' : anim === 'snap' ? 'sfx/hit.mp3' : 'sfx/snap.mp3';
    return i === 0 && a < 0.05 ? [] : [{src, at: a, volume: anim === 'snap' ? 0.22 : 0.2}];
  });
};
