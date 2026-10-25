# Number Shrink -- Divide All Values by 20

**Date:** 2026-03-09
**Status:** PLANNED
**Ratio:** 1/20 (old 1 insp/click -> new 0.05 insp/click)

---

## Overview

Shrink all game numbers by a factor of 20. The hero number (inspiration) starts at 0.00 and grows in small increments. Each slay earns 0.05 insp. First rally costs 1.00 insp. Soldiers produce 0.05 insp/sec.

This changes the feel from "big integer clicker" to "small decimal progression" where every tenth of a point matters.

---

## Display Changes

- Inspiration display: show 2 decimal places (0.00 format)
- Remove K/M/B formatting until numbers actually reach those thresholds
- `formatNumber()` may need a decimal mode for small values

---

## Constants to Update (divide by 20)

### Click & Income
| Constant | Old | New |
|----------|-----|-----|
| Click power (base) | 1 | 0.05 |
| Fighter insp rate | 0.25/sec | 0.05/sec (user specified) |
| Conscript baseRate | 0.25/sec | 0.0125/sec |
| Footman baseRate | 0.75/sec | 0.0375/sec |
| Knight baseRate | 2.0/sec | 0.10/sec |

### Soldier Costs
| Constant | Old | New |
|----------|-----|-----|
| Rally (first fighter) | 20 | 1.00 (user specified) |
| Conscript baseCost | 5 | 0.25 |
| Footman baseCost | 15 | 0.75 |
| Knight baseCost | 40 | 2.00 |

### Fighter/Repairer Costs
| Constant | Old | New |
|----------|-----|-----|
| FIGHTER_BASE_COST | 20 | 1.00 |
| REPAIRER_BASE_COST | 15 | 0.75 |

### Barracks Levels
| Level | Old Cost | New Cost |
|-------|----------|----------|
| 1 | 25 | 1.25 |
| 2 | 150 | 7.50 |
| 3 | 400 | 20.00 |
| 4 | 800 | 40.00 |
| 5 | 1500 | 75.00 |

### Forager Costs
| Constant | Old | New |
|----------|-----|-----|
| Gatherer baseCost | 5 | 0.25 |
| Trapper baseCost | 15 | 0.75 |
| Ranger baseCost | 40 | 2.00 |

### Forager Lodge Levels
| Level | Old Cost | New Cost |
|-------|----------|----------|
| 1 | 40 | 2.00 |
| 2 | 120 | 6.00 |
| 3 | 350 | 17.50 |
| 4 | 700 | 35.00 |
| 5 | 1200 | 60.00 |

### Buildings
| Building | Old Cost | New Cost |
|----------|----------|----------|
| DRACONIA_HALL_COST | 150 | 7.50 |
| LIBRARIUM_COST | 750 | 37.50 |
| ARMORY_COST | 100 | 5.00 |

### Armory Items
| Constant | Old | New |
|----------|-----|-----|
| SWORD_COST | 15 | 0.75 |
| SHIELD_COST | 20 | 1.00 |
| SWORD_BONUS | 0.1/sec | 0.005/sec |
| SHIELD_BONUS | 0.05/sec | 0.0025/sec |
| War Hammer cost | 500 | 25.00 |
| War Hammer click power | +1 | +0.05 |

### Explorer Costs
| Constant | Old | New |
|----------|-----|-----|
| EXPLORER_COST | 30 | 1.50 |
| EXPEDITION_INSPIRATION_COST | 50 | 2.50 |

### Explorer Post Levels
| Level | Old Cost | New Cost |
|-------|----------|----------|
| 1 | 200 | 10.00 |
| 2 | 600 | 30.00 |
| 3 | 1200 | 60.00 |

### Research Costs
| Research | Old | New |
|----------|-----|-----|
| Keen Eye | 300 | 15.00 |
| Efficient Patrols | 500 | 25.00 |
| Golden Harvest | 1000 | 50.00 |
| Drill Tactics | 400 | 20.00 |
| Tempered Steel | 600 | 30.00 |
| Veteran Training | 1200 | 60.00 |
| Rationing | 350 | 17.50 |
| Herbalist Knowledge | 500 | 25.00 |
| Frontier Settlement | 1500 | 75.00 |
| Cartography | 400 | 20.00 |
| Keen Scouts | 800 | 40.00 |
| Ancient Texts | 2000 | 100.00 |
| Dragon Lore | 3000 | 150.00 |

### Research Click Power Bonuses
| Research | Old | New |
|----------|-----|-----|
| Keen Eye | +1 click power | +0.05 |
| Ancient Texts | +2 click power | +0.10 |
| Herbalist | +2 forage power | +0.10 forage power |

### Milestone Thresholds (totalInspirationEarned)
| Old | New |
|-----|-----|
| 500 | 25.00 |
| 1000 | 50.00 |
| 2500 | 125.00 |
| 3500 | 175.00 |

### Threat Milestones
| Old Threshold | New Threshold |
|---------------|---------------|
| 200 | 10.00 |
| 750 | 37.50 |
| 1500 | 75.00 |
| 3000 | 150.00 |
| 5000 | 250.00 |

### Offline Upgrade Costs
| Level | Old Cost | New Cost |
|-------|----------|----------|
| 1 | 500 | 25.00 |
| 2 | 2000 | 100.00 |
| 3 | 5000 | 250.00 |
| 4 | 8000 | 400.00 |

### Wanderers
| Constant | Old | New |
|----------|-----|-----|
| WANDERER_MIN_REFUND | 5 | 0.25 |

### Starting Values
| Constant | Old | New | Notes |
|----------|-----|-----|-------|
| Starting inspiration | 0 | 0.00 | No change |
| STARTING_FOOD | 200 | 200 | Keep -- food is separate system |
| STARTING_VILLAGERS | 25 | 25 | Keep -- villagers are separate |

---

## Files to Modify

1. `src/types/soldiers.ts` -- soldier tiers, barracks levels, armory costs
2. `src/types/fighters.ts` -- fighter/repairer costs and rates
3. `src/types/foragers.ts` -- forager tiers, lodge levels
4. `src/types/explorers.ts` -- explorer costs, post levels
5. `src/types/research.ts` -- all research costs and click power bonuses
6. `src/types/state.ts` -- offline upgrade costs, DRACONIA_HALL_COST, LIBRARIUM_COST
7. `src/types/siege.ts` -- threat milestones
8. `src/types/milestones.ts` -- milestone thresholds
9. `src/types/wanderers.ts` -- WANDERER_MIN_REFUND
10. `src/context/GameContext.tsx` -- base clickPower (1 -> 0.05)
11. `src/screens/GameScreen.tsx` -- display formatting for small decimals
12. `src/components/ResourceBar.tsx` -- display formatting
13. `src/utils/formatNumber.ts` (or wherever formatting lives) -- decimal display mode

---

## Things NOT to Change (non-inspiration systems)
- Food values (starting food, food consumption rates, food per forage click)
- Villager counts
- Starvation chances
- City HP (100 max)
- Siege damage/repair rates (HP-based, not inspiration)
- Expedition duration (seconds)
- Wanderer chances and cooldowns
- Cost curve exponents (1.15, 1.4) -- keep the same
- Food consumption per food check -- keep the same

---

## Migration
- Need save migration: multiply existing `inspiration` by 1/20
- Multiply `totalInspirationEarned` and `totalInspirationSpent` by 1/20
- `milestonesOffered` thresholds need remapping

---

## Open Questions
- Should food costs also shrink or stay separate? (Leaning: keep food separate)
- Do forager food rates (0.2/0.6/1.5 food/sec) change? (Leaning: no, food is independent)
- Display precision: always 2 decimals, or adaptive? (Leaning: 2 decimals until 1000+)
