# Reel series 01 · Chispa DE launch

Ten reels for @chispastudio.de, built 2026-11-07. Each one says plainly what Chispa does and gives the viewer a reason to write. Together with reel 02, the campaign opener, they make the first month of reels. **Every German line waits for the partner's native check.**

- **Voice:** Anna, a native German ElevenLabs library voice (`DEZHhPbmb8LVZmWufkCh`, Creator plan since 2026-11-07), `eleven_v3`, the expressive setting with lively emotion tags, sped up 1.25× (about 2.7 words a second, the pace of the earlier Chispa reel). Every voice is mastered by `remotion/tools/master-voice.mjs` (EQ, de-esser, compressor, about -15 LUFS). Reels 01 to 11, including 02, re-time themselves to the voice through word cues; `make-voices.ps1 -Voice DEZHhPbmb8LVZmWufkCh -Force` then `remotion/render-series.ps1` rebuilds everything.
- **Look:** one system, so Kurz und ehrlich, als Sprachnachricht ✦

Du hast ein Geschäft, das läuft, und ein Profil, das seit Wochen still ist. Nach Feierabend hat da keiner mehr Lust drauf.

Du beantwortest uns ein paar Fragen auf WhatsApp, gern auch als Sprachnachricht. Wir machen dir Posts, Stories und Reels, fertig mit Caption und von uns geprüft.

Einmal zahlen, kein Abo. Ab 399 €.

Schreib uns „Paket“ auf WhatsApp, der Link ist in der Bio.

Stimme mit KI erstellt.
.Kurz und ehrlich, als Sprachnachricht ✦

Du hast ein Geschäft, das läuft, und ein Profil, das seit Wochen still ist. Nach Feierabend hat da keiner mehr Lust drauf.

Du beantwortest uns ein paar Fragen auf WhatsApp, gern auch als Sprachnachricht. Wir machen dir Posts, Stories und Reels, fertig mit Caption und von uns geprüft.

Einmal zahlen, kein Abo. Ab 399 €.

Schreib uns „Paket“ auf WhatsApp, der Link ist in der Bio.

Stimme mit KI erstellt.
.
.
#kleinunternehmen #selbstständig #socialmedia #instagrammarketing #contentcreation #unternehmer
.
#kleinunternehmen #selbstständig #socialmedia #instagrammarketing #contentcreation #unternehmerthe grid reads as one designed page. Swiss grid, Petrol palette, Karantina and Noto Sans, the scene index top left, „Mit KI erstellt“ top right on every frame (the voice is AI). Each reel has its own signature motion.
- **Rules kept:** the hook is on screen at frame 0, before the voice. No dashes or colons on screen. Prices and contents only as in `claims.md`. No promised results. „in wenigen Werktagen“ and never a number of days. No agency named. One ask per reel. Every reel ends on „Content, der den Daumen stoppt. Chispa!“
- **Files:** script source `series-01.json`. Voices `reel-XX/voice.mp3` (+ alignment). Animation `remotion/src/reels/ReelXX.jsx`, shared parts in `remotion/src/kit.jsx`. Videos `reel-XX/chispa-de-reel-XX.mp4`.

## Posting order (three reels a week, as `Playbook/strategy.md` plans)

| Week | Reel | Why here |
|---|---|---|
| 1 | 10 Sprich Tschis-pa | Say the name once, first (texts.md) |
| 1 | 02 Campaign opener | The whole offer; also the paid ad |
| 1 | 08 Paket auspacken | Show the product right after the promise |
| 2 | 01 Rechne mal mit | The viewer's own sum |
| 2 | 04 Buzzword-Bingo | Humour; asks for comments |
| 2 | 11 Fünf Posts | Advice worth saving (after its voice is recorded) |
| 3 | 05 Preis auf Anfrage | All three prices |
| 3 | 09 Steht drauf | Trust, against AI scepticism |
| 3 | 03 Die Rechnung | Contract pain, as an object |
| 4 | 06 Das Kleingedruckte | Works on mute |
| 4 | 07 Ab Montag | Post it on a Monday |

Pin 02, 08 and 05 to the profile grid.

---

## Reel 01 · Rechne mal mit
**Hook** DE03 · **Framework** AIDA · **Angle** A23 · **Headline** L01 · **Ask** C02 · 20 s
**Motion:** calculator keys, an LCD sum („1 Stunde pro Post × 20 Posts“), twenty moons popping one by one (20 Feierabende), the package fanning out, the price counting up.
**Voice:** Rechne mal kurz mit! Sagen wir, eine Stunde pro Post. Mal zwanzig Posts! Das sind zwanzig Feierabende! Oder ein Paket. Zwanzig Posts, zwanzig Stories, drei Reels! Siebenhundertneunundneunzig Euro, einmal. Kein Abo! Schreib uns „Paket“ auf WhatsApp! Content, der den Daumen stoppt. Chispa!
**Caption:**
```
Rechne mal kurz mit ✦

Sagen wir, eine Stunde pro Post. Mal 20 Posts. Das sind 20 Feierabende.

Oder ein Paket. 20 Posts mit fertiger Caption, 20 Stories, 3 Reels mit Sprecherstimme. 799 € einmal, kein Abo.

Schreib uns „Paket“ auf WhatsApp, der Link ist in der Bio.

Stimme mit KI erstellt.
.
.
#kleinunternehmen #selbstständig #socialmedia #instagrammarketing #contentcreation #unternehmer
```

## Reel 03 · Die Rechnung
**Hook** DE01 as format FD01 · **Framework** PAS · **Angle** A06 · **Headline** L25 · **Ask** C02 · 25 s
**Motion:** a receipt printer prints „Viele Agentur-Abos“ (Mindestlaufzeit bis 12 Monate, Verlängerung automatisch, Reels oft extra) and keeps printing off the top of the screen. Cut: Chispa's receipt drops in, short, with a torn edge, and the total counts up to 799 €.
**Watch:** every line on the long receipt is a term the research found common. No prices on it, no agency named.
**Voice:** Das hier ist die Rechnung von vielen Agentur-Abos! Mindestlaufzeit, bis zu zwölf Monate! Manchmal verlängert sich das von allein! Und Reels kosten oft extra! Unser Bon ist kürzer! Zwanzig Posts, zwanzig Stories, drei Reels. Siebenhundertneunundneunzig Euro, einmal! Schreib uns „Paket“ auf WhatsApp! Content, der den Daumen stoppt. Chispa!
**Caption:**
```
Unser Bon ist kürzer ✦

Viele Agentur-Abos laufen bis zu 12 Monate, manche verlängern sich von allein, und Reels kosten oft extra.

Bei uns steht alles auf einem kurzen Bon. 20 Posts, 20 Stories, 3 Reels. 799 € einmal.

Schreib uns „Paket“ auf WhatsApp, der Link ist in der Bio.

Stimme mit KI erstellt.
.
.
#kleinunternehmen #selbstständig #socialmediaagentur #instagrammarketing #onlinemarketing #unternehmer
```

## Reel 04 · Buzzword-Bingo
**Hook** DE07, format FD03 · **Framework** AIDA · **Headline** L08 · **Ask** a comment (post 12's question) · 23 s
**Motion:** a 3 × 3 bingo card (the nine words of post 12). Each buzzword the voice says gets crossed out, a diagonal line draws, BINGO stamps down with sparks. The card flips to „Oder einfach Content.“ and three posts land on it. Then a comment typing itself, with a heart.
**Voice:** Agentur-Bingo! Synergien! Strategie-Call! Deep Dive! Customer Journey! Bingo! Oder einfach Content! Ein paar Fragen auf WhatsApp, und du bekommst Posts, Stories und Reels, fertig zum Hochladen! Einmal zahlen, kein Abo! Welches Wort hast du am häufigsten gehört? Schreib es in die Kommentare! Content, der den Daumen stoppt. Chispa!
**Caption:**
```
Bingo ✦

Synergien, Strategie-Call, Deep Dive. Wenn du schon mal mit einer Agentur gesprochen hast, kennst du ein paar davon.

Bei uns sind es ein paar Fragen auf WhatsApp, und du bekommst Posts, Stories und Reels, fertig zum Hochladen. Einmal bezahlt.

Welches Wort hast du am häufigsten gehört? Schreib es in die Kommentare.

Stimme mit KI erstellt.
.
.
#marketinghumor #kleinunternehmen #selbstständig #socialmedia #onlinemarketing #unternehmer
```

## Reel 05 · Preis auf Anfrage
**Hook** DE02 · **Angle** A20 · **Headline** L38 · **Ask** C02 · 32 s
**Motion:** a „Preis auf Anfrage.“ card crumples and flies off. Three price tags drop on strings and swing, each price counting up: Chispita, Chispa („unsere Empfehlung“), Chispazo.
**Voice:** „Preis auf Anfrage.“ Drei Wörter, bei denen jeder weiterscrollt! Bei uns steht der Preis dran! Chispita, dreihundertneunundneunzig Euro. Zehn Posts, zehn Stories, ein Reel! Chispa, siebenhundertneunundneunzig Euro. Zwanzig Posts, zwanzig Stories, drei Reels! Chispazo, tausendfünfhundertneunundneunzig Euro. Fünfzig Posts, fünfzig Stories, fünf Reels! Jeweils einmal. Kein Abo! Schreib uns „Paket“ auf WhatsApp! Content, der den Daumen stoppt. Chispa!
**Caption:**
```
Bei uns steht der Preis dran ✦

Chispita, 399 €. 10 Posts, 10 Stories, 1 Reel.
Chispa, 799 €. 20 Posts, 20 Stories, 3 Reels. Unsere Empfehlung.
Chispazo, 1.599 €. 50 Posts, 50 Stories, 5 Reels.

Jeweils einmal bezahlt, kein Abo. Jeder Post mit fertiger Caption, jedes Reel mit Sprecherstimme.

Schreib uns „Paket“ auf WhatsApp, der Link ist in der Bio.

Stimme mit KI erstellt.
.
.
#kleinunternehmen #selbstständig #socialmedia #instagrammarketing #contentcreation #unternehmer
```

## Reel 06 · Das Kleingedruckte
**Format** FD02 · **Framework** PAS · **Headline** L23 · **Ask** C02 · 21 s
**Motion:** a contract scrolls under a magnifier, a marker sweeps over § 4 Mindestlaufzeit, § 7 Kündigungsfrist, § 9 Automatische Verlängerung, then it runs on and on. Cut: the whole offer fills one line, „Einmal zahlen. Kein Abo.“, marked „Zeile 1 … Ende.“
**Voice:** Lies mal das Kleingedruckte! Mindestlaufzeit. Kündigungsfrist. Automatische Verlängerung! Bei uns passt alles in eine Zeile! Einmal zahlen. Kein Abo! Dafür Posts, Stories und Reels mit Sprecherstimme, in wenigen Werktagen! Schreib uns „Paket“ auf WhatsApp! Content, der den Daumen stoppt. Chispa!
**Caption:**
```
Bei uns passt alles in eine Zeile ✦

Einmal zahlen. Kein Abo.

Dafür bekommst du Posts, Stories und Reels mit Sprecherstimme, in wenigen Werktagen. Kein Vertrag, den du später lesen musst.

Schreib uns „Paket“ auf WhatsApp, der Link ist in der Bio.

Stimme mit KI erstellt.
.
.
#kleinunternehmen #selbstständig #socialmedia #instagrammarketing #onlinemarketing #unternehmer
```

## Reel 07 · Ab Montag
**Hook** DE12 · **Framework** PAS · **Headline** L19 · **Ask** C02 · 23 s
**Motion:** a desk calendar shows MO 3; on „Jeden Montag“ its sheets flip through Monday after Monday. Then a seven-week posting plan (Mo, Mi, Fr) fills with 20 posts while the counter runs, one slot left empty.
**Voice:** „Ab Montag poste ich regelmäßig!“ Jeden Montag! Dein Feed muss nicht auf Montag warten! Im Chispa-Paket stecken zwanzig Posts, jeder mit fertiger Caption! Drei pro Woche, und dein Feed ist fast sieben Wochen versorgt! Siebenhundertneunundneunzig Euro, einmal. Kein Abo! Schreib uns „Paket“ auf WhatsApp! Content, der den Daumen stoppt. Chispa!
**Caption:**
```
„Ab Montag poste ich regelmäßig.“ Jeden Montag ✦

Im Chispa-Paket stecken 20 Posts, jeder mit fertiger Caption. Drei pro Woche, montags, mittwochs und freitags, und dein Feed ist fast sieben Wochen versorgt.

799 € einmal, kein Abo. Schreib uns „Paket“ auf WhatsApp, der Link ist in der Bio.

Stimme mit KI erstellt.
.
.
#kleinunternehmen #selbstständig #contentplanung #instagrammarketing #socialmedia #unternehmer
```

## Reel 08 · Paket auspacken
**Format** FD05 · **Framework** QUEST · **Headline** L01 · **Ask** C02 · 22 s
**Motion:** a Chispa parcel wobbles, its lid flies open and 20 posts fly out into a grid. Five captions type themselves, seven stories fan out with live polls, three reels play with moving sound bars. The parcel returns with „Chispa, 799 € einmal“ on its label, and sparks burst.
**Voice:** Wir packen mal ein Paket aus! Zwanzig Posts, jeder im Look deines Geschäfts! Zwanzig fertige Captions! Zwanzig Stories, auch mit Umfragen für deine Kunden! Und drei Reels mit deutscher Sprecherstimme! Das ist Chispa. Siebenhundertneunundneunzig Euro, einmal! Schreib uns „Paket“ auf WhatsApp! Content, der den Daumen stoppt. Chispa!
**Caption:**
```
Wir packen mal ein Paket aus ✦

20 Posts im Look deines Geschäfts
20 fertige Captions
20 Stories, auch mit Umfragen für deine Kunden
3 Reels mit deutscher Sprecherstimme

Das ist Chispa. 799 € einmal, kein Abo.

Schreib uns „Paket“ auf WhatsApp, der Link ist in der Bio.

Stimme mit KI erstellt.
.
.
#kleinunternehmen #selbstständig #socialmedia #contentcreation #instagrammarketing #unternehmer
```

## Reel 09 · Steht drauf
**Hook** DE13 · **Framework** PAS · **Angle** A26 · **Headline** L29 · **Ask** C06 · 22 s
**Motion:** the „Mit KI erstellt“ label as the hero, pulsing. A speech bubble („wir sagen es“). The label slides onto a drawn image, IMMER stamps down. A magnifier passes over three posts while „Jedes Wort“ and „Jedes Bild“ get their checkmarks.
**Watch:** a trust reel; it never sells AI. The EU line from post 16 is left out until the lawyer has read it.
**Voice:** Mit KI erstellt. Steht bei uns drauf! Wir arbeiten mit KI, und wir sagen es! Realistische KI-Bilder bekommen bei uns eine Kennzeichnung. Immer! Und bevor du etwas bekommst, prüfen wir es. Jedes Wort, jedes Bild! Posts, Stories und Reels, ehrlich gemacht! Fragen dazu? Schreib uns auf WhatsApp! Content, der den Daumen stoppt. Chispa!
**Caption:**
```
Mit KI erstellt. Steht bei uns drauf ✦

Wir arbeiten mit KI, und wir sagen es. Realistische KI-Bilder in deinen Posts bekommen eine Kennzeichnung.

Was die KI schreibt und gestaltet, prüfen wir, bevor du es bekommst. Jedes Wort, jedes Bild.

Fragen dazu? Schreib uns auf WhatsApp, der Link ist in der Bio.

Stimme mit KI erstellt.
.
.
#kuenstlicheintelligenz #transparenz #kleinunternehmen #socialmedia #onlinemarketing #unternehmer
```

## Reel 10 · Sprich Tschis-pa
**Hook** DE14 (the name story) · **Headline** L21 · **Ask** C02 with the bio link · 24 s
**Motion:** a glowing spark beside „Chispa.“, then the spark grows and explodes on „Funke“. Three trades (Barbier, Kosmetik, Handwerk) each catch a spark. One spark flies along a curve into a phone and lights its feed tile by tile.
**Voice:** Chispa. Sprich Tschis-pa! Spanisch für Funke! Jedes Geschäft hat einen Funken! Wir finden deinen und bringen ihn in deinen Feed! Mit Posts, Stories und Reels mit Sprecherstimme! Ab dreihundertneunundneunzig Euro. Einmal zahlen, kein Abo! Schreib uns auf WhatsApp, der Link ist in der Bio! Content, der den Daumen stoppt. Chispa!
**Caption:**
```
Chispa. Sprich Tschis-pa ✦

Spanisch für Funke. Jedes Geschäft hat einen, und wir bringen deinen in deinen Feed. Mit Posts, Stories und Reels mit Sprecherstimme.

Ab 399 €, einmal bezahlt, kein Abo. Schreib uns auf WhatsApp, der Link ist in der Bio.

Stimme mit KI erstellt.
.
.
#kleinunternehmen #selbstständig #barbershop #kosmetikstudio #handwerk #unternehmer
```

## Reel 13 · Drei Pakete (TikTok first)
**Hook** headline L38 „Was kostet guter Content? Bei uns steht's dran.“ · **Framework** QUEST · **Angle** A20 · **Ask** C02 without a link · 48 s
**Motion:** three package cards dealt like playing cards, then each one swipes in full size. Inside every card a grid fills with exactly its number of posts (10, 20, 50), the price counts up, the fit line lands („Zum Ausprobieren.“, „Fast 7 Wochen versorgt.“, „Für richtig lange Zeit.“). Chispa gets „Unsere Empfehlung“ with sparks. Then „Bei allen“ with three checkmarks, the message field typing „Paket“, the outro.
**TikTok:** nothing important right of the button rail or under the caption; the top bar sits lower, clear of the search icon. The ask needs no bio link: „hier oder auf WhatsApp“ (a DM on TikTok is the viewer writing first, so still inbound).
**Voice:** Anna, natural read like reel 12 (no [excited] tags, no exclamation marks).
**Voice text:** Was kostet eigentlich guter Content? Bei uns steht's dran. Drei Pakete, ganz kurz. Chispita, dreihundertneunundneunzig Euro. Zehn Posts, zehn Stories, ein Reel. Perfekt, wenn du's erstmal ausprobieren willst. Chispa, siebenhundertneunundneunzig Euro. Zwanzig Posts, zwanzig Stories, drei Reels. Bei drei Posts pro Woche ist dein Feed fast sieben Wochen versorgt. Das ist unsere Empfehlung. Und Chispazo, tausendfünfhundertneunundneunzig Euro. Fünfzig Posts, fünfzig Stories, fünf Reels. Content für richtig lange Zeit. Bei allen kommt jeder Post mit fertiger Caption … und du zahlst einmal. Kein Abo. Schreib uns einfach „Paket“, hier oder auf WhatsApp. Content, der den Daumen stoppt. Chispa.
**Caption (TikTok):**
```
Was kostet guter Content? Bei uns steht's dran ✦

Chispita 399 €, Chispa 799 €, Chispazo 1.599 €. Einmal zahlen, kein Abo.

Welches Paket passt zu dir? Schreib uns „Paket“, hier oder auf WhatsApp.

Stimme mit KI erstellt.

#kleinunternehmen #selbstständig #socialmediamarketing #contentcreator #unternehmer #fyp
```
**When posting on TikTok:** switch on „KI-generierte Inhalte“ (AI-generated content) in the post settings. No sound from TikTok's library on a business account.

## Reel 12 · Sprachnachricht
**Framework** PAS with the three main objections from `objections.md` (the catch, no time for meetings, AI) · **Headline** L27 · **Ask** C02 · 38 s
**Motion:** a dark chat with Chispa Studio. A voice note plays with a live waveform and timer, word-by-word subtitles light up as she speaks, and messages arrive: the package (post, story with poll, reel), „Mit KI gemacht, von Menschen geprüft“, the price card, then the viewer's own reply „Paket“ with read ticks.
**Voice:** Anna in a natural, conversational read (stability 0.5, only 1.08× faster), with warm tags, a soft laugh and real pauses. **On purpose no [excited] tags and no exclamation marks**, an exception to the hooks.md voice rule, so it sounds like a person sending a voice note.
**Voice text:** Hey, kurz und ehrlich. Du hast ein Geschäft, das läuft. Und ein Instagram-Profil, das seit Wochen still ist, oder? Ist ja klar. Nach Feierabend hat da keiner mehr Lust drauf. Genau dafür gibt's uns. Du beantwortest ein paar Fragen auf WhatsApp, gern als Sprachnachricht … und wir machen dir Posts, Stories und Reels. Fertig, mit Caption. Und bevor du was bekommst, prüfen wir jedes Stück. Das Beste … du zahlst einmal, und das war's. Kein Abo. Ab dreihundertneunundneunzig Euro. Schreib uns einfach „Paket“ auf WhatsApp. Wir freuen uns auf dich. Content, der den Daumen stoppt. Chispa.
**Caption:**
```
Kurz und ehrlich, als Sprachnachricht ✦

Du hast ein Geschäft, das läuft, und ein Profil, das seit Wochen still ist. Nach Feierabend hat da keiner mehr Lust drauf.

Du beantwortest uns ein paar Fragen auf WhatsApp, gern auch als Sprachnachricht. Wir machen dir Posts, Stories und Reels, fertig mit Caption und von uns geprüft.

Einmal zahlen, kein Abo. Ab 399 €.

Schreib uns „Paket“ auf WhatsApp, der Link ist in der Bio.

Stimme mit KI erstellt.
.
.
#kleinunternehmen #selbstständig #socialmedia #instagrammarketing #contentcreation #unternehmer
```

## Reel 11 · Fünf Posts, die jedes Geschäft braucht
**Format** F01 (list) · **Framework** QUEST · **Angle** A16 · **Headline** L13 · **Ask** C03 save · about 28 s
**Motion:** five numbered screens; a giant 01 to 05 slides in, each with its own phone (a portrait, three steps, a question mark, a zoom, a price tag). Ends on a bookmark filling up.
**Status:** voiced with Anna and rendered (2026-11-07).
**Voice:** Fünf Posts, die jedes Geschäft braucht! Eins. Wer bei dir arbeitet. Menschen kaufen bei Menschen! Zwei. Wie ein Termin bei dir abläuft! Drei. Die Frage, die alle stellen, einmal beantwortet! Vier. Deine Arbeit, ganz nah! Fünf. Was es kostet! Speicher dir das! Und wenn dir die Zeit fehlt, machen wir sie für dich! Content, der den Daumen stoppt. Chispa!
**Caption:** post 13's caption in `texts.md`, plus „Stimme mit KI erstellt.“
