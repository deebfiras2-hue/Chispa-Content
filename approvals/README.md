# Approvals · Freigaben

Nothing is posted without the owner's written OK. One file per posting day: `approvals/YYYY-MM-DD.txt`.

- Every file **starts with `NEIN`** on the first line. The content routine creates it together with the day's items in `plan/calendar.json`.
- **To approve:** change the first line to `JA` (exactly that word, alone on the line), ideally the day before. The posting routine then publishes that day's items at their times from `plan/calendar.json` (reels 19:00, carousels 12:00, Europe/Berlin).
- **To ask for changes:** leave `NEIN` and write the change requests below it, in plain words („Stimme zu schnell“, „anderer Titel: …“). The next content run reads them, fixes the item and leaves the file on `NEIN` for a fresh check.
- **Not this day at all:** leave `NEIN`. Nothing happens; the item stays in the calendar until it is moved or removed.
- Lines starting with `#` are notes from the routine (what the day contains); they are ignored.

| first line | what happens |
|---|---|
| `NEIN` (default) | nothing is posted |
| `JA` | the day's items are posted at their times |

Calendar format: `plan/calendar.json` → `{"timezone": "Europe/Berlin", "days": [{"date", "items": [{"id", "type": "reel"|"carousel", "time", "title", "video" or "images" (JPEG only, Instagram API), "cover", "caption_file"}]}]}`.
