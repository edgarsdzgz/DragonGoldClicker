# Credits

Third-party assets used in Dragon Gold. The same attributions appear in the game under
**Settings > Credits** (`src/data/credits.ts`). Keep the two in sync.

## Music

### Main theme: "Refusing The Ultimatum" by Arthur Vyncke

Attribution, as given on the track page (verbatim):

```
Refusing The Ultimatum by Arthur Vyncke | https://soundcloud.com/arthurvost
Royalty Free Music by https://www.free-stock-music.com
Creative Commons / Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)
https://creativecommons.org/licenses/by-sa/3.0/deed.en_US
```

- **License:** [CC BY-SA 3.0 Unported](https://creativecommons.org/licenses/by-sa/3.0/deed.en_US).
  It allows use for any purpose, including commercial use, with attribution.
- **Track page:** https://www.free-stock-music.com/arthur-vyncke-refusing-the-ultimatum.html
  (checked 2026-10-26)
- **File in the game:** `assets/music/out/Refusing the Ultimatum.m4a`
- **Changes:** converted from MP3 (192 kbps) to AAC (about 128 kbps) with
  `scripts/convert-music.sh`. The music itself is unmodified: same length (1:38) and no edits.
  It plays on a loop on the title and on every screen without a track of its own, and fades in
  and out as the screen changes (at playback; the file is untouched).
- **ShareAlike:** it applies to adaptations of the music. The track is used whole and
  unmodified, so keep it that way. Any edited version of the track (trimmed, remixed,
  re-mastered) must itself be released under CC BY-SA 3.0 or a compatible license.

### The Warfront: "Legionnaire" by Scott Buckley

The credit the composer asks for, from his track page (verbatim):

```
'Legionnaire (Original)' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
```

The attribution given where it was downloaded (verbatim):

```
Song: Legionnaire
Composer: Scott Buckley
Website: https://youtube.com/user/musicbyscottb
License: Creative Commons (BY 4.0) https://creativecommons.org/licenses/by/4.0/
Music powered by BreakingCopyright: https://breakingcopyright.com
```

- **License:** [CC BY 4.0 International](https://creativecommons.org/licenses/by/4.0/). It allows
  use for any purpose, including commercial use, with attribution and a link to the license.
- **Composer's page:** https://www.scottbuckley.com.au/library/legionnaire/ (checked 2026-10-28):
  "free for use in any project (including commercial) as long as I'm credited."
- **Downloaded from:** https://breakingcopyright.com/song/scott-buckley-legionnaire (2026-10-28)
- **File in the game:** `assets/music/out/Legionnaire.m4a` (source MP3: `assets/music/src/Legionnaire.mp3`)
- **Changes:** converted from MP3 (192 kbps) to AAC (about 128 kbps) with
  `scripts/convert-music.sh`. The music itself is unmodified: same length (3:04) and no edits.
  On the Warfront it takes turns with "Ignis" (each plays to its end, then the other), and it
  fades in and out as the music changes.
- **Videos:** the composer's library is registered with YouTube Content ID. Any trailer or gameplay
  video that carries this track must credit him in the video's description, or it will be claimed.

### The Warfront, the second siege track: "Ignis" by Scott Buckley

His credit, in the form his track pages give it (verbatim):

```
'Ignis' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
```

- **License:** [CC BY 4.0 International](https://creativecommons.org/licenses/by/4.0/), on the
  composer's own page: "free for use in any project (including commercial) as long as I'm credited."
- **Downloaded:** his own file, from https://www.scottbuckley.com.au/library/ (2026-10-28)
- **File in the game:** `assets/music/out/Ignis.m4a` (source MP3: `assets/music/src/Ignis.mp3`)
- **Changes:** converted from MP3 (320 kbps) to AAC (about 128 kbps) with `scripts/convert-music.sh`.
  The music itself is unmodified: same length (3:11) and no edits. On the Warfront it takes turns with "Legionnaire" (each plays to its end, then the other), and it fades in and out as the music changes.
- **Videos:** his library is registered with YouTube Content ID; credit him in the description of
  any video that carries this track.

### Draconia in ruins: "A Kind Of Hope" by Scott Buckley

His credit, in the form his track pages give it (verbatim):

```
'A Kind Of Hope' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
```

- **License:** [CC BY 4.0 International](https://creativecommons.org/licenses/by/4.0/), on the
  composer's own page: "free for use in any project (including commercial) as long as I'm credited."
- **Downloaded:** his own file, from https://www.scottbuckley.com.au/library/ (2026-10-28)
- **File in the game:** `assets/music/out/A Kind Of Hope.m4a` (source MP3: `assets/music/src/A Kind Of Hope.mp3`)
- **Changes:** converted from MP3 (320 kbps) to AAC (about 128 kbps) with `scripts/convert-music.sh`.
  The music itself is unmodified: same length (5:42) and no edits. It plays on a loop in Draconia until the city brightens, and fades in and out as the music changes.
- **Videos:** his library is registered with YouTube Content ID; credit him in the description of
  any video that carries this track.

### Draconia rebuilt: "Haven of the Faeries" by Darren Curtis

His credit (verbatim):

```
Haven of the Faeries by Darren Curtis
```

- **License:** not Creative Commons. Darren Curtis's Materials Release, signed by him: free use in
  whole or in part, in any media, commercial use and games included, with the credit "Darren
  Curtis"; the track itself may not be resold. The release is in `_dev/docs/licenses/`
  ("Haven of the Faeries - Materials Release (unsigned by us).pdf"); the owner countersigns it. His site: https://www.darrencurtismusic.com
- **Downloaded:** his free download (WAV, MP3 and OGG, with the release), 2026-10-28
- **File in the game:** `assets/music/out/Haven of the Faeries.m4a` (converted from his WAV master,
  `assets/music/src/Haven of the Faeries.wav`, which is kept out of git for its size)
- **Changes:** converted from WAV to AAC (about 128 kbps) with `scripts/convert-music.sh`. The music
  itself is unmodified: same length (2:33) and no edits. It plays on a loop in Draconia once the city brightens, and fades in and out as the music changes.

### A boss at the gate: "Rites of Passage" by Scott Buckley

His credit, in the form his track pages give it (verbatim):

```
'Rites of Passage' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
```

- **License:** [CC BY 4.0 International](https://creativecommons.org/licenses/by/4.0/), on the
  composer's own page: "free for use in any project (including commercial) as long as I'm credited."
- **Downloaded:** his own file, from https://www.scottbuckley.com.au/library/ (2026-10-28)
- **File in the game:** `assets/music/out/Rites of Passage.m4a` (source MP3: `assets/music/src/Rites of Passage.mp3`)
- **Changes:** converted from MP3 (320 kbps) to AAC (about 128 kbps) with `scripts/convert-music.sh`.
  The music itself is unmodified: same length (5:36) and no edits. It is one of three boss tracks: each boss fight plays one, on a loop from the top, and it fades in and out as the music changes.
- **Videos:** his library is registered with YouTube Content ID; credit him in the description of
  any video that carries this track.

### A boss at the gate: "Some Clowns Wanna Burn the World (Dark Mode)" by Darren Curtis

His credit (verbatim):

```
Some Clowns Wanna Burn the World (Dark Mode) by Darren Curtis
```

- **License:** not Creative Commons. Darren Curtis's Materials Release, signed by him: free use in
  whole or in part, in any media, commercial use and games included, with the credit "Darren
  Curtis"; the track itself may not be resold. The release is in `_dev/docs/licenses/`
  ("Some Clowns Wanna Burn the World - Materials Release (unsigned by us).pdf"); the owner countersigns it. His site: https://www.darrencurtismusic.com
- **Downloaded:** his free download (WAV, MP3 and OGG, with the release), 2026-10-28
- **File in the game:** `assets/music/out/Some Clowns Wanna Burn the World (Dark Mode).m4a` (converted from his WAV master,
  `assets/music/src/Some Clowns Wanna Burn the World (Dark Mode).wav`, which is kept out of git for its size)
- **Changes:** converted from WAV to AAC (about 128 kbps) with `scripts/convert-music.sh`. The music
  itself is unmodified: same length (2:40) and no edits. It is one of three boss tracks: each boss fight plays one, on a loop from the top, and it fades in and out as the music changes. The release came with the original version and names the piece, not the Dark Mode mix; his FAQ terms (free, commercial and games allowed, credit "Darren Curtis") cover the mix either way.

### A boss at the gate: "Under Siege!" by Darren Curtis

His credit (verbatim):

```
Under Siege! by Darren Curtis
```

- **License:** not Creative Commons. Darren Curtis's Materials Release, signed by him: free use in
  whole or in part, in any media, commercial use and games included, with the credit "Darren
  Curtis"; the track itself may not be resold. The release is in `_dev/docs/licenses/`
  ("Under Siege - Materials Release (unsigned by us).pdf"); the owner countersigns it. His site: https://www.darrencurtismusic.com
- **Downloaded:** his free download (WAV, MP3 and OGG, with the release), 2026-10-28
- **File in the game:** `assets/music/out/Under Siege.m4a` (converted from his WAV master,
  `assets/music/src/Under Siege.wav`, which is kept out of git for its size)
- **Changes:** converted from WAV to AAC (about 128 kbps) with `scripts/convert-music.sh`. The music
  itself is unmodified: same length (1:34) and no edits. It is one of three boss tracks: each boss fight plays one, on a loop from the top, and it fades in and out as the music changes.

### The deep Unmaking: "Conquer the Great Sands" by Darren Curtis

His credit (verbatim):

```
Conquer the Great Sands by Darren Curtis
```

- **License:** not Creative Commons. Darren Curtis's Materials Release, signed by him: free use in
  whole or in part, in any media, commercial use and games included, with the credit "Darren
  Curtis"; the track itself may not be resold. The release is in `_dev/docs/licenses/`
  ("Conquer the Great Sands - Materials Release (unsigned by us).pdf"); the owner countersigns it. His site: https://www.darrencurtismusic.com
- **Downloaded:** his free download (WAV, MP3 and OGG, with the release), 2026-10-28
- **File in the game:** `assets/music/out/Conquer the Great Sands.m4a` (converted from his WAV master,
  `assets/music/src/Conquer the Great Sands.wav`, which is kept out of git for its size)
- **Changes:** converted from WAV to AAC (about 128 kbps) with `scripts/convert-music.sh`. The music
  itself is unmodified: same length (2:31) and no edits. On the Warfront from horde level 10 it takes turns with "Prepare Thyself" (each plays to its end, then the other), and it fades in and out as the music changes.

### The deep Unmaking: "Prepare Thyself" by Darren Curtis

His credit (verbatim):

```
Prepare Thyself by Darren Curtis
```

- **License:** not Creative Commons. Darren Curtis's Materials Release, signed by him: free use in
  whole or in part, in any media, commercial use and games included, with the credit "Darren
  Curtis"; the track itself may not be resold. The release is in `_dev/docs/licenses/`
  ("Prepare Thyself - Materials Release (unsigned by us).pdf"); the owner countersigns it. His site: https://www.darrencurtismusic.com
- **Downloaded:** his free download (WAV, MP3 and OGG, with the release), 2026-10-28
- **File in the game:** `assets/music/out/Prepare Thyself.m4a` (converted from his WAV master,
  `assets/music/src/Prepare Thyself.wav`, which is kept out of git for its size)
- **Changes:** converted from WAV to AAC (about 128 kbps) with `scripts/convert-music.sh`. The music
  itself is unmodified: same length (2:25) and no edits. On the Warfront from horde level 10 it takes turns with "Conquer the Great Sands" (each plays to its end, then the other), and it fades in and out as the music changes. Its release is in an older wording, with no separate clause on editing and looping; his FAQ allows adapting, and looping at playback leaves the file unchanged.

### The Breach: "Through the Sinister Gate" by Justin Allan Arnold

The credit (verbatim):

```
'Through the Sinister Gate' by Justin Allan Arnold - licensed under CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/). soundcloud.com/justin-allan-arnold
```

- **License:** [CC BY 3.0 Unported](https://creativecommons.org/licenses/by/3.0/), as BreakingCopyright's
  notice gives it (his own site, ifnessfreemusic.com, puts his catalog under CC BY 4.0 but does not
  list this track). It allows commercial use with credit. CC BY 3.0 has no grace period for a credit
  mistake (4.0 gives 30 days to fix one), so keep this credit exact.
- **Downloaded from:** https://breakingcopyright.com (2026-10-28)
- **File in the game:** `assets/music/out/Through the Sinister Gate.m4a` (source MP3:
  `assets/music/src/Through the Sinister Gate.mp3`)
- **Changes:** converted from MP3 (183 kbps) to AAC (about 128 kbps) with `scripts/convert-music.sh`.
  The music itself is unmodified: same length (1:08) and no edits. It plays once when the wall falls,
  and fades in and out as the music changes.

### The Forage valley: "Welcome to Hoibittown" by Darren Curtis

His credit (verbatim):

```
Welcome to Hoibittown by Darren Curtis
```

- **License:** not Creative Commons. Darren Curtis's Materials Release, signed by him: free use in
  whole or in part, in any media, commercial use and games included, with the credit "Darren
  Curtis"; the track itself may not be resold. The release is in `_dev/docs/licenses/`
  ("Welcome to Hoibittown - Materials Release (unsigned by us).pdf"); the owner countersigns it. His site: https://www.darrencurtismusic.com
- **Downloaded:** his free download (WAV, MP3 and OGG, with the release), 2026-10-28
- **File in the game:** `assets/music/out/Welcome to Hoibittown.m4a` (converted from his WAV master,
  `assets/music/src/Welcome to Hoibittown.wav`, which is kept out of git for its size)
- **Changes:** converted from WAV to AAC (about 128 kbps) with `scripts/convert-music.sh`. The music
  itself is unmodified: same length (2:22) and no edits. It plays on a loop on the Forage tab, and fades in and out as the music changes.

### The Librarium: "The Invention Rooms" by Savfk

His credit (verbatim):

```
The Invention Rooms by Savfk - www.youtube.com/@savfkmusic
```

- **License:** [CC BY 4.0 International](https://creativecommons.org/licenses/by/4.0/), on his own
  site, savfkmusic.com.
- **Downloaded from:** BreakingCopyright's re-encode (192 kbps), https://breakingcopyright.com
  (2026-10-28); there is no original download to replace it with.
- **File in the game:** `assets/music/out/The Invention Rooms.m4a` (source MP3:
  `assets/music/src/The Invention Rooms.mp3`)
- **Changes:** converted from MP3 (192 kbps) to AAC (about 128 kbps) with `scripts/convert-music.sh`.
  The music itself is unmodified: same length (3:32) and no edits. It plays on a loop while the
  Librarium is open, and fades in and out as the music changes.

### The Wizard's Tower: "Signal To Noise" by Scott Buckley

His credit, in the form his track pages give it (verbatim):

```
'Signal To Noise' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
```

- **License:** [CC BY 4.0 International](https://creativecommons.org/licenses/by/4.0/), on the
  composer's own page: "free for use in any project (including commercial) as long as I'm credited."
- **Downloaded:** BreakingCopyright's re-encode of his free download, from https://breakingcopyright.com. His own page gives the license as CC BY 4.0; BreakingCopyright's notice says 3.0, and the composer's page is the one that counts (2026-10-28)
- **File in the game:** `assets/music/out/Signal To Noise.m4a` (source MP3: `assets/music/src/Signal To Noise.mp3`)
- **Changes:** converted from MP3 (192 kbps) to AAC (about 128 kbps) with `scripts/convert-music.sh`.
  The music itself is unmodified: same length (5:53) and no edits. The full mix. It plays on a loop while the Wizard's Tower is open, and fades in and out as the music changes.
- **Videos:** his library is registered with YouTube Content ID; credit him in the description of
  any video that carries this track.

### Story scenes, hope: "Childhood" by Scott Buckley

His credit, in the form his track pages give it (verbatim):

```
'Childhood' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
```

- **License:** [CC BY 4.0 International](https://creativecommons.org/licenses/by/4.0/), on the
  composer's own page: "free for use in any project (including commercial) as long as I'm credited."
- **Downloaded:** BreakingCopyright's re-encode of his free download, from https://breakingcopyright.com. His own page gives the license as CC BY 4.0; BreakingCopyright's notice says 3.0, and the composer's page is the one that counts (2026-10-28)
- **File in the game:** `assets/music/out/Childhood.m4a` (source MP3: `assets/music/src/Childhood.mp3`)
- **Changes:** converted from MP3 (192 kbps) to AAC (about 128 kbps) with `scripts/convert-music.sh`.
  The music itself is unmodified: same length (2:16) and no edits. It plays on a loop, from the top, under a story scene of hope, and fades in and out as the music changes.
- **Videos:** his library is registered with YouTube Content ID; credit him in the description of
  any video that carries this track.

### Story scenes, dread: "The Long Dark" by Scott Buckley

His credit, in the form his track pages give it (verbatim):

```
'The Long Dark' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
```

- **License:** [CC BY 4.0 International](https://creativecommons.org/licenses/by/4.0/), on the
  composer's own page: "free for use in any project (including commercial) as long as I'm credited."
- **Downloaded:** his own file, from https://www.scottbuckley.com.au/library/ (2026-10-28)
- **File in the game:** `assets/music/out/The Long Dark.m4a` (source MP3: `assets/music/src/The Long Dark.mp3`)
- **Changes:** converted from MP3 (320 kbps) to AAC (about 128 kbps) with `scripts/convert-music.sh`.
  The music itself is unmodified: same length (7:19) and no edits. It plays on a loop, from the top, under a story scene of dread (taking turns with "Horizons" scene by scene), and fades in and out as the music changes.
- **Videos:** his library is registered with YouTube Content ID; credit him in the description of
  any video that carries this track.

### Story scenes, dread: "Horizons" by Scott Buckley

His credit, in the form his track pages give it (verbatim):

```
'Horizons' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
```

- **License:** [CC BY 4.0 International](https://creativecommons.org/licenses/by/4.0/), on the
  composer's own page: "free for use in any project (including commercial) as long as I'm credited."
- **Downloaded:** BreakingCopyright's re-encode of his free download, from https://breakingcopyright.com. His own page gives the license as CC BY 4.0; BreakingCopyright's notice says 3.0, and the composer's page is the one that counts (2026-10-28)
- **File in the game:** `assets/music/out/Horizons.m4a` (source MP3: `assets/music/src/Horizons.mp3`)
- **Changes:** converted from MP3 (192 kbps) to AAC (about 128 kbps) with `scripts/convert-music.sh`.
  The music itself is unmodified: same length (4:53) and no edits. It plays on a loop, from the top, under a story scene of dread (taking turns with "The Long Dark" scene by scene), and fades in and out as the music changes.
- **Videos:** his library is registered with YouTube Content ID; credit him in the description of
  any video that carries this track.
