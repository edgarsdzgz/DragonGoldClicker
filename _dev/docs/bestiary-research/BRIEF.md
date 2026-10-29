# Bestiary research: brief for researcher agents (2026-10-29)

You are gathering real monsters from folklore, myth and open tabletop content for Draconia Chronicles, a
mobile idle siege game. Monsters march up a road to a city gate defended by a dragon. Write American English.
No emoji. Do not edit any file except your own output file. Do not commit.

## The world (canon; follow it, never change it)

Monsters are creatures and peoples corrupted by the **Human-Wrought Evil**, an ancient force that human
hubris let in through dimensional rifts. It "corrupts and inverts": protection becomes consumption, fire
becomes wildfire. Its late stage is called the Unmaking. The world is split into **Lands**, and each has an
element and a faction:

| Land | Element | Feel |
|---|---|---|
| Horizon Steppe | wind, cold | grassland, nomads (done) |
| Ember Reaches | fire | volcanic grave of a nation, fire cultists (done) |
| Mistral Peaks | lightning, wind | high wind-carved mountains, Storm-Callers |
| Riverglass Delta | steam | hot steaming river delta and marsh |
| Elderbough Crown | mist | ancient misty forest, feral fey |
| Gloamfen Mire | void | dark fen, the dead and the hollow |
| Saffron Dunes | plasma | desert under a cracked sky |
| Tideglass Coast | lightning | stormy coast, sea raiders |
| Hollowspire Below | ice | frozen caverns under mountains |
| Shadowmere | corruption | wetlands at the Rift's edge, portals |

**Already in the bestiary (do not repeat; note a match in `already_in_bestiary`):** Kobold, Goblin, Giant
Rat, Shadow Crawler, Goblin Scout, War Hound, Orc, Goblin Archer, Banner-Runner, Giant Bat, Shield Bearer,
Goblin Wolf Rider, Beetle Guard, Harpy, Chitin Warrior, Nomad Scout, Nomad Warrior, Nomad Archer, Storm
Rider, Wraith, Skeleton, Shadow Phantom, Spectral Hound, Ashen Convert, Cult Apprentice, Ember Prophet,
Mantair Corsair, Ember Wraith, Raider, Kobold Shaman, Goblin Chieftain, Orc Warchief, Troll, Ogre,
Windcaller, Iron Golem, Minotaur, Basilisk, Spider Queen, Stone Golem, Giant Elemental, Khagan of the
Sirocco, Forge-Master of the Inferno, Corrupted Drake, Corrupted Wyvern, Lich.

## Rules every candidate is rated on

1. **License**
   - `green`: myth, folklore or a cryptid. The ideas are public domain; we write our own description.
   - `green-credit`: in the D&D SRD 5.1 or 5.2 (CC BY 4.0) or Pathfinder ORC content. Name the document.
   - `red`: a D&D creature not in the SRD (Wizards of the Coast product identity, such as the beholder, mind
     flayer or displacer beast), or a creature invented by a modern book, film or game.
2. **Sensitivity**
   - `green`: a folklore monster widely used in fiction.
   - `yellow`: from a living belief or a culture's sacred tradition. Usable with care; say why.
   - `red`, never an enemy:
     - deities, and their sacred animals or mounts;
     - sacred guardians or ancestors (for example taniwha, whom many iwi regard as kaitiaki);
     - beings that Indigenous communities ask outsiders not to use (for example the wendigo and the
       skinwalker).
   - Still list red ones, so the owner sees them, and say why they are red.
   - Never suggest dressing a faction as a real ethnic group.
3. **Fit**
   - It must work as a hostile creature at about 16x20 pixels: a clear silhouette, and it must not read as
     an ordinary villager.
   - Benevolent beings only fit if their tradition also has a dangerous form; say so.
4. **Sources**
   - At least two per creature, with at least one more solid than a wiki: a public-domain collection
     (Project Gutenberg, Internet Archive, sacred-texts.com), folklore scholarship (D. L. Ashliman's
     University of Pittsburgh texts, a university archive, Britannica), a museum or heritage site, Te Ara
     for Maori lore, Theoi for Greek, or the official SRD / Open5e for tabletop.
   - Wikipedia is fine as a map and as one of the two.
   - Write descriptions in your own words; no quoted passages beyond a name or a short phrase.
   - Do not invent facts. If unsure, say "unverified" in the notes, or leave the creature out.

## Output: a CSV file

Write UTF-8 CSV with this exact header (quote every field; separate several values inside a field with
" | "):

```
name,other_names,origin,source_type,sources,looks,behavior,land_fit,element,enemy_type,rank_fit,license,license_note,sensitivity,sensitivity_note,reads_at_16x20,already_in_bestiary
```

- `origin`: the culture and the country or region.
- `source_type`: folklore, myth, cryptid, srd, literature.
- `sources`: each as `URL (read 2026-10-29)`.
- `looks` and `behavior`: one or two sentences each, in your own words.
- `land_fit`: one or two Lands from the table.
- `enemy_type`: swarm, ranged, shielded, spectral, chitin, flier, brute.
- `rank_fit`: regular, elite, miniboss, boss, event.
- `reads_at_16x20`: yes or no, with a short note.
- `already_in_bestiary`: "none" or the name it repeats.

Aim for variety: beasts, undead, giants, hags, swarms, fliers, water creatures and constructs, across the
whole region and not only its most famous monsters.

## Report back (under 200 words)

The row count, the split by Land, the counts of red and yellow ratings, the gaps you could not fill, and
anything the owner should decide.
