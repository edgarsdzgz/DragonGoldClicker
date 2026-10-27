"""Export logo A (the claw-struck shield) as the app icon (owner, 2026-10-27: "A. For our icon logo and
our app icon button").

- app_icon_1024.png: the store and iOS icon, x16, opaque.
- app_adaptive_1024.png: Android's adaptive foreground. The icon at x10 sits in the middle of a canvas
  painted in its own background color, so whatever the launcher's mask, the edge is seamless and the
  shield stays inside the 66 dp safe circle.
- app_favicon_64.png: the web favicon at native size.

Run: python export_icons.py (after make_logo.py)
"""
from PIL import Image

from make_logo import OUT, P

icon = Image.open(OUT / "logo_shield_icon.png").convert("RGB")
icon.resize((1024, 1024), Image.NEAREST).save(OUT / "app_icon_1024.png")
fg = Image.new("RGB", (1024, 1024), P["night1"])
fg.paste(icon.resize((640, 640), Image.NEAREST), (192, 192))
fg.save(OUT / "app_adaptive_1024.png")
icon.save(OUT / "app_favicon_64.png")
print("exported")
