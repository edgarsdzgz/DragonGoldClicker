import sys

rows = [
    ("profile", "Profile modal", "Pale-cyan modal with blue header, avatar with level badge, power chip, gear tabs, hex gear slots around the hero, round utility icons, square X close below"),
    ("settings", "Settings", "Same modal template: sliders, checkbox FPS options, blue language pill, version text"),
    ("guild-hub", "Guild town", "Painted floating castle town; buildings labelled with dark plates (Guild Boss, Member Lobby, Guild Shop, Supply Shop, Guild Tasks); rank badge top right"),
    ("guild-tasks", "Guild tasks", "Milestone chest track (9 points, chests at 2/5/8); task rows with progress bars, blue Go Now, green ticks when complete"),
    ("guild-bargain", "Guild bargain", "Merchant character over a purple crest-shaped panel; struck-out price 300 with a 161 burst; grey Purchased button; member list with pink price chips"),
    ("guild-members", "Guild members", "Cream rows: hex-framed avatars, power chips, Online in green or minutes ago, Leader tag; blue Request List button"),
    ("guild-boss", "Guild boss", "Boss art on a purple vortex, Void Storm name plate, today's ranking card, buff and stack lines, yellow Raid button with ticket cost"),
    ("boss-chest", "Boss chest", "Chest art over a damage log (names with damage in coloured text), Total Rewards divider with diamond ends, yellow Claim"),
    ("reward-reveal", "Reward reveal", "Wavy pale ribbon band across a dimmed screen, gold outlined 'Congrats! You obtained', rarity tiles with counts, confetti, Tap to Close"),
    ("messages", "Messages", "Side tab rail (PM, Friends, Guild, Recruit) with labels; cream message rows with hex avatars and green timestamps"),
    ("friends", "Friends", "Friend rows with heart counts, yellow Send Gift buttons, grey disabled Send All, yellow Claim Gifts with '!'"),
    ("recruit", "Recruit channel", "Chat bubbles with guild crest cards and yellow Join buttons; 'Left Today: 10'"),
    ("event-7day-d7", "7-day event", "Giant '7' display numeral, chest and hero header art, point track with ticks to 730, numbered day column, task rows with blue Go Now"),
    ("event-7day-d1", "7-day event day 1", "Completed task rows dimmed with green ticks; current day number highlighted gold"),
    ("event-7day-d2", "7-day event day 2", "As day 1 with day 2 highlighted"),
    ("event-7day-d3", "7-day event day 3", "As day 1 with day 3 highlighted"),
    ("shop-gear-chest", "Shop: gear chest", "Pixel awning top; currency chips; Stage Pack card with a 'Great Value 500%' burst; Gear Chest banner art with a huge 3D 'S'; blue Draw 1x and yellow Draw 10x with key costs; sub-tabs above the main bar"),
    ("shop-sojourn-chest", "Shop: sojourn chest", "Chest card with Lv.3 XP bar, item tiles with '?' unknowns, blue Draw 1x / yellow Draw 7x"),
    ("shop-daily", "Shop: daily", "Lavender section bar with diamond ends; item cards whose price band is coloured by currency; 'Sold Out' diamond stamps on darkened cards; '20% OFF' stickers; green Refresh button with cost"),
    ("shop-reward-reveal", "Shop reward reveal", "Same ribbon reveal template over the shop: single coin tile x1000, confetti"),
    ("shop-gems-gold", "Shop: gems and gold", "Cream-gold product cards; art scales with pack size (gem, pile, sack, crate, chest); 'Bonus' stickers; price band at the base"),
    ("summon-flash", "Summon transition", "Motion frame: a golden light slash and sparks through smoke (a moment from an animation)"),
    ("pet-summon", "Pet summon", "Isometric floating-island scene with a stone summon dais; title on a translucent dark band; Lv.2 XP bar; blue Summon / yellow Summon 10; Skip checkbox"),
    ("asterite-summon", "Asterite summon", "Hooded figure under a crescent halo with blue light wings on a starfield; 'Draw 15x more for Rare Asterite' with the number large; banner cards with a glowing selected frame"),
    ("thunder-god-cutin-1", "Hero cut-in", "Painted full-screen animation frame: hero wreathed in gold lightning (not pixel art)"),
    ("thunder-god-cutin-2", "Hero cut-in", "Pixel-art hero on a rock with a spiked gold halo and a swirling cloud sky"),
    ("thunder-god-offer", "Hero offer", "Huge outlined gold display name 'Thunder God', 3-star unlock row, skill hexes with labels, yellow price button, inset preview video of the skill in battle"),
    ("brilliant-exchange", "Exchange shop", "Sunburst header with a chest of treasure; product cards with coloured frames (red ornate for limited), limit counters, Sold Out stamp, refresh timer in green"),
    ("gear", "Gear screen", "Hero on a rock over a sky; six gear hexes with Lv labels, rank 'S' letters and pip badges, green up arrow on an upgradable slot; stat chips; padlocked Mount; rarity-tinted item grid"),
    ("daily-selected", "Daily packs", "Pack cards with coloured header bars per tier, 'Great Value' stickers, grey Sold Out buttons, yellow price buttons, two-tab switch at the bottom"),
    ("gear-detail", "Gear detail", "Purple header for Epic, rarity pill 'Epic+1', item tile with type and pip badges, level field, flavour text, coloured skill lines with icons, have/need costs (green), blue Unequip and yellow Level Up / Max Level Up"),
    ("gear-levelup", "Gear level-up", "Power toast across the modal '21.7K' with a green up arrow '24'; changed stat row highlighted; scroll cost '2/100' in red; Level Up buttons greyed out"),
    ("curios-fountain", "Curios", "Cathedral with stained glass and an angel statue pouring water; curios on stone shelves joined by waterfalls; Lv plates with name and stat chips; Resonance and Salvage buttons"),
    ("curio-detail", "Curio detail", "Blue header modal, Rare pill, stat rows, 'Select' divider with diamond-link ends, selected tile with gold frame and 'Equipped' label, grey Equipped button"),
    ("blessing-before", "Blessing", "Before / After panels with an arrow between, Special Effect tag with padlock, grey disabled Replace, yellow Blessing with cost"),
    ("salvage", "Salvage", "Filter dropdowns, item grid with green tick badges on selected items, yield tiles, yellow Salvage"),
    ("fuse-selected", "Forge: fuse selected", "Pixel forge with fire arch, anvil and hammer; slots with '+'; Max Level 80 -> 100 and Max HP 1120 -> 1720 in green; ineligible gear padlocked"),
    ("blessing-after", "Blessing result", "After panel filled; improved value green with an up arrow; Replace now enabled in blue"),
    ("fuse-empty", "Forge: empty", "'Select gear to fuse!' on a dark band over the forge; empty slot outlined"),
    ("curios-locked-toast", "Locked toast", "Dark band toast across the screen: 'Unlocked when equipped with 1 legendary treasures.'"),
    ("hero-frost-princess", "Hero", "Throne hall with a red carpet dais; gold outlined name, star row, stat chips, skill hexes with labels, blue Unequip / yellow Star Up with '0/1' shard cost in red; gold-framed hero card, '?' card back"),
    ("hero-winter-lord", "Hero", "As above; locked hero card shown dark red with a padlock; side filter rail with portrait tabs"),
    ("accessory", "Accessory", "Meadow scene with a glowing platform; stat bar; event source text; yellow Equip; cream lower panel with an ornament divider; selected item marked by gold corner brackets and a padlock"),
    ("talents", "Talents", "Hex grid tinted gold / purple / cyan by tier, Lv labels, grey '?' hex for unknown, yellow Card Draw button with costs (shortfall in red)"),
    ("asterite-board", "Asterite", "Constellation badges on ribbons over a night sky; preset dropdown; stat strip; rarity-tinted gem grid"),
    ("talent-detail", "Talent detail", "Tapped hex zooms large over a dimmed grid with left/right arrows and its effect '2-Pip ATK +6'"),
    ("pets", "Pets", "Pets on mossy stone pedestals with paw glow; 'Total Level: 33' in big yellow numerals; stat strip; Deployed tags; level and XP bars; locked pets dark red with padlocks"),
    ("pet-haven", "Pet Haven", "Painted cottage as the header; outlined 'Lv.3 Pet Haven' title; Venture Shop and a Friends signpost; scroll-shaped venture strips with pets walking toward a chest; locked strip with padlock and reason"),
    ("venture-assign", "Venture assign", "Scroll strip with pets placed, bouncing green arrow on the next slot, timers, blue Normal / yellow Advanced Venture with ticket costs"),
    ("venture-empty", "Venture empty", "Empty hex slots with green '+' inside the scroll strip"),
    ("venture-reward", "Venture reward", "Same ribbon reveal template: five rarity tiles with counts"),
    ("pet-haven-running", "Ventures running", "Timer bars '04:21:53' on each strip with blue Speed Up; green up-arrow badge on the cottage meaning an upgrade is ready"),
    ("pet-haven-upgrade", "Building upgrade", "Modal with the building art breaking the header edge; 'Lv.3 -> Lv.4' with green arrows; before -> after rows per stat (new values green); cost 2048/2000; yellow Upgrade with a 6h timer"),
    ("venture-shop", "Venture shop", "Arched shop frame with sparkle finials; exchange cards with currency price bands; Sold Out stamp with refresh timer; 'Embark on ventures to earn' hint"),
]

path = sys.argv[1]
src = open(path, encoding="utf-8").read()
if "| OWN-PROFILE |" in src:
    sys.exit("already added")
lines = [f"| OWN-{k.upper()} | Dicero | {t} | `owner-screenshots/dicero-{k}.png` | {d} |" for k, t, d in rows]
anchor = next(l for l in src.splitlines() if l.startswith("| OWN-TITLE |"))
src = src.replace(anchor, anchor + "\n" + "\n".join(lines))
open(path, "w", encoding="utf-8", newline="\n").write(src)
print(len(rows), "rows added")
