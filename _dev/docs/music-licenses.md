# Music licenses: what we use, what each asks of us (2026-10-28)

Every licensed track in the game, the license it comes under, and what that license requires. Read this
before adding a track, and before publishing anything outside the game that carries our music (a trailer,
a store video, a gameplay clip). This is a working summary from the license pages, not legal advice; the
full license text is what counts.

## The tracks

| Track | Composer | Where | License | Credit given |
|---|---|---|---|---|
| Refusing The Ultimatum | Arthur Vyncke | Title, and every screen without a track of its own | CC BY-SA 3.0 Unported | Settings > Credits, `CREDITS.md` |
| Legionnaire (Original) | Scott Buckley | The Warfront (takes turns with Ignis) | CC BY 4.0 International | Settings > Credits, `CREDITS.md` |
| Ignis | Scott Buckley | The Warfront (takes turns with Legionnaire) | CC BY 4.0 International | Settings > Credits, `CREDITS.md` |
| A Kind Of Hope | Scott Buckley | Draconia, until the city brightens | CC BY 4.0 International | Settings > Credits, `CREDITS.md` |
| Haven of the Faeries | Darren Curtis | Draconia, once the city brightens | His Materials Release | Settings > Credits, `CREDITS.md` |
| Rites of Passage | Scott Buckley | A boss at the gate (one of three) | CC BY 4.0 International | Settings > Credits, `CREDITS.md` |
| Some Clowns Wanna Burn the World (Dark Mode) | Darren Curtis | A boss at the gate (one of three) | His Materials Release | Settings > Credits, `CREDITS.md` |
| Under Siege! | Darren Curtis | A boss at the gate (one of three) | His Materials Release | Settings > Credits, `CREDITS.md` |
| Conquer the Great Sands | Darren Curtis | The Warfront in the deep Unmaking (takes turns) | His Materials Release | Settings > Credits, `CREDITS.md` |
| Prepare Thyself | Darren Curtis | The Warfront in the deep Unmaking (takes turns) | His Materials Release | Settings > Credits, `CREDITS.md` |
| Through the Sinister Gate | Justin Allan Arnold | The Breach, once | CC BY 3.0 Unported | Settings > Credits, `CREDITS.md` |
| Welcome to Hoibittown | Darren Curtis | The Forage valley | His Materials Release | Settings > Credits, `CREDITS.md` |
| The Invention Rooms | Savfk | The Librarium | CC BY 4.0 International | Settings > Credits, `CREDITS.md` |
| Signal To Noise | Scott Buckley | The Wizard's Tower | CC BY 4.0 International | Settings > Credits, `CREDITS.md` |
| Childhood | Scott Buckley | Under a story scene of hope | CC BY 4.0 International | Settings > Credits, `CREDITS.md` |
| The Long Dark | Scott Buckley | Under a story scene of dread (by turns) | CC BY 4.0 International | Settings > Credits, `CREDITS.md` |
| Horizons | Scott Buckley | Under a story scene of dread (by turns) | CC BY 4.0 International | Settings > Credits, `CREDITS.md` |

Kept for later, not in the game: "Camelot Monastery" (Darren Curtis, his Materials Release), for a holy
place if the game gets one.

The exact attribution text for each, verbatim from its source, is in `CREDITS.md`. The in-game credits
are `src/data/credits.ts`. A test (`src/hooks/__tests__/music.test.ts`) fails if a track in
`src/data/music.ts` has no credit in both places, or if an in-game credit line is not word for word
the one in `CREDITS.md`.

**A composer's own page beats a download site's label.** BreakingCopyright labels Ignis, Childhood,
Horizons and Signal To Noise CC BY 3.0 (and Signal To Noise only "Free To Use YouTube license"); Scott
Buckley's own pages put them under CC BY 4.0, and the credits follow his pages.

## CC BY 4.0 (Scott Buckley's tracks, and Savfk's The Invention Rooms)

License: https://creativecommons.org/licenses/by/4.0/ (the deed) and its legal code.

**What it allows:** copying, sharing and adapting the music, for any purpose, including commercial use.
The composer cannot take this back while we keep to the terms.

**What it asks:**
- **Credit:** the creator's name, the title, a link to the license, and any copyright or license notice
  that came with the work. Any reasonable manner works: our Credits screen is enough.
- **A link to the license:** done in both credits.
- **Say what was changed:** CC BY 4.0 asks us to indicate changes, and keep earlier notes of changes.
  We converted each track to AAC and play it on a loop, in turns or once, with fades between; the
  credits say which. If we
  ever trim it, edit a loop point or remaster it, add that to both credits.
- **No endorsement:** never suggest Scott Buckley endorses the game.
- **No extra restrictions:** we cannot add terms or DRM that stop others doing what the license allows
  with the track itself (shipping it inside an app is fine).

**A credit mistake can be put right:** CC BY 4.0 gives the rights back automatically if a breach (a
missing or wrong credit) is fixed within 30 days of finding out. CC BY 3.0 has no such clause.

**Scott Buckley's own terms** (scottbuckley.com.au, checked 2026-10-28): "free for use in any project
(including commercial) as long as I'm credited." His credit, in the form his track pages give it, for
example `'Legionnaire (Original)' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au`.
Each of his tracks is credited this way, with its own title.

**Savfk** (savfkmusic.com) puts his music under CC BY 4.0. His credit:
`The Invention Rooms by Savfk - www.youtube.com/@savfkmusic`, with the license link.

**Videos (important):** Scott Buckley's library is registered with YouTube's Content ID ("Smart Content
ID"). A trailer, store video or gameplay clip with his music must carry his credit in the video
description, or it will be claimed. Paste the credit of each of his tracks a video uses into its
description, and do the same for every other track a video carries: the credit is owed there too.

## CC BY 3.0 Unported (Through the Sinister Gate)

License: https://creativecommons.org/licenses/by/3.0/

**What it allows:** sharing and adapting, for any purpose, including commercial use.

**What it asks:**
- **Credit:** the author, the title, the source if given, and the license's link, wherever credits for
  the work appear. The exact line is in `CREDITS.md`, and the game shows it word for word.
- **No grace period:** unlike 4.0, a 3.0 license ends at once on a breach. A wrong or missing credit in a
  shipped build loses the right to use the track. Check the credit before a build goes out, every build.
- **Changes:** only adaptations must be marked, and we have none. The format conversion and the playback
  (played once, faded) are noted in the credits all the same.

His own site (ifnessfreemusic.com) puts his catalog under CC BY 4.0 but does not list this track. We go
by the 3.0 notice that came with the download: it asks for more, so keeping it covers both.

## Darren Curtis's Materials Release

Used for Haven of the Faeries, Some Clowns Wanna Burn the World (Dark Mode), Under Siege!, Conquer the
Great Sands, Prepare Thyself and Welcome to Hoibittown (and Camelot Monastery, kept for later).

Not Creative Commons. Each free download comes with a Materials Release, a short license signed by him
with the track's title filled in. Copies are in `_dev/docs/licenses/`. The owner signs each as the
producer (RAXDEG STUDIOS, project Draconia Chronicles), and the signed copy replaces the unsigned one.
Signing completes the paperwork; it does not hold up using the music.

**What it allows:** use of the track in whole or in part, in any media, commercial use and games
included. The newer wording also allows editing and looping outright. The older wording (Haven of the
Faeries, Under Siege!, Prepare Thyself, Camelot Monastery) does not say so separately, but his FAQ
allows remixing and adapting, and looping at playback leaves the file unchanged either way.

**What it asks:**
- **Credit:** "Darren Curtis". His FAQ's form, used in the game: "<Title> by Darren Curtis", with a link
  to https://www.darrencurtismusic.com welcome.
- **No reselling:** the track itself may not be sold or handed out as music (a sound file, a music
  pack). Shipping it inside the game is fine.

**Some Clowns Wanna Burn the World (Dark Mode):** the Dark Mode download had no release. The original
version's download has one, which names the piece, not the mix. The track is on his free music pages,
so his FAQ terms cover the mix either way.

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
2. Save the source file to `assets/music/src/` and convert it with `bash scripts/convert-music.sh <file>`
   (MP3 or WAV; a WAV master stays out of git).
3. Add it to `TRACKS` in `src/data/music.ts`, and give it a place in `musicPlan` (a screen, a sheet,
   a pair that takes turns, or a pick).
4. Credit it in `src/data/credits.ts` (the `attribution` line word for word) and `CREDITS.md`, with the
   license link and what was changed.
5. Update the track's row in `_dev/docs/music-wishlist.md`.
6. Note any video terms (Content ID) here.
