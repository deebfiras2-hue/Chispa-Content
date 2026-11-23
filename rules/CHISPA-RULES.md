# Chispa Studio DE: content rules (read first)

## Brand
- Name: Chispa Studio („tschis-pa“, spanisch für Funke). Tagline „Content mit Funken.“ Offer line „Einmal zahlen. Kein Abo.“
- Palette (Germany): Petrol #0F5560, Nebel #EEF4EF, Tinte #0B2125, Funke #FF8A3D (spark, ONE orange element per frame besides the logo), Salbei #9DB8A4. Never magenta, signal yellow or pure red.
- Fonts: Karantina 700 (headlines, mixed case, it has no capital ẞ), Noto Sans (text). Files in fonts/.
- Logo files in brand/ (wordmark, wordmark + tagline, icon, spark). Never redraw the logo.
- Every reel ends on the spoken and shown sign-off: „Content, der den Daumen stoppt. Chispa!“
- du on social media, Sie only in offers and invoices.

## Packages (exact)
NEW PRICES since 2026-11-22: Prueba 149 € (5 Posts, 5 Stories, 1 Reel; „zum Ausprobieren“, einmal pro Kunde) · Chispita 349 € (10 Posts, 10 Stories, 1 Reel) · Chispa 699 € (20, 20, 3) „Unsere Empfehlung“ · Chispazo 1.399 € (50, 50, 5). Always „einmal“; „Ab 149 €“. Never use the old prices 399/799/1.599 €. Every post with a finished caption, every reel with a voiceover. Delivery „in wenigen Werktagen“ (never a number). „Alles über WhatsApp.“ How it works: 1. Paket wählen 2. ein paar Fragen beantworten 3. alles fertig bekommen. Languages: Deutsch, Englisch, Arabisch.

## Reel rules
1. Mix 70 / 20 / 10: 70% VALUE (tip, how-to, mistake to avoid; ends on the sign-off only, NO package ask), 20% PROOF (the real process, real work; demo work for fictional businesses is labelled „Beispiel“), 10% OFFER (packages, price, ask: „Schreib uns auf WhatsApp“).
2. No face. Trust comes from specifics, the visible process, honest answers to objections, a calm competent voice.
3. Speak to ALL small businesses (Laden, Salon, Café, Bäckerei, Handwerk, Werkstatt, Kosmetik, Imbiss, Studio). Rotate industries. Never Ärzte, Physio, Steuerberater, Anwälte.
4. Local content is allowed.
5. Ad/offer copy is persuasive and firm: name the problem, the cost of doing nothing, take apart the excuse (keine Zeit, zu teuer, Abo, „bringt eh nix“), clear close. Firm, friendly, never begging or sad.
6. NEVER promise results: no „mehr Kunden“, „mehr Reichweite“, „mehr Follower“, „garantiert“, „viral“. Say what is delivered. No fake clients, testimonials, numbers or reviews. No „kostenlos“, no false urgency, never „Agentur“ about us (we are a Studio), no agency English (Leads, Funnel, Conversion).
7. AI is labelled: reels with an AI voice say so in the caption („Stimme mit KI erstellt“) and carry the label; realistic AI images get „Mit KI erstellt“. Stylised graphics/line-art drawn in code need no label.
8. Music: only licensed or our own generated library; never Instagram's library on a business reel.
9. Only claims from rules/claims.md; market facts only as written there (with source).

## Voice
German voice: ElevenLabs „Anna – Excited & Journalistic“ voice_id DEZHhPbmb8LVZmWufkCh (female, native German), model eleven_v3, language_code de, endpoint `/with-timestamps`. Male (Handwerk/Werkstatt): Liam TX3LPaxmHKxFdv7VOQHJ.

**Style since 2026-11-23 (owner: „a little more excited“), for ALL reels:**
- stability **0.0 („Creative“)** for hook-heavy and offer reels, **0.3** for calmer value reels; similarity_boost 0.8.
- eleven_v3 audio tags, sparingly and only in the TTS text (never in captions or on screen): `[excited]` before the hook, `[enthusiastic]` before the key tip or the offer, `[warmly]` before the sign-off. Short punchy sentences, an exclamation mark where it is natural.
- Speed the voice up **1.15×** (`ffmpeg atempo=1.15`) and divide every word timing by 1.15 before rendering; master to about −14 LUFS (render pipeline).
- Energetic, smiling and clear, never shouty; still credible for business owners. Target ~160–185 words per minute after the speed-up.
- Helper: `python3 reel-v2/scripts/voice.py <id> <voice_id> "<text with tags>" --stability 0.0` (tempo 1.15 is the default; tags are dropped from words.json).

## Already published
All 20 launch posts are online (see examples/contact-sheet-posts.jpg) and reels 01-21 exist (rules/existing-reels-series-01.md). Do not repeat their topics one-to-one.
