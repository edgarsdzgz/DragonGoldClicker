# Icon sheet 4: the last twelve interface icons (2026-10-26)

With these, every interface icon the game's screens show today has a pixel version. Grids are
written by `src/make_icons.py` into `src/icons.px`. Build: `python src/make_icons.py`, then
`python build.py`. Sheets: `preview/sheet_x6.png` (beside the official set) and `preview/close_x10.png`.

| Icon | Replaces Ionicon | The icon |
| --- | --- | --- |
| Next | arrow-forward | The Upgrade arrow turned to point right, same gold. |
| Unknown and help | help-circle | A gold question mark on a dusk-purple plate, in the family of the red Close plate. |
| Info | information-circle | A white i on a sea-blue plate, the same family. |
| Rising stores | trending-up | A green zigzag climbing to a solid arrowhead. |
| Falling stores | trending-down | The same line falling, in brick. Red stays for HP and danger. |
| Rank | ribbon | A gold medal hanging from a slate-blue ribbon (the army color from the Fighters shield). |
| Shield gear | shield-checkmark | A round wooden shield with a steel rim and boss, so it never reads as the Fighters' heater shield. |
| Claws | (hammer today) | Three curved slash marks. The nine tier icons stay for the tiers themselves. |
| Offline, rest | moon | A pale crescent moon with a star. |
| Wizard's Tower | sparkles | Lavender sparkles with white hearts, so it never borrows the gold of the Renown star. |
| Map | map | A three-fold map: a wood, a dotted path and an X. |
| Stats | stats-chart | Three bars climbing: sea, green and gold. |

Check warnings are single-pixel islands that are meant: the map's path dots, the medal's glint,
the small sparkles' hearts and a slash tip.
