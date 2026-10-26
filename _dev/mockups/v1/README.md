# Mockup v1: Draconia UI mockups (Claude Design canvas)

The first pixel-art mockup, made 2026-10-26. The live canvas is
https://claude.ai/artifact/JfM7nbJNg4UrUDbmxbWnPm; this folder is its saved copy.

- `canvas.json` places the boards on the canvas (position, size, title).
- Each `*.dc.html` file is one board. They render inside the Claude Design canvas, which supplies
  `support.js` and the `<x-dc>` runtime, so they will not render on their own in a browser.
- `images/` holds every image the boards use. Uploaded `/_blob/<id>` links were rewritten to these
  files, matched to their originals by SHA-256.

| Board | What it shows |
| --- | --- |
| Main | Warfront: tap the kobold |
| Draconia | The city map |
| KeepUpgrade | Keep upgrade sheet |
| Forage | Forage expeditions |
| Dialogue | Elder Pyreth dialogue |
| Spoils | Spoils of the night (offline report) |
| Cast, Rodain, Mirael, Lirae | The cast and three story moments |
| Bestiary | The horde in pixel art |
| HeroStudies, HeadV2 to HeadV7, HeadStudy, BodyV1, BodyV2 | Protagonist studies. Superseded by the artist brief; kept as history |
