# The heartstone

The protagonist's pendant as an item icon. From the lore's Arcana Pendants (dragonIdler
`docs/Draconia_Lore_Compendium.md`): aetherglass holding a droplet of the wearer's heart-flame, in
silver-gold filigree. Four shapes (teardrop, round, diamond, heart), each at 12x12 and 16x16.

- `src/make_heartstone.py` draws them into `out/` (x8 previews in `preview/`).
- `build_board.py`: the review board, each shape among the locked icons and on an item card.

Run: `python src/make_heartstone.py && python build_board.py`

v2 (owner: "The flame could really just be a glowing pulse, instead of a literal flame"): a white-gold core
glowing in the glass, still icons plus a 4-frame pulse (`*_pulse_strip4.png`, GIFs in `preview/`).
Board `board_v2.html`. v1, the literal flame: `src/make_heartstone_v1.py`, `out/*_v1.png`, `board.html`
and `board_v1.html` (https://claude.ai/artifact/UWjF2krrYaAAyBKgwoTBVT).
