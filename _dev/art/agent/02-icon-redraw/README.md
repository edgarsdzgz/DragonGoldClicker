# Icon redraw: cog, wheat sheaf, hammer (2026-10-26)

The owner flagged three icons from mockup v1 whose shapes did not read: `icon-cog` (a lumpy ring),
`icon-wheat` (a key) and `icon-hammer` (a scythe). Each was redrawn from research on what the
object looks like and how pixel artists draw it at icon size. Grids: `src/icons.px`. Build:
`python build.py`. Comparison: `preview/sheet_x6.png`.

## What the research said, and what the icon does with it

| Icon | The real object | At icon size | The new icon |
| --- | --- | --- | --- |
| Cog (Settings) | Evenly spaced, uniform teeth; a center hole. Material Design made its cog's teeth more uniform and its hole larger. | Teeth stop resolving when small; simplify rather than shrink a detailed gear. About 8 chunky teeth. | 8 square teeth with 1 px gaps, a 2x2 dark hole, a bevel lit from the upper left. |
| Wheat sheaf (Foragers, Forage tab) | Heraldry's "garb": the ears stand upright, the sheaf is bound with a band, often in another color, and the ears can differ in color from the straw. | No reference found at this size; drawn from the heraldic form. | Three ears (left, center, right) in bright gold, straw in darker gold, a red band, splayed stalk ends. |
| Hammer (Repairers) | Claw hammer: a head with a striking face on one side and curved, V-shaped claws on the other, on a handle; the head is about 45 percent of the overall length. | 16x16 hammer icons are common; no orientation rule found. | Upright: a blunt face block on the right, the claw curving down on the left, a wooden handle. A diagonal draft read as a pickaxe at 12 px, so it was dropped. |

## Sources

- Cog: [Pixelated gear (visual.app)](https://visual.app/assets/illustrations/2d-pixel-icons/gear-cog-2d-pixel-icon),
  [16x16 pixel art tutorial (Photon Storm)](https://photonstorm.com/art/tutorials-art/16x16-pixel-art-tutorial),
  [Rough small signs pack, gear comment (OpenGameArt)](https://opengameart.org/content/rough-small-signs-symbol-pack),
  [itch.io comment on a 16x16 gear](https://itch.io/post/5864580),
  [What is a cog icon](https://edge.airmedia.org/cog-icon) (low quality; Material Design note only).
- Sheaf: [Sheaf (agriculture), Wikipedia](https://en.wikipedia.org/wiki/Sheaf_(agriculture)),
  [Garbe, Parker's glossary (DrawShield)](https://drawshield.net/reference/parker/g/garbe.html),
  [Garb, Elvin (DrawShield)](https://www.drawshield.net/reference/elvin/g/garb.html),
  [Wheat, Parker (DrawShield)](https://www.drawshield.net/reference/parker/w/wheat.html).
- Hammer: [Claw hammer, Wikipedia](https://en.wikipedia.org/wiki/Claw_hammer),
  [Parts of a hammer (Fine Power Tools)](https://www.finepowertools.com/hand-tools/hammer-parts/),
  [Hultafors claw hammer specs](https://hultafors.com/en-gl/products/claw-hammer-kp),
  [Heavy iron hammer (OpenGameArt)](https://opengameart.org/content/heavy-iron-hammer),
  [Weapon sprites 16x16 (itch.io)](https://roadw2k.itch.io/weapon-sprites-16x16).

No pixels were copied from any reference.
