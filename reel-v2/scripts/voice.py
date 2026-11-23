#!/usr/bin/env python3
"""ElevenLabs voice + word timings for a reel.
usage: python3 scripts/voice.py <id> <voice_id> "<text>" [--tempo 1.15] [--stability 0.0]
eleven_v3 audio tags like [excited] are sent to the TTS but removed from words.json (never shown on screen).
writes public/<id>/voice.mp3, words.json, alignment_raw.json (key from $ELEVENLABS_API_KEY, never printed)."""
import base64, json, os, subprocess, sys, urllib.request
rid, vid, text = sys.argv[1:4]
tempo = float(sys.argv[sys.argv.index('--tempo') + 1]) if '--tempo' in sys.argv else 1.15
stab = float(sys.argv[sys.argv.index('--stability') + 1]) if '--stability' in sys.argv else 0.0
out = os.path.join(os.path.dirname(__file__), '..', 'public', rid)
os.makedirs(out, exist_ok=True)
body = {"text": text, "model_id": "eleven_v3", "language_code": "de",
        "voice_settings": {"stability": stab, "similarity_boost": 0.8}}
req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_192",
                             data=json.dumps(body).encode(), method='POST',
                             headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
r = json.load(urllib.request.urlopen(req, timeout=300))
a = r.get('normalized_alignment') if False else r['alignment']
raw = os.path.join(out, 'voice_raw.mp3')
open(raw, 'wb').write(base64.b64decode(r['audio_base64']))
json.dump(a, open(os.path.join(out, 'alignment_raw.json'), 'w'), ensure_ascii=False)
af = f'atempo={tempo},' if tempo != 1.0 else ''
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-af', af + 'aresample=44100', '-b:a', '192k',
                os.path.join(out, 'voice.mp3')], check=True)
os.remove(raw)
S = tempo
words, cur, s, e = [], '', None, None
for c, t0, t1 in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
    if c.isspace():
        if cur: words.append([cur, round(s / S, 3), round(e / S, 3)]); cur = ''
        continue
    if not cur: s = t0
    cur += c; e = t1
if cur: words.append([cur, round(s / S, 3), round(e / S, 3)])
# drop pure-punctuation tokens like "…" (merge into previous word)
import re
words = [w for w in words if not re.fullmatch(r'\[[^\]]*\]', w[0])]
clean = []
for w in words:
    if clean and not any(ch.isalnum() for ch in w[0]): clean[-1][0] += w[0]; clean[-1][2] = w[2]
    else: clean.append(w)
json.dump(clean, open(os.path.join(out, 'words.json'), 'w'), ensure_ascii=False)
print(rid, len(clean), 'words, ends', clean[-1][2])
for i, w in enumerate(clean): print(i, w[0], w[1], end=' | ')
print()
