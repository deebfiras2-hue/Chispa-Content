// Chispa carousel / image renderer.
// usage: node tools/carousel/render.js <slides.json> <outdir> [--size 1080x1350] [--sheet sheet.jpg]
// slides.json: {"size": "1080x1350", "slides": [{"bg": "nebel|petrol|tinte", "html": "...", "logo": true, "n": true}]}
// Writes <outdir>/1.jpg, 2.jpg … (JPEG q92). Uses the preinstalled Playwright Chromium.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '../..');
const args = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(args[0], 'utf8'));
const out = path.resolve(args[1]);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const [W, H] = (opt('--size', spec.size || '1080x1350')).split('x').map(Number);
const f = (p) => 'file://' + path.join(ROOT, p);

const CSS = `
@font-face{font-family:Karantina;font-weight:700;src:url(${f('fonts/Karantina-700-latin.woff2')}) format('woff2');}
@font-face{font-family:Karantina;font-weight:700;src:url(${f('fonts/Karantina-700-latin-ext.woff2')}) format('woff2');unicode-range:U+0100-024F,U+1E00-1EFF;}
@font-face{font-family:JBM;font-weight:500;src:url(${f('reel-v2/public/themes/common/JetBrainsMono-500.woff2')});}
@font-face{font-family:Noto;font-weight:400;src:url(${f('fonts/NotoSans-400-latin.woff2')});}
@font-face{font-family:Noto;font-weight:500;src:url(${f('fonts/NotoSans-500-latin.woff2')});}
@font-face{font-family:Noto;font-weight:600;src:url(${f('fonts/NotoSans-600-latin.woff2')});}
@font-face{font-family:Noto;font-weight:700;src:url(${f('fonts/NotoSans-700-latin.woff2')});}
:root{--petrol:#0F5560;--nebel:#EEF4EF;--tinte:#0B2125;--funke:#FF8A3D;--salbei:#9DB8A4;}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{font-family:Noto;font-size:38px;line-height:1.38;position:relative;padding:84px 80px}
body.nebel{background:var(--nebel);color:var(--tinte)} body.petrol{background:var(--petrol);color:var(--nebel)} body.tinte{background:var(--tinte);color:var(--nebel)}
h1,h2,.k{font-family:Karantina;font-weight:700;line-height:.92;letter-spacing:.5px}
h1{font-size:190px} h2{font-size:132px}
.nebel h1 em,.nebel h2 em{font-style:normal;color:var(--petrol)}
.petrol em,.tinte em{font-style:normal;color:var(--salbei)}
.f{color:var(--funke)!important;font-style:normal}
b{font-weight:700}
.muted{opacity:.72}
.num{position:absolute;top:44px;right:56px;font-size:24px;opacity:.55;font-weight:500}
.logo{position:absolute;right:72px;bottom:70px;height:62px}
.bottom{position:absolute;left:80px;right:80px;bottom:84px}
.pill{display:inline-block;font-size:26px;font-weight:600;padding:8px 22px;border-radius:40px;background:var(--nebel);color:var(--tinte)}
.nebel .pill{background:var(--petrol);color:var(--nebel)}
.stamp{display:inline-block;font-size:24px;font-weight:700;letter-spacing:3px;padding:6px 16px;border:3px solid currentColor;border-radius:8px;opacity:.75}
.price{font-family:Karantina;font-weight:700;font-size:200px;line-height:1}
ul.l{list-style:none} ul.l li{padding:14px 0;border-bottom:2px solid rgba(127,160,150,.35);display:flex;gap:22px;align-items:center}
ul.l li b{font-family:Karantina;font-size:92px;line-height:1;min-width:110px}
.spark{position:absolute;width:150px}
.card{border-radius:28px;padding:40px 44px}
.nebel .card{background:#fff;box-shadow:0 12px 40px rgba(11,33,37,.10)} .petrol .card,.tinte .card{background:rgba(238,244,239,.08);border:2px solid rgba(238,244,239,.18)}
${spec.css || ''}`;

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const files = [];
  for (let i = 0; i < spec.slides.length; i++) {
    const s = spec.slides[i];
    const bg = s.bg || 'nebel';
    const logo = s.logo === false ? '' : `<img class="logo" style="${s.logoStyle || ''}" src="${f(bg === 'nebel' ? 'brand/chispa-de-wordmark-color-on-light.png' : 'brand/chispa-de-wordmark-color-on-dark.png')}">`;
    const num = s.n === false || spec.slides.length === 1 ? '' : `<div class="num">${i + 1}/${spec.slides.length}</div>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body class="${bg}">${num}${s.html.replace(/SPARK/g, f('brand/chispa-de-spark-funke.png'))}${logo}</body></html>`;
    const tmp = path.join(out, `.slide-${i}.html`);
    fs.writeFileSync(tmp, html);
    await page.goto('file://' + tmp, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const fn = path.join(out, s.file || `${i + 1}.jpg`);
    await page.screenshot({ path: fn, type: 'jpeg', quality: 92 });
    files.push(fn);
    fs.unlinkSync(tmp);
  }
  await browser.close();
  console.log(files.join('\n'));
})();
