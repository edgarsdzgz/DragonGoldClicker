# Drawing the Warden: dragon pixel-art research

2026-10-26. Owner feedback on the first hero studies (procedural, `herostudy.py`):

- They look silly.
- The horns don't read as horns.
- The eyes look out of focus, which gives a dopey look.
- The bodies are lean.
- There is a strange "3D effect" on everything, instead of colors alone making the shading.

This note gathers what tutorials and anatomy references say, maps each complaint to a cause, and sets the rules for the redraw.

## 1. Why the studies failed

| Complaint | Cause in the studies | What the sources say |
|---|---|---|
| "Strange 3D effect" | A scale-dot pattern and belly-plate lines stamped over every surface, plus ordered dithering between every tone. The surface reads as a printed texture or a render filter, not as pixel art. | A uniform texture "can appear unnatural and too busy" [SLY-2]. Use dithering "sparingly" [ARNE]. "Drawing each scale reads as static" [SAI]. "Good pixel art eliminates all unnecessary detail" [S11-4]. |
| Eyes out of focus, dopey | The eye was a small iris ellipse surrounded by outline pixels and dithered skin. Neighboring noise of the same value smears the edge, so the eye has no crisp shape. It also sat on the side of the head with no brow over it, so it looked open and blank. | Keep eyes to very few pixels: one for the pupil and a couple for the shape [EYE]. A highlight boxed by outline reads as "panda eyes" [EYE]. A small eye under a heavy brow is what makes a dragon threatening; "the eyelids, brow, and surrounding scales often contribute more to the expression than the eyeball does" [MUU]. Raptors look fierce because a bony shelf over the eye shades it [BROW]. |
| Horns don't read | Thin, pale, straight lines of 1-2 pixels, the same value as the spines, starting anywhere on the head. At 3x they read as sticks or hair. | "A horn should appear to grow from the skull" [MUU]. Attach horns to the upper skull [TUTS]. The far horn is foreshortened, shorter and thicker [INST]. Horns need a lit edge and a shadow edge so they read as a cone. |
| Silly | Cartoon proportions: a big round head, big eye, thin neck and a short muzzle. Teeth and spines were identical rows. | A smaller eye relative to the head makes a dragon look bigger and more threatening [SKB]. A "perfectly identical row of spikes" and a round white eye highlight read cartoonish [MUU]. Two or three light pixels on the jaw say teeth; six say confusion [SAI]. |
| Lean | A narrow chest and a thin neck base, with small limbs under large wings. | Flight needs "massive pectoral muscles and a reinforced sternum" [ANAT]: think of a bird's keel chest scaled up. The lizard chest is longer than head and neck combined [DES]. |

## 2. Principles for the redraw

### 2.1 Pixel-art craft

1. **Flat clusters, not texture.**
   - Every material is a few solid clusters of 3-5 tones.
   - Flat faces take one color. Curved forms change color only along the direction of the curve [S11-4].
   - No noise layer, no dithering on the body.
   - Avoid "too many small scattered clusters" [SLY-57] and orphan pixels [SLY-2].
2. **Imply scales, don't draw them.**
   - Put a few scale clusters along the shadow edge of the flank, denser at the terminator and fading toward the light [SAI][ARNE].
   - Leave the lit side clean so the texture is implied [SLY-2].
3. **One clear light, no pillow shading.**
   - Light comes from the front, side and top [ARNE].
   - Don't darken every edge [S11-4]. Build up value, then cut it off abruptly at the terminator [ARNE].
4. **Hue-shifted ramps.**
   - Shadows go cooler, highlights warmer [LOS-HUE].
   - Avoid ramps that run to pure black or white [ARNE] and long fully saturated ramps [ARNE].
   - Keep the palette restrained: about 16-24 colors for the whole hero.
5. **Selective outlines.**
   - The outline is darker than both the sprite and the background.
   - It is lighter on lit edges and black only where no light reaches [LOS-OUT].
   - Interior lines are one shade darker than the area around them [LOS-OUT].
   - Leave the outline off where a foot meets the ground [ARNE].
6. **Anti-alias sparingly.**
   - Use it only on long staircase steps, with the halftone length matching the step [S11-5].
   - If it hurts more than it helps, remove it [S11-5].
7. **Silhouette first.**
   - "Most failed dragon sprites are failed silhouettes" [SAI].
   - The silhouette in one flat color has to read as a powerful dragon before any shading goes on.
8. **Size.**
   - A dragon needs at least 64x64. Neck, wings and tail compete for pixels below that [SAI].
   - At 32x32 you must choose head or wings, so the token should be a head or bust, not the whole body.
9. **Perched first.** Draw the dragon perched with folded wings first, then the spread-wing version [SAI].
10. **Hand-placed.** "Each pixel is a decision" [S11-5]. Sprites will be authored as pixel maps and cleaned by hand, not generated from shape rules.

### 2.2 Anatomy: what we borrow from real animals

#### Skull (monitor lizard, crocodile)

- Build the head as a box for the cranium plus a tapered wedge for the snout [INST][TUTS].
- The Komodo skull is "a blunt pyramidal shape... tapering anteriorly" [KOMODO].
- Long jaws end behind the eye [DES].
- Nostrils sit at the tip of the snout [DES]. Darken only the deepest part of the nostril [MUU].

#### Eye (raptor, crocodile)

- The eye is small and set in a socket, under a brow ridge that overhangs it [TUTS][MUU][BROW].
- Pixel recipe:
  - The brow is a dark shelf, 1-2 pixels, running across the top of the eye.
  - The iris is a bright, saturated cluster (gold or amber).
  - The pupil is a dark vertical slit, 1 pixel wide.
  - There is no outline ring around the eye and no round white highlight.
- Lizard pupils are often round [DES]. A slit is a stylistic choice for menace; keep it 1 pixel.

#### Horns (ram, goat, antelope)

- Horns root at the back corner of the skull, behind and above the eye.
- They sweep back along the line of the head and neck, so they extend the silhouette rather than poking out of it.
- Each horn is widest at the root, tapers to a point, has a lit upper edge and a shadow lower edge, and may carry 2-3 ridge bands.
- The far horn is shorter and partly hidden [INST].

#### Neck and chest (bird of prey, horse)

- The neck is thick at the base and narrows to the head.
- The chest is deep, like a bird's keel, with pectoral mass under the wing roots [ANAT].
- This, more than anything else, fixes the "lean" read.

#### Wings (bat, pterosaur)

- The structure is a hand: an arm, an elbow, a free clawed thumb, and long fingers carrying the membrane [BAT][ANAT].
- The wing roots on the shoulder, not on the spine like a cape [ANAT].
- Shadow sits in the valleys between fingers. The membrane is thin, so keep shadows subtle unless the wing is folded [BAT].

#### Limbs and stance (lizard, big cat)

- The forelimbs attach just behind the neck, and the hind limbs before the tail [DES].
- Limbs are heavy, with clawed feet planted wide.
- The spine line runs from the snout through the back to the tail [DES].

### 2.3 Expression: grand, not silly

| Silly | Grand |
|---|---|
| Big round eye | Small, narrowed eye under a heavy brow |
| Round head, short muzzle | Long, blocky snout |
| Thin neck | Thick neck base and a deep chest |
| Identical spikes | Spikes and teeth of varied size in an organized rhythm [MUU] |
| Round white highlight | Lit by a clean rim on the upper edge of the form |
| Head raised like a puppy | Head lower than the shoulders, or level, gaze forward; for rearing, the chest leads |

## 3. Plan for the next studies

1. **One pose, one palette, hand-placed.** Draw a perched Warden on a 64x80 grid in the Ember palette.
   - Start with the silhouette and check it in a single flat color.
   - Then do the flat clusters, then the selective outline.
2. **A head study at 48x48** to prove the eye, brow and horns before anything else. It doubles as the profile portrait.
3. **Count and limit the palette:**
   - Body ramp: 5 tones.
   - Belly ramp: 4 tones.
   - Membrane ramp: 4 tones.
   - Horn and claw ramp: 3 tones.
   - Eye: 2 tones.
   - Outline: 2 tones.
   - Total: about 20.
4. Only after the owner approves the Ember version: palette swaps, the spread-wing pose and the token (a head bust at 32x32).

## Sources

| ID | Source |
|---|---|
| S11-4 | Saint11 (Pedro Medeiros), "Basic Shading": https://saint11.art/pixel_art_articles/article4/ |
| S11-5 | Saint11, "Anti-Alias and Banding": https://saint11.art/pixel_art_articles/article5/ |
| ARNE | Arne Niklas Jansson, Pixel Art Tutorial (androidarts): https://androidarts.com/pixtut/pixelart.htm |
| SLY-2 | Slynyrd, Pixelblog 2, "Texture": https://www.slynyrd.com/blog/2018/2/15/pixelblog-2-texture |
| SLY-57 | Slynyrd, Pixelblog 57, "Knights, Monsters & Castles": https://www.slynyrd.com/blog/2025/7/28/pixelblog-57-knights-monsters-amp-castles |
| SAI | Sprite AI, "Dragon pixel art": https://www.sprite-ai.art/gallery/dragons (practical, unattributed; used for the size floor and the scale band) |
| LOS-OUT | Lospec, "Pixel Art Outlines Part 2: Using Color": https://lospec.com/articles/pixel-art-outlines-part-2-using-color |
| LOS-HUE | Lospec, Endesga, "Hue Shifting" quick tip: https://lospec.com/pixel-art-tutorials/pixel-art-quicktip-hue-shifting-by-endesga |
| EYE | Community notes on small eyes: https://community.aseprite.org/t/i-cannot-figure-out-these-eyes/24563 and https://lr.us.psf.lt/r/PixelArt/comments/1l31gsz/how_do_these_sprites_read |
| MUU | Muusart, "Drawing a Dragon's Head": https://muusart.com/blog/drawing-a-dragons-head/ |
| TUTS | Envato Tuts+, "How to Draw a Realistic Dragon Head in 3D Space": https://design.tutsplus.com/articles/how-to-draw-a-realistic-dragon-head-in-3d-space--vector-14639 |
| SKB | Monika Zagrobelna, "How to Draw Dragons": https://monikazagrobelna.com/2019/08/31/sketchbook-original-how-to-draw-dragons/ |
| INST | Instructables, "How to Draw a Dragon Head": https://instructables.com/How-To-Draw-A-Dragon-Head |
| DES | Dessindigo, "Drawing a Lizard": https://dessindigo.com/en/blog/lizard-drawing |
| KOMODO | Skull morphology of the Komodo dragon (digital dissection): https://evolsyst.pensoft.net/article/121149/ |
| BROW | Supraorbital ridge (Wikipedia): https://en.wikipedia.org/wiki/Brow_ridge |
| ANAT | Dragon anatomy and wing-attachment notes, collected from general tutorials (low authority; used only for chest mass and wing rooting) |
| BAT | Bat-wing structure notes, collected from general tutorials (low authority; checked against bat-skeleton basics) |
| MV | Mega Voxels, "How to Make a Pixel Art Dragon": https://www.megavoxels.com/learn/how-to-make-a-pixel-art-dragon/ (flat fill, then one shadow and two highlights) |

## 4. Reference comparison: what reads "right" (2026-10-26)

The owner shared eight dragon portraits that look right and asked what separates them from head study V2 (the thick-neck version). V3, with an 8-pixel neck, read as emaciated, so thinness was not the answer. The reference figures below were measured by eye on the images and are approximate. The V2 figures come from the sprite grid.

| Trait | References | V2 |
|---|---|---|
| View | Mostly three-quarter: the top of the muzzle, both brow ridges and the far horns show | Pure side profile, which flattens the face into a crocodile outline |
| Eye position along the head | Near the middle; eye-to-snout is 0.4-1.3 times eye-to-back of skull | Back third; eye-to-snout is 1.7 times eye-to-back (20 px against 12) |
| Muzzle | Shorter than or equal to the cranium, tapering, with a clear step down from brow to muzzle | Long, even-depth box (12 px deep at mid-snout, 18 at the back), almost no step |
| Back of the head | The biggest mass: cranium, cheek and jaw muscle, frills | Small and low; the horn root is the only mass back there |
| Neck direction | Leaves the back corner of the jaw and runs down and back; the head is thrust forward of the chest | Throat runs down and forward under the face (13 px forward over 19 rows), so the head sits on a pedestal: the "pooch" |
| Neck width | About 0.8-1.0 times the head's height, kept along its length | 0.77 at mid-neck, but flaring to 1.4 at the frame edge (V3 was 0.4: too thin) |
| Head angle | Snout lower than the skull; one strong diagonal from snout tip to horn tips | Level |
| Crest | 3-7 horns and spikes fanning back from the brow and skull, plus cheek and neck spikes; a jagged silhouette | Two smooth horns and a few spines; a calm silhouette |
| Mouth line | Curves up toward the back and ends under or before the eye; often open with teeth | Straight, and runs past the eye, which reads as a lip or a duck bill |
| Eye contrast | A bright red, orange or yellow eye in a dark socket, the brightest point on the head | Gold on red, of medium contrast |
| Value | Dark overall, with bright accents (glow, gold trim, rim light); strong dark outline | Mid red throughout |

**Rules for V4:**
1. Three-quarter view, head tilted down.
2. Eye near the middle of the head.
3. A shorter, tapering muzzle with a brow step.
4. A big back of the head.
5. A neck as thick as V2 but leaning back from the jaw corner.
6. A fanned crest.
7. A curved mouth line, open or ajar.
8. A bright eye in a dark socket.
9. A darker overall value with accents.

## 5. V4 against the section 2 research (2026-10-26)

Version names: V1 is the procedural studies, made before this research. V2 (head study 1) is the first sprite built from section 2. V3 is the lean-neck variant. V4 is rebuilt from the eight reference portraits (section 4).

### What V4 keeps from the research

| Rule | V4 |
|---|---|
| Flat clusters, no texture, no dithering | Kept |
| One clear light, hue-shifted ramps, restrained palette | Upper-left light; shadows shift violet; 18 colors |
| Silhouette reads in one color | Passes |
| At least 64 px for a dragon | 64×64 |
| Skull as a box cranium plus a tapered snout | Kept, with the snout shortened |
| Nostril at the snout tip; only its deepest part dark | Kept |
| Raptor brow shelf over a small slit eye | Kept: a dark overhang, a 2-pixel slit, no white highlight |
| Horns root behind and above the eye, sweep back, taper, lit top and shadow underside, far horn smaller | Kept; ridge bands are minimal (3 pixels) |
| Teeth and spikes of varied size | Kept |

### Where the research steered wrong

| Research said | References show | Correction |
|---|---|---|
| Section 2.3: "long, blocky snout" reads grand; skull modeled on monitor lizard and crocodile | The eye sits near the middle of the head, and the muzzle is no longer than the cranium | The lizard skull gives the structure (cranium box, snout wedge, brow), not the proportions. For proportions, use a heavier, big-cat-like cranium with a lizard muzzle. |
| Section 2.2: horns as a single ram pair | A crest of 3-7 horns and spikes fanning back on one diagonal | The ram horn stays the model for one horn. The crest needs several, of varied length, rooted along the brow and skull. |
| Section 2.2: lizard jaws end behind the eye | The open mouth ends under or before the eye | Both hold: the jaw bone and muscle run behind the eye, but the mouth opening stops under it. V4 softens the seam behind the mouth corner to a hide shadow. |
| Nothing on view angle | Mostly three-quarter | Default to three-quarter for portraits; profile flattens the face. |
| Nothing on overall value | Dark overall, with bright accents | The darkest two hide tones cover most of the shadow side; the eye and fire are the brightest points. |
| Nothing on head carriage | The head is held forward of the chest, tilted down | The neck leaves the jaw corner down and back. |
| Section 2.1: no outline ring around the eye | Most references set the eye in a dark socket | A dark socket ring is fine; what reads badly is an outline-colored ring with a highlight boxed inside. |

### Research rules V4 does not apply yet

- **Imply scales:** a few scale clusters on the shadow side, denser at the terminator. V4 has none. The Skulldon and blue-gray references do this.
- **Selective outline:** the outline is mostly the darkest color. Only a few lit edges take the warmer outline.
- **Anti-aliasing on long curves:** none yet. The horn curves could use a few in-between pixels.
- **Chest, wings and limbs:** not tested, since this is a head study. The perched body will test the bird chest, bat wing and lizard stance.
