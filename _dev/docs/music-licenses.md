# Music licenses: what we use, what each asks of us (2026-10-28)

Every licensed track in the game, the license it comes under, and what that license requires. Read this
before adding a track, and before publishing anything outside the game that carries our music (a trailer,
a store video, a gameplay clip). This is a working summary from the license pages, not legal advice; the
full license text is what counts.

## The tracks

| Track | Composer | Where | License | Credit given |
|---|---|---|---|---|
| Refusing The Ultimatum | Arthur Vyncke | Title, and every screen without a track of its own | CC BY-SA 3.0 Unported | Settings > Credits, `CREDITS.md` |
| Legionnaire (Original) | Scott Buckley | The Warfront | CC BY 4.0 International | Settings > Credits, `CREDITS.md` |

The exact attribution text for each, verbatim from its source, is in `CREDITS.md`. The in-game credits
are `src/data/credits.ts`. A test (`src/hooks/__tests__/music.test.ts`) fails if a track in
`src/data/music.ts` has no credit in both places.

## CC BY 4.0 (Legionnaire)

License: https://creativecommons.org/licenses/by/4.0/ (the deed) and its legal code.

**What it allows:** copying, sharing and adapting the music, for any purpose, including commercial use.
The composer cannot take this back while we keep to the terms.

**What it asks:**
- **Credit:** the creator's name, the title, a link to the license, and any copyright or license notice
  that came with the work. Any reasonable manner works: our Credits screen is enough.
- **A link to the license:** done in both credits.
- **Say what was changed:** CC BY 4.0 asks us to indicate changes, and keep earlier notes of changes.
  We converted MP3 to AAC and play it on a loop with fades between screens; the credits say so. If we
  ever trim it, edit a loop point or remaster it, add that to both credits.
- **No endorsement:** never suggest Scott Buckley endorses the game.
- **No extra restrictions:** we cannot add terms or DRM that stop others doing what the license allows
  with the track itself (shipping it inside an app is fine).

**The composer's own terms** (scottbuckley.com.au, checked 2026-10-28): "free for use in any project
(including commercial) as long as I'm credited." His preferred credit:
`'Legionnaire (Original)' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au`

**Videos (important):** his library is registered with YouTube's Content ID ("Smart Content ID"). A
trailer, store video or gameplay clip with his music must carry his credit in the video description, or
it will be claimed. Paste the credit above into the description of every video that uses it.

## CC BY-SA 3.0 Unported (Refusing The Ultimatum)

License: https://creativecommons.org/licenses/by-sa/3.0/deed.en_US

**What it allows:** sharing and adapting, for any purpose, including commercial use.

**What it asks:**
- **Credit:** the author, the title, the source and a link to the license (done in both credits).
- **ShareAlike:** an *adapted* version of the music (trimmed, remixed, re-mastered, cut into a loop) must
  itself be released under CC BY-SA. Using the track whole and unchanged inside the game does not make
  the game ShareAlike. So: keep this track unedited. Converting the file format is not an adaptation.
- **Changes:** v3.0 asks that changes be indicated for adaptations; we have none beyond the format
  conversion, which the credits mention anyway.
- **Loops and fades:** the game loops the track and fades it in and out as the screen changes. That
  happens at playback; the file itself is untouched, so it is not an adaptation. Both tracks' credits say
  so, all the same.

## The other Creative Commons licenses, when choosing new tracks

| License | Commercial game | Edit it (trim, loop point) | Notes |
|---|---|---|---|
| CC0 | Yes | Yes | No credit required; give it anyway |
| CC BY | Yes | Yes, say what changed | The best fit |
| CC BY-SA | Yes | Only if the edit is released under BY-SA | Use unchanged |
| CC BY-ND | Yes | No | Use unchanged; a fade at playback is not an edit |
| CC BY-NC (any NC) | **No** | | Not for a game we may sell or put ads in |

A paid royalty-free license (a store or a pack) is also fine: keep the receipt or license certificate
in the owner's records and note its terms in `CREDITS.md`.

## Checklist for a new track

1. Read the license on the composer's own page (download sites can differ); avoid any NC license.
2. Save the source file to `assets/music/src/` and convert it with `bash scripts/convert-music.sh <file>`.
3. Add it to `src/data/music.ts` (a constant, `MUSIC_TRACKS`, and its screen in `SCREEN_MUSIC`).
4. Credit it in `src/data/credits.ts` and `CREDITS.md`, with the attribution text verbatim, the license
   link, and what was changed.
5. Update the track's row in `_dev/docs/music-wishlist.md`.
6. Note any video terms (Content ID) here.
