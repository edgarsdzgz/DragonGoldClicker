/**
 * The stock pack's interface ticks (taps, slides, purchases), kept until the owner says otherwise.
 * The game's own event sounds are in data/sounds.ts.
 */
export const SFX = {
  COIN: require('../../assets/music/out/coin_01.m4a'),
  ALERT: require('../../assets/music/out/notes_four_UP_01.m4a'),
  DECLINE: require('../../assets/music/out/notes_two_DOWN_06.m4a'),
  ALERT_SOFT: require('../../assets/music/out/chord_ripple_UP_02.m4a'),
  CONGRATS: require('../../assets/music/out/chord_ripple_UP_01.m4a'),
  CONFIRM: require('../../assets/music/out/notes_one_08.m4a'),
  PURCHASE: require('../../assets/music/out/notes_two_UP_04.m4a'),
  NPC: require('../../assets/music/out/RingRIng_01.m4a'),
  TAP: require('../../assets/music/out/tap_01.m4a'),
  SHOP: require('../../assets/music/out/bing_02.m4a'),
  SLIDE_UP: require('../../assets/music/out/slide_UP_01.m4a'),
  SLIDE_DOWN: require('../../assets/music/out/slide_DOWN_01.m4a'),
  CANCEL: require('../../assets/music/out/cancel_01.m4a'),
  CLICK: require('../../assets/music/out/click_01.m4a'),
  NO_GOLD: require('../../assets/music/out/dissonant_03.m4a'),
} as const

/**
 * The claw's swing below the Ember tier. The stock wall hits are gone: sfx_wall-hit is a monster's
 * blow on the wall now (data/sounds.ts).
 */
export const SFX_WEAPON_POOL = [
  require('../../assets/music/out/WEAPON_HIT_WOOD_001.m4a'),
  require('../../assets/music/out/WEAPON_HIT_WOOD_002.m4a'),
  require('../../assets/music/out/WEAPON_HIT_WOOD_003.m4a'),
  require('../../assets/music/out/WEAPON_HIT_WOOD_004.m4a'),
  require('../../assets/music/out/WEAPON_SWING_001.m4a'),
  require('../../assets/music/out/WEAPON_SWING_002.m4a'),
  require('../../assets/music/out/WEAPON_SWING_003.m4a'),
  require('../../assets/music/out/WEAPON_SWING_004.m4a'),
  require('../../assets/music/out/WEAPON_SWING_005.m4a'),
] as const

/** Pool of harvest/gathering sounds for the FORAGE orb. */
export const SFX_HARVEST_POOL = [
  require('../../assets/music/out/harvest_chop_01.m4a'),
  require('../../assets/music/out/harvest_chop_02.m4a'),
  require('../../assets/music/out/harvest_chop_03.m4a'),
  require('../../assets/music/out/harvest_saw.m4a'),
  require('../../assets/music/out/harvest_vegetable_01.m4a'),
  require('../../assets/music/out/harvest_vegetable_02.m4a'),
] as const
