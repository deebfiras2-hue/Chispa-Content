> **Copy of the reel engine from Newsdaily/reel-v2** (themes + LINEART line-art mode). In this repo the default theme is
> **`chispa`** (`DEFAULT_THEME` in `src/themes.ts`), the studio preview opens `specs/zwei-friseure.json`, and
> `scripts/sync.mjs` pulls SFX + music from this repo's `../assets/sfx` and `../assets/music`. The ZOOMED OUT news demo
> (`specs/bepicolombo.json` + `public/demo`) is not copied — the docs below still mention it. Changes to the engine should
> go to Newsdaily/reel-v2 first and be copied over.
> Setup: `cd reel-v2 && npm ci && npx remotion browser ensure`; render: `node scripts/render.mjs specs/<id>.json OUT.mp4 --cover C.jpg --sheet S.jpg`.

# ZOOMED OUT — Reel engine v2 (Remotion)

Premium, data-driven 9:16 reels for **@zoomed.out.365**. One JSON spec (scenes + voice + word
alignment + assets) → a finished 1080×1920 / 30 fps / H.264 yuv420p / AAC 48 kHz / −14 LUFS MP4
with `+faststart`, ready to upload.

Demo: `posts/2026-11-22/REELS/v2-demo-bepicolombo.mp4` (spec: `specs/bepicolombo.json`).

```
reel-v2/
  specs/<id>.json        one spec per reel (the only thing the daily routine writes)
  public/global/         shared textures: Blue Marble (NASA, PD), Mercury MDIS MD3 mosaic (NASA/JHUAPL, PD),
                         SDO Sun (NASA, PD), Venus, world-atlas countries-110m (Natural Earth, PD), grain.png
  public/<id>/           per-reel assets: voice.mp3, words.json, photos, cut-outs
  public/fonts|sfx|music synced copies of ../fonts, ../assets/sfx, ../assets/music (gitignored)
  src/scenes/*           the scene components (see below)
  src/components/*       Planet (sphere renderer), Captions, Transition, Brackets/Logo, Pin, Starfield, Finish
  scripts/render.mjs     sync → bundle → render → loudness → cover → contact sheet
  tools/cutout.py        rembg foreground cut-out for 2.5D photo parallax
```

## Setup (once per container)

```bash
cd reel-v2
npm ci                       # or: npm install
npx remotion browser ensure  # downloads headless Chrome
pip install rembg onnxruntime   # only for tools/cutout.py (run it with python3.13 in this container)
```

## Render a reel

```bash
node scripts/render.mjs specs/<id>.json ../posts/<date>/REELS/<name>.mp4 \
     --cover ../posts/<date>/REELS/<name>-cover.jpg \
     --sheet ../posts/<date>/REELS/<name>-contact-sheet.jpg --concurrency 4
```

- ~35 s reel: **~3.5–4 min render on 4 vCPU** (≈ 6–7 s of render per second of video) + ~30 s audio passes.
- Loudness: the script measures, applies static gain and a 2-stage (4× oversampled) limiter, then re-measures the
  encoded AAC until −14 ±0.3 LUFS and true peak ≤ −1 dBTP.
- Preview / tweak interactively: `npx remotion studio` (opens the demo spec as default props).
- Single frame check: `npx remotion still src/index.ts Reel out/f.jpg --frame=120 --props=specs/<id>.json --scale=0.5`.

## Daily workflow (for the creator routine)

1. **Voice**: ElevenLabs `POST /v1/text-to-speech/<voice_id>/with-timestamps` using the voice/model/settings in
   `../config/voice.json` (the demo used Liam `TX3LPaxmHKxFdv7VOQHJ`, eleven_multilingual_v2, stability 0.35,
   similarity 0.8, style 0.45, speaker boost). Speed it up with
   `ffmpeg -af atempo=1.1` and divide every alignment time by 1.1. Save `public/<id>/voice.mp3` and
   `public/<id>/words.json` = `[[word, start, end], ...]` (split characters on whitespace; see the snippet below).
2. **Visuals**: legal images only (NASA = public domain; ESA = usually CC BY-SA 3.0 IGO → credit; Wikimedia
   Commons with the license shown; Pixabay video only as background texture). Put them in `public/<id>/`.
   For depth on a photo card: `python3.13 tools/cutout.py public/<id>/photo.jpg public/<id>/photo_fg.png`.
3. **Spec**: copy `specs/bepicolombo.json`, change the scenes, start each scene on a word (`"w12"` = start of word
   12 in words.json, `"w12-0.1"` = 0.1 s before it). Aim for a new scene / visual change every 1–2.5 s.
4. Render (above), look at the contact sheet + cover, fix, re-render.

```python
# alignment -> words.json (S = atempo factor)
words, cur, s = [], '', None
for c, t0, t1 in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
    if c.isspace():
        if cur: words.append([cur, round(s/S, 3), round(e/S, 3)]); cur = ''
        continue
    if not cur: s = t0
    cur += c; e = t1
if cur: words.append([cur, round(s/S, 3), round(e/S, 3)])
```

## Spec format

```jsonc
{
  "id": "bepicolombo",
  "tag": "SPACE", "date": "22 NOV 2026",            // top bar
  "voice": {"src": "demo/voice.mp3", "words": "demo/words.json"},
  "music": {"src": "music/epic-1.mp3", "speechDb": -21, "gapDb": -14, "tailDb": -13, "offset": 0},
  "captions": {
    "red": ["mercury", "2018"],                       // words drawn red (case/punctuation-insensitive)
    "replace": [{"from": 21, "to": 22, "text": "2018."}], // merge word indices into one token
    "maxWords": 3, "y": 1330
  },
  "duration": 34.7,                                  // optional; default last word end + 2.6 s
  "cover": {"frame": 84},                            // frame rendered as the cover JPG
  "sfx": [{"src": "sfx/hit.mp3", "at": 12.3, "volume": 0.4}],  // optional extra cues (absolute seconds)
  "scenes": [ { "type": "...", "start": 0 | "w9-0.1", "transition": "whip", "captions": true, ...props } ]
}
```

Music is ducked automatically from the word timings (−21 dB under speech, −14 dB in gaps, −13 dB after the
voice ends; library tracks are normalised to −16 LUFS). Pick the bed by mood from `../assets/music/music.json`.

### Scene-level keys

| key | meaning |
|---|---|
| `start` | seconds, or `"w<i>[±s]"` (word start). A scene lasts until the next scene starts. |
| `transition` | into this scene: `whip` (default, directional motion blur), `whipUp`, `zoom` (zoom-through), `bracket` (viewfinder mask wipe with red brackets), `flash` (white flash + impact), `cut`. Each auto-plays its SFX. |
| `captions` | `false` hides word captions (hook, quote, end card — anything that already shows the words). |
| `overlay` | a kinetic title (same props as `kinetic`) drawn on top of the scene. |

### Components (`type`)

| type | what | main props |
|---|---|---|
| `zoomOut` | **Signature opener.** Tight on a photo detail → pulls back to the full planet → out to the solar system with a red pin (`mode: "space"`), or photo → collapses into a pin on a rotating Blue Marble globe (`mode: "earth"`, `lon`, `lat`). | `image`, `imageSize`, `disc [cx,cy,r]` (planet disc in the photo, px; photo should be an RGBA PNG with the disc cut out), `focus`, `detailEnd`, `revealStart`, `revealEnd`, `lift`, `target`, `bodies`, `pin {label, sub, at, side}` |
| `kinetic` | Huge Anton words slamming in line by line (camera shake, hit SFX), key words red, red brackets snap around one word + label. | `lines [{text, at, red[], bracket, bracketAt, bracketLabel}]`, `exitAt`, `y`, `size` |
| `photo` | Full-bleed photo card, 2.5D parallax (subject cut-out moves faster than the blurred plate), slow push, light sweep masked to the subject, credit tag, kicker + title. | `src`, `fg`, `focus`, `kicker`, `title`, `red[]`, `credit`, `push`, `dir` |
| `counter` | Giant number counting up + unit, punch, red underline wipe, sub line, optional indicator dots. | `value`, `from`, `decimals`, `unit`, `label`, `sub`, `dots`, `source`, `at`, `countDur`, `bg` |
| `route` | `mode: "space"`: orbits + an animated trajectory spiralling through waypoints, flyby markers + live `n/9` counter. `mode: "earth"`: dark Natural-Earth map, highlighted countries, great-circle route line + pins. | space: `orbits`, `waypoints [{a, r, flyby}]`, `tilt`, `drawStart`, `drawDur`; earth: `route [[lon,lat]]`, `highlight [country names]`, `labels` |
| `globe` | Realistic lit 3D globe (Earth with atmosphere, or Mercury / any equirectangular map) spinning to a location, pin + label, optional orbit ring with a spacecraft cut-out going behind/in front of the planet. | `texture` (`earth`/`mercury`/path), `lon`, `lat`, `fromLon`, `radius`, `pin`, `orbit {rx, ry, tilt, period, sat}`, `kicker`, `title` |
| `timeline` | Horizontal timeline that slides item to item; dots light up red with a pulse (tick SFX). | `items [{date, label, at}]`, `kicker`, `title`, `spacing` |
| `bars` | Comparison bars growing with counting values; highlight bar red; bracketed badge stamp. | `bars [{label, sub, value, unit, decimals, highlight}]`, `max`, `badge {text, at}`, `source` |
| `quote` | Quote / fact / question card: words rise in one by one, red key words, bracket frame, optional planet or photo background. | `text` (`\n` = line break), `red[]`, `kicker`, `attribution`, `size`, `y`, `bg {planet|image}`, `impact` |
| `end` | Branded outro: the viewfinder zooms out from full-screen into the logo, dot pops, wordmark wipe, red FOLLOW pill. | `handle`, `tagline`, `cta` |

Every reel also gets: the brand top bar (logo + tag + date, inside the safe area), word-by-word captions
(Inter Black, active word on a red pill, key words red, safe area: below 250 px and above the bottom 420 px),
film grain + vignette, SFX on every transition / number hit / slam, voice + ducked music.

Adding a component: create `src/scenes/MyScene.tsx` (gets its props + `dur`, `words`, `sceneStart`; local frame 0 =
scene start), optionally export a `cues(props)` returning SFX `[{src, at, volume}]`, register it in
`src/scenes/index.ts`.

## SFX library (`../assets/sfx`)

`whoosh-fast` (whip), `whoosh-deep` (zoom / reveals), `impact-boom`, `hit`, `snap` (bracket lock), `tick`, `pop`,
`riser-short`, `counter-roll`, `news-sting` (outro). Generated with ElevenLabs `/v1/sound-generation`
(except the older `hit`, `whoosh`, `news-sting`).

## Limits / notes

- Everything is drawn with DOM/SVG/Canvas2D (the globe is a per-pixel canvas sphere renderer), so it renders
  headless with no GPU and is fully deterministic. No WebGL is needed.
- Render cost is dominated by the canvas planets; big globes on every scene will slow renders down.
- `rembg` cut-outs are good on product/spacecraft shots, weaker on busy scenes — check the PNG before using it.
- Remotion is free for individuals and companies with ≤ 3 employees (Remotion licence); larger teams need a
  company licence.

## Demo credits (BepiColombo)

Mercury photo + MDIS mosaic: NASA/JHUAPL/CIW (public domain) · Earth: NASA Visible Earth Blue Marble (PD) · Sun: NASA/SDO
(PD) · BepiColombo stack photo: ESA–C. Carreau, CC BY-SA 3.0 IGO · BepiColombo model: NASA (PD) · MESSENGER artwork:
NASA/JHUAPL (PD) · Map data: Natural Earth via world-atlas (PD) · Voice: ElevenLabs · Music: ZOOMED OUT library (ElevenLabs Music).

---

# Themes

`"theme"` in the spec picks colours, fonts, logo and end card for **both** modes (`src/themes.ts`; default
`DEFAULT_THEME` = `zoomedout` here, `behindthebrand` / `chispa` in the copies in those repos).

| theme | look | fonts | accent |
|---|---|---|---|
| `zoomedout` | current ZOOMED OUT look (near-black, red) | Anton titles (caps), Inter text | `#FF2D2D` |
| `behindthebrand` | ink `#111111` stage, cream `#F3EEE4` lines/text (cream `#F3EEE4` / ink `#111111` brand) | Gelasio titles, Barlow Bold text | green `#0E9F6E` |
| `chispa` | Tinte `#0B2125` + Petrol `#0F5560` glow, Nebel `#EEF4EF` lines, Salbei `#9DB8A4` labels | Karantina titles (mixed case, no capital ß), Noto Sans text | Funke `#FF8A3D` (the ONLY accent) |

GRAPHICS scenes are themed by palette + font aliasing (the theme's fonts are registered under the `ZO-Anton` /
`ZO-Inter` names, the top bar shows the theme's brand name). The `la-end` card is themed (Chispa: wordmark from
`public/themes/chispa`, typed sign-off, „Stimme mit KI erstellt“). Theme fonts/logos live in `public/themes/<id>/`
(committed); the monospace is JetBrains Mono (`@fontsource/jetbrains-mono`, OFL) in `public/themes/common/`.

# LINEART mode (Line-Art Story)

Minimal glowing line-art pictograms instead of photos: stick figures (round head, line body, no face) and objects as
thin bright outlines (3.7 px at 1080 wide) with a soft glow, off-white, exactly ONE accent colour on one detail
(awning, phone screen, fresh tiles, a key word). Big glowing title on top, a tiny spaced monospace label below it,
narration typed word by word in sync with the voice (one sentence at a time, lower-left; `"narration": {"pos": "top"}`
for top-left), backgrounds `warm` (dark + soft centre glow) or `grid` (deep navy + fine grid), grain, slow camera drift.
Elements DRAW ON stroke by stroke (stroke-dashoffset, lengths from `@remotion/paths`), the glow fades in after the
strokes. SFX are automatic (soft tick per drawn pictogram, pop on accents / lit, whoosh on camera pushes and `fade`
transitions); music is ducked from the word timings (`speechDb` −20 ≈ the requested −20 dB under speech).

Mode: `"mode": "lineart"` (or automatic when the first scene is an `la-*` scene; `"3d"` and `"kinetic"` behave the same) → no top bar / word captions, typed
narration instead. Scenes can still be mixed with GRAPHICS scenes in one spec. Use `"transition": "fade"` between
line-art scenes.

### STYLE CHOICE RULE

- **LINEART** for psychology, how-it-works, pricing, thought experiments, A-vs-B stories, tips for small businesses —
  anything that is an idea, not a photographed event.
- **GRAPHICS** for news with real photos, real places, maps, spacecraft, people in the news.
- Unsure? If the strongest visual is a real photo → GRAPHICS. If the strongest visual is a comparison → LINEART.

### Scene types

All `la-*` scenes share: `title`, `label` or `labels: [{at, text}]` (label typed in mono; a title/label identical to
the previous scene's stays put), `bg` (`warm`|`grid`), `items` (below), `camera: [{at, dur, x, y, s}]` (point x,y
moves to the centre at zoom s; slow push `drift` 0.035 by default), `narration: false`.

| type | what | extra props |
|---|---|---|
| `la-title` | big centred title (+ label) | `titleY`, `titleSize` |
| `la-split` | A-vs-B on one thin ground line (person – object – person) or two halves with a dashed divider; one side then changes through item `keys` (lit / dim / pose / walk) | `ground` (y or false), `groundFrom/To`, `divider`, `sides: ["A","B"]`, `sidesY` |
| `la-transform` | pictogram `from` undraws while `to` draws in its place with a pop | `from`, `to` (items), `morphAt` |
| `la-counter` | big monospace number counting up + mono caption (+ `source` line) | `value`, `from`, `group` (thousands separator), `source`, `at`, `countDur`, `prefix`, `suffix`, `decimals`, `caption`, `y` |
| `la-flow` | icons connected by drawing arrows, one after another | `nodes: [{kind, label, params, accent}]`, `at`, `step`, `dir` (`h`/`v`), `y` |
| `la-reveal` | statement revealed word by word in sync with the voice, accent word + drawn underline | `lines: [{text, fromWord, accent: [..], size, font: title|text, y}]` |
| `la-end` | theme end card: logo/wordmark, line, sign-off typed in sync, outro word, small note | `signoff`, `fromWord`, `outro`, `outroWord`, `note` |

### Items (`items: [...]`, screen px on the 1080×1920 canvas, times = seconds from scene start or `"w12"` word refs)

| type | props |
|---|---|
| `picto` (default) | `kind`, `x`, `y` (origin = feet / ground for grounded things, centre for icons), `s`, `flip`, `params` (`pose`, `hair`, `dress`, `vest`, `tie`, `hold`, `screen`, `text`, `n`, `pole`, `open`), `accent` (accent detail on from the start), `at`, `dd` (draw time), `out`, `outDur`, `clip: [x1,y1,x2,y2]`, `keys: [{at, dur, x, y, s, o, dim, lit, pose, walk, flip}]`, `sfx` |
| `text` | `text`, `font` (`title`/`text`/`mono`), `size`, `color` (`line`/`accent`/`muted`/`text`/#hex), `anim` (`type`/`fade`/`words` + `fromWord`), `box` (stamp), `align`, `width`, `spacing` |
| `line` / `arrow` | `from: [x,y]`, `to: [x,y]` or x, `bend`, `dashed`, `accent` |
| `grid` | abstract profile grid (avatar, bio lines, 3×3 tiles; no logo): `w`, `content` (`full`/`empty`), `stale: {at}` (greys out), `fresh: {at, step}` (tiles fill in the accent) |
| `counter` | `value`, `start`, `dur`, `prefix`, `suffix`, `decimals`, `size` |

Keys: `walk: true` animates a walk cycle while moving to the key's `x`; `lit: 1` = accent detail lights up + glow
brightens + soft accent halo; `dim: 0.75` = greyed out.

**Pictograms** (`src/lineart/picto.ts`, all parametric and drawable): `person` (poses `stand`, `walk`, `point`,
`phone`, `wave`, `hold`, `think`, `sit`), `woman`, `barber`, `crowd`, `shop`/`storefront`, `barbershop`,
`barberChair`, `scissors`, `comb`, `cafeTable`, `cup`, `croissant`, `bread`, `oven`, `wrench`, `toolbox`, `van`,
`counter`, `door`, `phone` (`screen`: `blank`/`grid`/`post`/`lit`), `feed` (profile grid), `calendar`, `clock`,
`coin`, `coinStack`, `banknote`, `priceTag`, `receipt`, `contract`, `chart`, `arrow`, `lightbulb`, `speechBubble`,
`question`, `check`, `cross`, `house`, `office`, `car`, `globe`, `planet`, `rocket`, `sign`. Add one = a function
returning `[{d, a?, fill?, w?}]` (a person is ~100 units tall).

Quick QA without a full render: `node scripts/stills.mjs specs/<id>.json sheet.jpg 30,120,240,400 --scale 0.5`.

### Worked example — LINEART (`specs/zwei-friseure.json`, Chispa, German)

```jsonc
{
  "id": "zwei-friseure", "theme": "chispa", "mode": "lineart",
  "voice": {"src": "zwei-friseure/voice.mp3", "words": "zwei-friseure/words.json"},
  "music": {"src": "music/curious-1.mp3", "speechDb": -20, "gapDb": -15, "tailDb": -12},
  "narration": {"pos": "bottom", "y": 1470, "size": 58},
  "scenes": [
    {"type": "la-split", "start": 0, "title": "Zwei Friseure.", "label": "G L E I C H E   S T R A S S E", "ground": 1150,
     "camera": [{"at": "w15", "dur": 0.8, "x": 569, "y": 1000, "s": 5.5}],
     "items": [
       {"kind": "barbershop", "x": 290, "y": 1150, "s": 2.1, "at": 0.3, "params": {"text": "FRISEUR"}},
       {"kind": "barbershop", "x": 790, "y": 1150, "s": 2.1, "at": "w2", "params": {"text": "FRISEUR"}},
       {"kind": "woman", "x": 460, "y": 1150, "s": 1.9, "at": "w6",
        "keys": [{"at": "w7", "dur": 1.3, "x": 540, "walk": true}, {"at": "w11", "pose": "phone"}, {"at": "w15", "lit": 1}]}]},
    {"type": "la-split", "start": "w16", "transition": "fade", "title": "Zwei Friseure.", "label": "I N S T A G R A M",
     "ground": false, "sides": ["N R .  1", "N R .  2"],
     "items": [
       {"kind": "phone", "x": 290, "y": 860, "s": 5},
       {"type": "grid", "x": 290, "y": 872, "w": 165, "content": "full", "stale": {"at": "w18"}},
       {"type": "text", "text": "MÄRZ", "font": "mono", "box": true, "x": 290, "y": 846, "at": "w21"},
       {"kind": "phone", "x": 790, "y": 860, "s": 5, "at": "w22"},
       {"type": "grid", "x": 790, "y": 872, "w": 165, "content": "empty", "fresh": {"at": "w24", "step": 0.13}}]},
    {"type": "la-reveal", "start": "w39", "transition": "fade",
     "lines": [{"text": "Dein Profil ist", "fromWord": 39}, {"text": "dein Schaufenster.", "fromWord": 42, "accent": ["Schaufenster"]}]},
    {"type": "la-end", "start": "w49", "transition": "fade", "signoff": "Content, der den Daumen stoppt.", "fromWord": 49,
     "outro": "Chispa!", "outroWord": 54}
  ]
}
```

### Worked example — GRAPHICS (`specs/bepicolombo.json`, ZOOMED OUT)

```jsonc
{
  "id": "bepicolombo", "theme": "zoomedout", "tag": "SPACE", "date": "22 NOV 2026",
  "voice": {"src": "demo/voice.mp3", "words": "demo/words.json"},
  "music": {"src": "music/epic-1.mp3", "speechDb": -21, "gapDb": -14, "tailDb": -13},
  "captions": {"red": ["mercury", "2018"]},
  "scenes": [
    {"type": "zoomOut", "start": 0, "mode": "space", "image": "demo/mercury_messenger.png", "pin": {"label": "MERCURY"}},
    {"type": "photo", "start": "w9-0.1", "src": "demo/bepi_stack.jpg", "fg": "demo/bepi_stack_fg.png", "credit": "ESA–C. Carreau, CC BY-SA 3.0 IGO"},
    {"type": "counter", "start": "w33-0.1", "value": 9, "unit": "FLYBYS"},
    {"type": "end", "start": "w78-0.15", "transition": "bracket"}
  ]
}
```
(abridged — see the full file for every prop).

---

# 3D mode (`3d-*` scenes, `src/three/`)

Premium, slow 3D with `@remotion/three` + `@react-three/fiber` (three 0.170): soft studio lighting (warm key, Petrol
rim, hemisphere fill), Tinte fog for depth, Nebel surfaces, Funke as the single accent, slow camera moves plus a gentle
automatic drift. Screens, tiles, tags and signs are Canvas-2D textures drawn in the theme fonts (`src/three/draw.ts`).
3D scenes share the LINEART stage, so `title`, `label`/`labels`, `items` overlays (e.g. a „BEISPIEL“ stamp) and the typed
narration work as usual. Use `"mode": "3d"` (or start with a `3d-*` scene); mix freely with `la-*` and `kin-*` scenes.

**Headless WebGL:** renders with `--gl=swangle` (set in `remotion.config.ts`; `scripts/stills.mjs` passes it too). No GPU
needed. Cost: about **0.7 s per frame on 4 vCPU** (≈ 12–14 min for a 34 s reel), roughly 2× a LINEART reel. Keep geometry
light (boxes, capsules, planes); there is no post-processing (depth of field is faked with fog). Test stills first.
The WebGL canvas mounts only once the theme fonts are loaded (`useFontsReady`), otherwise canvas text would fall back
to a serif font on the first frame of each render tab.

Shared keys: `cam: [{at, dur, ease, az, el, dist, tx, ty, tz, fov}]` (orbit camera: azimuth/elevation in degrees,
distance, look-at target; each key eases from the previous state, `dur: 0` sets the start), `fog: [near, far]`,
`light` (Funke point light 0–1).

| type | what | extra props |
|---|---|---|
| `3d-phone` | stylised smartphone (rounded body, camera bump, buttons) floating and turning; the screen is a live texture | `phone: [{at, dur, x, y, z, rx, ry, rz, s}]`, `screen` or `screens: [{at, kind, …}]`, `float`, `shadow` |
| `3d-store` | low-poly street: hero storefront (Funke-striped awning, lit window, sign), neighbours, people walking past on their phones | `sign`, `neighbors: [..]` (up to 4 signs, `false` = none), `walkers: [{at, from, to, dur, z, phone}]`, `litAt` |
| `3d-tiles` | 3×3 feed tiles floating out of line in depth, grey irregular „before“ tiles flip one by one to a calm Chispa feed and settle into a tidy grid | `flipAt`, `step`, `order` (`row`/`random`), `motifs`, `accentTile`, `cols`, `rows`, `gap` |
| `3d-tags` | price tags (extruded, with hole) or receipts drop, bounce and stack | `tags: [{text, sub, at, accent, kind: tag/receipt, lines, total, x}]` |
| `3d-text` | headline lines on planes swinging up out of depth (Karantina), optional Funke underline | `lines: [{text, at / fromWord, size, y, accent, font}]` |

Screen kinds (`screen.kind`): `store` (a shop window drawn on the phone, `sign`), `profile` (avatar, info pill, grid;
`checks: [{key: photo/hours/week, at}]` light up one by one, only the latest carries the Funke accent; `info:
"Di–Sa 9–18 Uhr|Hauptstr. 12"`), `feed` (`tiles: fresh/grey/empty`, `freshAt`, `step`, `staleAt`, `stamp: {text, at}`,
`motifs`), `chat` (`name`, `messages: [{from: me/them, text, at}]`, typing dots before replies), `post` (`motif`,
`caption`), `blank`. Motifs: `cup croissant cake store hours pin team wrench car bean week text:Zeile1|Zeile2`.

### Worked example — 3D (`specs/3d-schaufenster.json`, abridged)

```jsonc
{
  "id": "3d-schaufenster", "theme": "chispa", "mode": "3d",
  "voice": {"src": "3d-schaufenster/voice.mp3", "words": "3d-schaufenster/words.json"},
  "scenes": [
    {"type": "3d-phone", "start": 0, "narration": false, "title": "Dein Schaufenster ist heute sechs Zoll groß.",
     "screen": {"kind": "store", "sign": "DEIN LADEN"},
     "phone": [{"at": 0, "dur": 0, "ry": -1.1}, {"at": 0, "dur": 1.8, "ry": -0.28, "ease": "out"}],
     "cam": [{"at": 0, "dur": 0, "dist": 15.5}, {"at": "w6", "dur": 0.75, "dist": 3.0}]},   // dive into the screen …
    {"type": "3d-store", "start": "w7", "transition": "zoom", "title": "Sie laufen vorbei.",  // … and land in the street
     "neighbors": ["BÄCKEREI", "SALON"], "walkers": [{"at": 0, "from": -8, "to": 8, "dur": 9}],
     "cam": [{"at": 0, "dur": 3, "dist": 16, "az": 20, "ease": "out"}]},
    {"type": "3d-phone", "start": "w28", "title": "Drei Dinge.",
     "screen": {"kind": "profile", "checks": [{"key": "photo", "at": "w35"}, {"key": "hours", "at": "w39"}, {"key": "week", "at": "w45"}]},
     "cam": [{"at": "w33", "dur": 1, "dist": 8.5, "tx": -0.35, "ty": 1.05}]},
    {"type": "3d-tiles", "start": "w9", "title": "Café Morgenrot.", "flipAt": "w22", "step": 0.16, "order": "random", "accentTile": 4}
  ]
}
```

# KINETIC mode (`kin-words`, `src/kinetic/Kinetic.tsx`)

Swiss / kinetic typography like reels 02 and 15: huge Karantina words on a flat Nebel, Petrol or Tinte field, a thin
Swiss grid (two verticals, two rules), tiny mono meta text (`meta` top left, beat counter `01 / 03` top right) and
**exactly one Funke stroke per beat**. Lines auto-fit the 936 px grid width (measured in the DOM with the real font).
Typed narration is hidden during `kin-*` scenes (the words are the picture).

| prop | meaning |
|---|---|
| `bg` | `nebel` (Tinte text) / `petrol` / `tinte` (Nebel text); a beat can switch `bg` (wipes up) |
| `beats: [{fromWord / at, lines, anim, stroke, align, y, bg}]` | each beat holds until the next one, then masks out upwards |
| `lines: [{text, size, accent: [word], fromWord / at, font: title/text/mono, color: muted}]` | accent words turn Funke |
| `anim` | `snap` (scale 1.35 → 1 with blur, hit SFX), `mask` (rises out of a mask), `slide` (alternating from left/right with skew), `stack` (drops from above) |
| `stroke` | `under` (bar under the accent word), `circle` (hand-drawn ellipse round it), `strike` (crossed out), `bar` (vertical bar left of the block), `none` |

### Worked example — KINETIC (send prompt from `specs/3d-schaufenster.json`)

```jsonc
{"type": "kin-words", "start": "w49", "transition": "fade", "bg": "nebel", "meta": "WEITERSAGEN",
 "beats": [
   {"fromWord": 49, "anim": "snap", "stroke": "bar",
    "lines": [{"text": "Schick das", "size": 250}, {"text": "einem Inhaber,", "size": 250, "fromWord": 51}]},
   {"fromWord": 53, "anim": "mask", "stroke": "circle",
    "lines": [{"text": "der zuletzt", "size": 230}, {"text": "im März", "size": 300, "accent": ["März"], "fromWord": 55},
              {"text": "gepostet hat.", "size": 230, "fromWord": 57}]}
 ]}
```

# CHARACTER mode (planned)

Talking objects (a shop, a phone, a till) with mouth shapes driven by the word timings, like reel 17. Not built yet;
planned for week 2 as a `3d-character` scene on top of the 3D stage.

## Voice helper and Chispa voice style (since 2026-11-23)

`python3 scripts/voice.py <id> <voice_id> "<text>" [--stability 0.0] [--tempo 1.15]` calls ElevenLabs `/with-timestamps`
(eleven_v3, `language_code: de`, similarity 0.8; key from `$ELEVENLABS_API_KEY`, never printed) and writes
`public/<id>/voice.mp3`, `words.json` and `alignment_raw.json`.

Chispa style for every reel (also in `../rules/CHISPA-RULES.md`, Voice):
- Anna `DEZHhPbmb8LVZmWufkCh` (Liam `TX3LPaxmHKxFdv7VOQHJ` for Handwerk/Werkstatt).
- `--stability 0.0` („Creative“) for hook-heavy and offer reels, `0.3` for calmer value reels.
- Audio tags in the TTS text only: `[excited]` before the hook, `[enthusiastic]` before the key tip/offer, `[warmly]`
  before the sign-off. The script removes `[...]` tokens from `words.json`, so word indices (`"w12"`) match the plain script.
- Tempo 1.15× by default (atempo + every timing divided by 1.15); the render masters to −14 LUFS.
- Energetic, smiling, clear, never shouty. Aim for ~160–185 wpm after the speed-up.
