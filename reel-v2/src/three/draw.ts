// Canvas-2D drawings used as textures by the 3D scenes: phone screens (feed, profile, chat, post, store),
// feed tiles (calm Chispa motifs vs. grey irregular "before" tiles), price tags, receipts and text planes.
// Everything is deterministic (seeded) so frames render identically in parallel.
import {clamp, ease, rand, smooth} from '../lib/anim';

export const P = {petrol: '#0F5560', nebel: '#EEF4EF', tinte: '#0B2125', funke: '#FF8A3D', salbei: '#9DB8A4', deep: '#0A2A2F', mid: '#164A52'};
export const FONT = {title: 'CH-Karantina', text: 'CH-Noto', mono: 'LA-Mono'};
type X = CanvasRenderingContext2D;

export const rr = (c: X, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};
const font = (c: X, size: number, fam = FONT.text, w = 700) => (c.font = `${w} ${size}px "${fam}"`);

// ---------------------------------------------------------------- motifs (line icons in a w×h box)
export type Motif = string; // cup | croissant | cake | store | hours | pin | team | wrench | car | bean | text:<word> | week
export const drawMotif = (c: X, m: Motif, x: number, y: number, w: number, h: number, col = P.nebel, accent = false) => {
  const s = Math.min(w, h) / 100;
  c.save();
  c.translate(x + w / 2, y + h / 2);
  c.scale(s, s);
  c.strokeStyle = accent ? P.funke : col;
  c.fillStyle = accent ? P.funke : col;
  c.lineWidth = 3.2;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  const L = (...p: number[]) => {
    c.beginPath();
    c.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]);
    c.stroke();
  };
  if (m === 'cup') {
    L(-22, -8, -18, 24, 14, 24, 18, -8, -22, -8);
    c.beginPath();
    c.arc(22, 6, 9, -Math.PI / 2, Math.PI / 2);
    c.stroke();
    L(-24, 30, 20, 30);
    c.beginPath();
    c.moveTo(-8, -16);
    c.bezierCurveTo(-14, -24, -2, -28, -8, -36);
    c.moveTo(4, -16);
    c.bezierCurveTo(-2, -24, 10, -28, 4, -36);
    c.stroke();
  } else if (m === 'croissant') {
    c.beginPath();
    c.moveTo(-34, 10);
    c.quadraticCurveTo(-20, -26, 0, -24);
    c.quadraticCurveTo(20, -26, 34, 10);
    c.quadraticCurveTo(0, 0, -34, 10);
    c.stroke();
    L(-14, -18, -8, 2);
    L(0, -24, 0, 0);
    L(14, -18, 8, 2);
  } else if (m === 'cake') {
    L(-28, 24, 28, 24, 28, -4, -28, -4, -28, 24);
    c.beginPath();
    c.moveTo(-28, 6);
    c.quadraticCurveTo(-14, 14, 0, 6);
    c.quadraticCurveTo(14, -2, 28, 6);
    c.stroke();
    L(0, -4, 0, -18);
    c.beginPath();
    c.arc(0, -23, 4, 0, Math.PI * 2);
    c.fill();
  } else if (m === 'store') {
    L(-34, 30, -34, -6, 34, -6, 34, 30);
    L(-40, -6, -34, -24, 34, -24, 40, -6);
    L(-24, 30, -24, 4, -4, 4, -4, 30);
    L(6, 4, 26, 4, 26, 20, 6, 20, 6, 4);
  } else if (m === 'hours') {
    c.beginPath();
    c.arc(0, 0, 26, 0, Math.PI * 2);
    c.stroke();
    L(0, -14, 0, 0, 12, 8);
  } else if (m === 'pin') {
    c.beginPath();
    c.moveTo(0, 32);
    c.bezierCurveTo(-30, -2, -22, -32, 0, -32);
    c.bezierCurveTo(22, -32, 30, -2, 0, 32);
    c.stroke();
    c.beginPath();
    c.arc(0, -10, 8, 0, Math.PI * 2);
    c.stroke();
  } else if (m === 'team') {
    for (const dx of [-24, 0, 24]) {
      c.beginPath();
      c.arc(dx, -12 + (dx ? 4 : 0), 8, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.arc(dx, 22 + (dx ? 4 : 0), 14, Math.PI, 0);
      c.stroke();
    }
  } else if (m === 'wrench') {
    L(-24, 24, 6, -6);
    c.beginPath();
    c.arc(13, -13, 11, Math.PI * 0.75, Math.PI * 2.25 - 0.6);
    c.stroke();
  } else if (m === 'car') {
    L(-38, 14, -38, 0, -26, -4, -16, -20, 16, -20, 28, -4, 38, 0, 38, 14, -38, 14);
    for (const dx of [-22, 22]) {
      c.beginPath();
      c.arc(dx, 16, 8, 0, Math.PI * 2);
      c.stroke();
    }
  } else if (m === 'bean') {
    c.beginPath();
    c.ellipse(0, 0, 18, 26, 0.5, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.moveTo(-10, -18);
    c.quadraticCurveTo(6, 0, 10, 18);
    c.stroke();
  } else if (m === 'week') {
    L(-28, -22, 28, -22, 28, 26, -28, 26, -28, -22);
    L(-28, -10, 28, -10);
    L(-14, -30, -14, -16);
    L(14, -30, 14, -16);
    L(-10, 10, -2, 18, 14, 0);
  } else if (m.startsWith('text:')) {
    font(c, 40, FONT.title);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const lines = m.slice(5).split('|');
    lines.forEach((ln, i) => c.fillText(ln, 0, (i - (lines.length - 1) / 2) * 40));
  }
  c.restore();
};

const FRESH_BG = [P.petrol, P.mid, P.deep, '#1F5E66', P.petrol, '#2C6B63', P.mid, P.deep, '#1F5E66'];
/** calm, consistent tile: palette background, one centred line motif, thin inner frame */
export const drawFreshTile = (c: X, x: number, y: number, w: number, m: Motif, i: number, accent = false) => {
  c.fillStyle = FRESH_BG[i % FRESH_BG.length];
  c.fillRect(x, y, w, w);
  const g = c.createRadialGradient(x + w * 0.5, y + w * 0.45, 0, x + w * 0.5, y + w * 0.5, w * 0.75);
  g.addColorStop(0, 'rgba(238,244,239,0.10)');
  g.addColorStop(1, 'rgba(0,0,0,0.12)');
  c.fillStyle = g;
  c.fillRect(x, y, w, w);
  drawMotif(c, m, x + w * 0.18, y + w * 0.16, w * 0.64, w * 0.64, P.nebel, accent);
  c.fillStyle = 'rgba(238,244,239,0.55)';
  c.fillRect(x + w * 0.36, y + w * 0.86, w * 0.28, Math.max(2, w * 0.012));
};
/** grey, irregular "before" tile: random exposure, tilt, clashing type, blur blobs */
export const drawGreyTile = (c: X, x: number, y: number, w: number, seed: number) => {
  const r = (k: number) => rand(seed * 7.13 + k);
  const base = 70 + Math.floor(r(1) * 120);
  c.fillStyle = `rgb(${base},${base + 2},${base + 3})`;
  c.fillRect(x, y, w, w);
  c.save();
  c.beginPath();
  c.rect(x, y, w, w);
  c.clip();
  c.translate(x + w / 2, y + w / 2);
  c.rotate((r(2) - 0.5) * 0.5);
  const kind = Math.floor(r(3) * 4);
  for (let k = 0; k < 4; k++) {
    const v = 40 + Math.floor(r(10 + k) * 170);
    c.fillStyle = `rgba(${v},${v},${v},0.55)`;
    c.beginPath();
    c.ellipse((r(20 + k) - 0.5) * w * 0.8, (r(30 + k) - 0.5) * w * 0.8, w * (0.12 + r(40 + k) * 0.3), w * (0.1 + r(50 + k) * 0.25), r(60 + k) * 3, 0, Math.PI * 2);
    c.fill();
  }
  if (kind === 0) {
    c.fillStyle = 'rgba(30,30,30,0.85)';
    font(c, w * 0.2, 'serif', 700);
    c.textAlign = 'center';
    c.fillText('SALE!!', 0, w * 0.06);
  } else if (kind === 1) {
    c.fillStyle = 'rgba(240,240,240,0.8)';
    font(c, w * 0.12, 'sans-serif', 400);
    c.textAlign = 'center';
    c.fillText('heute offen??', 0, 0);
  } else if (kind === 2) {
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.fillRect(-w, -w, w * 2, w * 2);
  }
  c.restore();
};

// ---------------------------------------------------------------- phone screens
export type ScreenSpec = {
  kind: 'feed' | 'profile' | 'chat' | 'post' | 'store' | 'blank';
  name?: string;
  motifs?: Motif[];
  tiles?: 'fresh' | 'grey' | 'empty';
  freshAt?: number; // scene-local seconds (resolved)
  step?: number;
  staleAt?: number;
  stamp?: {text: string; at: number};
  checks?: {key: 'photo' | 'hours' | 'week'; at: number}[];
  info?: string;
  messages?: {from: 'me' | 'them'; text: string; at: number}[];
  caption?: string;
  motif?: Motif;
  sign?: string;
};

const statusBar = (c: X, W: number, dark = true) => {
  c.fillStyle = dark ? 'rgba(238,244,239,0.75)' : 'rgba(11,33,37,0.7)';
  font(c, 26, FONT.text, 600);
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillText('19:00', 46, 46);
  c.fillRect(W - 110, 38, 46, 18);
  c.fillStyle = '#000';
  rr(c, W / 2 - 70, 26, 140, 40, 20);
  c.fill();
};

export const drawScreen = (c: X, W: number, H: number, s: ScreenSpec, t: number) => {
  c.clearRect(0, 0, W, H);
  c.fillStyle = s.kind === 'store' ? '#123C43' : P.tinte;
  c.fillRect(0, 0, W, H);
  if (s.kind === 'blank') return statusBar(c, W);
  if (s.kind === 'store') {
    // the hook: a shop window drawn inside the phone
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0F4A53');
    g.addColorStop(1, '#0B2125');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    statusBar(c, W);
    const x0 = W * 0.1, w = W * 0.8, top = H * 0.3, bot = H * 0.78;
    c.fillStyle = '#DDE6E0';
    c.fillRect(x0, top, w, bot - top);
    // awning stripes (Funke + Nebel)
    for (let i = 0; i < 8; i++) {
      c.fillStyle = i % 2 ? P.nebel : P.funke;
      c.beginPath();
      c.moveTo(x0 - 20 + (i * (w + 40)) / 8, top);
      c.lineTo(x0 - 20 + ((i + 1) * (w + 40)) / 8, top);
      c.lineTo(x0 - 20 + ((i + 1) * (w + 40)) / 8, top + 70);
      c.lineTo(x0 - 20 + (i * (w + 40)) / 8, top + 70);
      c.fill();
    }
    c.fillStyle = P.nebel;
    font(c, 64, FONT.title);
    c.textAlign = 'center';
    c.fillText(s.sign ?? 'DEIN LADEN', W / 2, top - 40);
    const wg = c.createLinearGradient(0, top + 110, 0, bot);
    wg.addColorStop(0, '#2C7C86');
    wg.addColorStop(1, '#0F5560');
    c.fillStyle = wg;
    c.fillRect(x0 + 30, top + 110, w * 0.52, bot - top - 140);
    c.fillStyle = '#0F3B42';
    c.fillRect(x0 + w * 0.66, top + 110, w * 0.26, bot - top - 110);
    c.fillStyle = 'rgba(255,255,255,0.18)';
    c.beginPath();
    c.moveTo(x0 + 60, top + 110);
    c.lineTo(x0 + 120, top + 110);
    c.lineTo(x0 + 40, bot - 30);
    c.lineTo(x0 + 30, bot - 30);
    c.fill();
    c.fillStyle = '#C8D3CD';
    c.fillRect(0, bot, W, 14);
    return;
  }
  statusBar(c, W);
  if (s.kind === 'chat') {
    c.fillStyle = P.deep;
    c.fillRect(0, 80, W, 110);
    c.fillStyle = P.petrol;
    c.beginPath();
    c.arc(80, 135, 32, 0, Math.PI * 2);
    c.fill();
    drawMotif(c, 'text:Ch', 50, 105, 60, 60);
    c.fillStyle = P.nebel;
    font(c, 32, FONT.text, 700);
    c.textAlign = 'left';
    c.fillText(s.name ?? 'Chispa Studio', 130, 125);
    font(c, 22, FONT.text, 500);
    c.fillStyle = P.salbei;
    c.fillText('online', 130, 160);
    let y = 240;
    for (const m of s.messages ?? []) {
      const q = smooth((t - m.at) / 0.25);
      if (q <= 0) {
        if (m.from === 'them' && t > m.at - 0.8) {
          c.fillStyle = P.mid;
          rr(c, 40, y, 120, 64, 30);
          c.fill();
          for (let k = 0; k < 3; k++) {
            c.fillStyle = `rgba(238,244,239,${0.4 + 0.5 * Math.max(0, Math.sin(t * 8 - k))})`;
            c.beginPath();
            c.arc(72 + k * 28, y + 32, 7, 0, Math.PI * 2);
            c.fill();
          }
        }
        break;
      }
      font(c, 30, FONT.text, 500);
      const words = m.text.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        const tt = cur ? cur + ' ' + w : w;
        if (c.measureText(tt).width > W * 0.62 && cur) {
          lines.push(cur);
          cur = w;
        } else cur = tt;
      }
      if (cur) lines.push(cur);
      const bw = Math.max(...lines.map((l) => c.measureText(l).width)) + 50;
      const bh = lines.length * 40 + 32;
      const bx = m.from === 'me' ? W - 40 - bw : 40;
      c.save();
      c.globalAlpha = q;
      c.translate(0, (1 - q) * 20);
      c.fillStyle = m.from === 'me' ? P.petrol : '#1B4148';
      rr(c, bx, y, bw, bh, 26);
      c.fill();
      c.fillStyle = P.nebel;
      c.textAlign = 'left';
      c.textBaseline = 'top';
      lines.forEach((l, i) => c.fillText(l, bx + 25, y + 18 + i * 40));
      c.restore();
      y += bh + 22;
    }
    return;
  }
  if (s.kind === 'post') {
    c.fillStyle = P.nebel;
    font(c, 28, FONT.text, 700);
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillText(s.name ?? 'dein.laden', 110, 130);
    c.fillStyle = P.petrol;
    c.beginPath();
    c.arc(70, 130, 26, 0, Math.PI * 2);
    c.fill();
    drawFreshTile(c, 0, 180, W, s.motif ?? 'store', 0);
    c.fillStyle = 'rgba(238,244,239,0.8)';
    font(c, 26, FONT.text, 500);
    c.fillText(s.caption ?? '', 40, 180 + W + 60);
    return;
  }
  // feed / profile
  const checks = s.checks ?? [];
  const ck = (k: string) => {
    const c0 = checks.find((x) => x.key === k);
    return c0 ? smooth((t - c0.at) / 0.4) : s.kind === 'profile' ? 0 : 1;
  };
  const photo = ck('photo'), hours = ck('hours'), week = ck('week');
  // only the most recent check carries the Funke accent (one orange element per frame)
  let latest = '';
  for (const k of checks) if (t >= k.at && (!latest || k.at >= (checks.find((x) => x.key === latest)?.at ?? -1))) latest = k.key;
  const accentOf = (k: string) => latest === k;
  // header: avatar + name + bio
  const ax = 100, ay = 190;
  c.fillStyle = mixHex('#6E7475', P.petrol, photo);
  c.beginPath();
  c.arc(ax, ay, 62, 0, Math.PI * 2);
  c.fill();
  if (photo > 0) {
    c.save();
    c.globalAlpha = photo;
    drawMotif(c, 'store', ax - 44, ay - 44, 88, 88);
    c.strokeStyle = accentOf('photo') ? P.funke : P.salbei;
    c.lineWidth = 6;
    c.beginPath();
    c.arc(ax, ay, 72, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * photo);
    c.stroke();
    c.restore();
  } else {
    c.fillStyle = '#8E9596';
    c.beginPath();
    c.arc(ax, ay - 12, 20, 0, Math.PI * 2);
    c.arc(ax, ay + 40, 34, Math.PI, 0);
    c.fill();
  }
  c.fillStyle = P.nebel;
  font(c, 34, FONT.text, 700);
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillText(s.name ?? 'dein.laden', 190, 160);
  c.fillStyle = 'rgba(238,244,239,0.35)';
  c.fillRect(190, 196, 220, 12);
  c.fillRect(190, 220, 160, 12);
  // info pill (hours + location)
  if (s.kind === 'profile') {
    const py = 280;
    c.save();
    c.globalAlpha = 0.25 + 0.75 * hours;
    c.strokeStyle = hours > 0.5 ? (accentOf('hours') ? P.funke : P.salbei) : 'rgba(238,244,239,0.3)';
    c.lineWidth = 3;
    rr(c, 40, py, W - 80, 92, 22);
    c.stroke();
    if (hours > 0) {
      drawMotif(c, 'hours', 52, py + 12, 68, 68);
      drawMotif(c, 'pin', W / 2 - 10, py + 12, 68, 68);
      c.fillStyle = P.nebel;
      font(c, 25, FONT.text, 600);
      c.fillText(s.info?.split('|')[0] ?? 'Di–Sa 9–18', 122, py + 46);
      c.fillText(s.info?.split('|')[1] ?? 'Hauptstr. 12', W / 2 + 60, py + 46);
    } else {
      c.fillStyle = 'rgba(238,244,239,0.3)';
      font(c, 25, FONT.text, 600);
      c.fillText('?', 70, py + 46);
      c.fillText('?', W / 2 + 20, py + 46);
    }
    c.restore();
  }
  // grid
  const gy = s.kind === 'profile' ? 400 : 290, gap = 6, tw = (W - gap * 2) / 3;
  c.fillStyle = 'rgba(238,244,239,0.6)';
  c.fillRect(W / 6 - 30, gy - 24, 60, 4);
  const motifs = s.motifs ?? ['cup', 'store', 'croissant', 'hours', 'cake', 'bean', 'team', 'pin', 'cup'];
  const rows = Math.ceil((H - gy) / (tw + gap));
  for (let i = 0; i < rows * 3; i++) {
    const x = (i % 3) * (tw + gap), y = gy + Math.floor(i / 3) * (tw + gap);
    let f = 0;
    if (s.tiles === 'fresh' || s.tiles === undefined) f = s.freshAt !== undefined ? smooth((t - s.freshAt - i * (s.step ?? 0.12)) / 0.3) : 1;
    if (s.kind === 'profile') f = i === 0 ? week : 0;
    if (s.tiles === 'empty' && s.freshAt === undefined) {
      c.strokeStyle = 'rgba(238,244,239,0.12)';
      c.lineWidth = 2;
      c.strokeRect(x + 2, y + 2, tw - 4, tw - 4);
      continue;
    }
    if (f < 1) {
      if (s.tiles === 'empty') {
        c.strokeStyle = 'rgba(238,244,239,0.12)';
        c.lineWidth = 2;
        c.strokeRect(x + 2, y + 2, tw - 4, tw - 4);
      } else drawGreyTile(c, x, y, tw, i + 3);
      if (s.staleAt !== undefined) {
        c.fillStyle = `rgba(11,33,37,${0.55 * smooth((t - s.staleAt) / 0.5)})`;
        c.fillRect(x, y, tw, tw);
      }
    }
    if (f > 0) {
      c.save();
      c.globalAlpha = f;
      c.translate(x + tw / 2, y + tw / 2);
      c.scale(0.85 + 0.15 * f, 0.85 + 0.15 * f);
      drawFreshTile(c, -tw / 2, -tw / 2, tw, s.kind === 'profile' ? 'week' : motifs[i % motifs.length], i, s.kind === 'profile');
      c.restore();
      if (s.kind === 'profile' && i === 0) {
        c.fillStyle = P.nebel;
        rr(c, x + 12, y + 12, 96, 36, 10);
        c.fill();
        c.fillStyle = P.tinte;
        font(c, 20, FONT.text, 800);
        c.textAlign = 'center';
        c.fillText('NEU', x + 60, y + 31);
        c.textAlign = 'left';
      }
    }
  }
  if (s.stamp && t >= s.stamp.at) {
    const q = ease.snap(clamp((t - s.stamp.at) / 0.3));
    c.save();
    c.translate(W / 2, gy + tw * 1.5);
    c.rotate(-0.08);
    c.scale(1.6 - 0.6 * q, 1.6 - 0.6 * q);
    c.globalAlpha = clamp(q * 1.5);
    font(c, 92, FONT.title);
    const tw2 = c.measureText(s.stamp.text).width + 60;
    c.fillStyle = 'rgba(11,33,37,0.85)';
    c.fillRect(-tw2 / 2, -62, tw2, 124);
    c.strokeStyle = P.nebel;
    c.lineWidth = 5;
    c.strokeRect(-tw2 / 2, -62, tw2, 124);
    c.fillStyle = P.nebel;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(s.stamp.text, 0, 6);
    c.restore();
  }
};

export const mixHex = (a: string, b: string, t: number) => {
  const h = (x: string) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const x = h(a), y = h(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * clamp(t))).join(',')})`;
};

/** price tag / receipt faces */
export const drawTag = (c: X, W: number, H: number, text: string, sub: string | undefined, accent: boolean) => {
  c.fillStyle = accent ? P.funke : P.nebel;
  c.fillRect(0, 0, W, H);
  c.fillStyle = P.tinte;
  font(c, H * 0.42, FONT.title);
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(text, W * 0.56, sub ? H * 0.42 : H * 0.52);
  if (sub) {
    font(c, H * 0.14, FONT.mono, 500);
    c.fillText(sub, W * 0.56, H * 0.78);
  }
};
export const drawReceipt = (c: X, W: number, H: number, lines: string[], total?: string) => {
  c.fillStyle = '#F4F7F3';
  c.fillRect(0, 0, W, H);
  c.fillStyle = P.tinte;
  font(c, 34, FONT.mono, 500);
  c.textAlign = 'left';
  c.textBaseline = 'top';
  lines.forEach((l, i) => c.fillText(l, 40, 60 + i * 56));
  c.fillRect(40, 60 + lines.length * 56 + 10, W - 80, 3);
  if (total) {
    font(c, 64, FONT.title);
    c.fillText(total, 40, 60 + lines.length * 56 + 40);
  }
};
