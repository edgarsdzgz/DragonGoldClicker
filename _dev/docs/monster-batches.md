# Monster batches

The new monsters, split into small art batches so they get made a few at a time. Started 2026-10-29.

The names are the picks proposed on the bestiary pick board
(https://claude.ai/artifact/YKfJUHqqLUmCqF7Adzgy2a). My choices on the board win: a swap replaces a
name here, and a cut removes it. The research behind every pick is in `bestiary-research/`
(`rosters.md`, the catalogs) and the plan in `bestiary-research-plan.md`.

## What one batch is

Each batch is one part of one Land: its regular monsters, or its elites and bosses. That keeps a
Land's look together and keeps every batch to two to four monsters.

Every monster gets the full set, as in batches 44 to 48: idle, hit, hurt, a two-frame walk and a
four-frame death, each at the Unmaking's three tiers (weak, strong, stronger). That is 15 images per
monster. A flier also gets its shadow.

The steps for each batch:

1. **My picks:** I fill in that Land's slots on the pick board.
2. **Second source:** each kept monster gets its folklore checked against a second source before any
   drawing.
3. **Draw:** batch M1 starts with a pilot (one monster drawn first, so I can approve the look for the
   new monsters), then the rest.
4. **Review:** a board of the batch, published as an Artifact.
5. **Lock:** what I approve goes into `_dev/art/official/` and into `bestiary.md`.

The art folder gets the next free number when a batch starts (`_dev/art/agent/56-...` and on), because
other art may come in between. Putting monsters into waves is code work, done separately after each
Land is locked.

Marks: **flier** (drawn higher, over its own shadow, with a wingbeat walk); **big** (a larger canvas,
like the bosses in batch 47); **flag** (an open question on the board that I decide before the batch
is drawn).

## The batches

| Batch | Land (levels) | Monsters | Notes |
| --- | --- | --- | --- |
| M1 | Mistral Peaks (21-30), regulars | Kamaitachi, Aitvaras, Gargoyle, Wild Hunt Rider | Pilot: Kamaitachi first. Aitvaras, Gargoyle: flier. Wild Hunt Rider: flag (close to the Storm Rider) |
| M2 | Mistral Peaks, elites and boss | Impundulu, Omukade, Tempest Lord of the Peaks | Impundulu: flier. Omukade, Tempest Lord: big |
| M3 | Riverglass Delta (31-40), regulars | Kappa, Kongamato, Nixie | Kongamato: flier |
| M4 | Riverglass Delta, elites and bosses | Jenny Greenteeth, Ahuizotl, Berberoka, Lernaean Hydra | Berberoka, Hydra: big |
| M5 | Elderbough Crown (41-50), regulars | Amomongo, Nogitsune, Swarm of Spiders, Kalanoro | |
| M6 | Elderbough Crown, elites and boss | Leshy, Sasabonsam, Humbaba | Humbaba: big. The Spider Queen is already drawn |
| M7 | Gloamfen Mire (51-60), regulars | Jiangshi, Adze, Will-o'-Wisp, Kikimora | Will-o'-Wisp: flier |
| M8 | Gloamfen Mire, elites and mini-boss | Draugr, Empousa, Dullahan | Dullahan: big (a rider). The Lich is already drawn |
| M9 | Saffron Dunes (61-70), regulars | Serpopard, Nasnas, Mummy, Yara-ma-yha-who | Yara-ma-yha-who: flag (Bungisngis suggested) |
| M10 | Saffron Dunes, elites and mini-boss | Girtablilu, Poludnitsa, Manticore | Manticore: big. The Corrupted Drake is already drawn |
| M11 | Tideglass Coast (71-80), regulars | Blue Men of the Minch, Funayurei, Archelon, Stymphalian Birds | Stymphalian Birds: flier |
| M12 | Tideglass Coast, elites and bosses | Fomorian Raider, Sirens, Nuckelavee, Kraken | Sirens: flier. Nuckelavee, Kraken: big. The Kraken must come up a road: I decide how |
| M13 | Hollowspire Below (81-90), regulars | Cornish Knocker, Polar Bear, Animated Armor | |
| M14 | Hollowspire Below, elites | Yuki-onna, Camazotz | Camazotz: flier, flag (Kerit suggested). The Stone Golem and Corrupted Wyvern are already drawn |
| M15 | Shadowmere (91-100), regulars | Boggart, Mara, Keres, Sigbin | Keres: flier |
| M16 | Shadowmere, elites and mini-boss | Puca, Chemosit, Lamashtu | Lamashtu: big, flag (a goddess; Lagahoo suggested) |
| M17 | Seasonal visitors | Nian, Yule Cat, Gryla, Krampus | Nian: big |

That is 59 new monsters in 17 batches, about 885 images. Horizon Steppe and the Ember Reaches need no
batch: their monsters are all drawn already.

## Not in these batches

- **The Rift Boss** (the end of Shadowmere, level 100). It stays text-first, as I asked: I settle his
  name and forms in `final-boss-ideas.md`, then he gets batches of his own (the first form, then the
  other four).
- **Moving the drawn mini-bosses and bosses to their new levels** (the Spider Queen to 45, the Lich to
  60, and so on, per `rosters.md`). That is a change to `src/types/monsterRoster.ts`, not art.
