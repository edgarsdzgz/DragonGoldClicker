// =============================================================================
// WAVE MODE -- COLD STORAGE (owner ruling, 2026-10-26)
// =============================================================================
// The main game put waves away: one monster always stands at the gate, and fighters chip at it
// (layer 2e in _dev/planning/core-tap.md). Waves will come back as a side mode, so the wave
// rules and screens are kept here, unused by the main game. They still compile and their tests
// still run, so they cannot rot while they wait.
//
// What is here: the wave rules (waves.ts), the wave strike, camp and wave views (waveStrike.ts),
// and the camp, banner, queue and wave-row components. The save keeps waveNumber, waveKills and
// waveActive for this mode. To bring it back, give the mode its own screen built from these.
//
// Live code that still imports from here: the save migrations (old saves were made with waves).
//
// When bringing waves back: food events (types/foodEvents.ts) can put a raider at the gate.
// waveStrike keeps the monster type until a wave clears, so it must re-pick after a raider (or
// raids must wait while a wave is on), and decide whether a raider kill counts toward the wave.

export * from './waves'
export * from './waveStrike'
export { EnemyCamp } from './EnemyCamp'
export { WaveBanner } from './WaveBanner'
export { MonsterQueue } from './MonsterQueue'
export { WaveRow } from './WaveRow'
