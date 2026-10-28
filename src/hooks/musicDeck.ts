import type { MusicPlan, TrackId } from '../data/music'
import { crossfade } from './crossfade'
import type { FadingPlayer } from './crossfade'

/** What the deck needs of a player (expo-audio's AudioPlayer has these) */
export interface DeckPlayer extends FadingPlayer {
  loop: boolean
  currentTime: number
  duration: number
  seekTo(seconds: number): unknown
}

/** A track this close to its end counts as played out, and starts again from the top */
const AT_END_SEC = 0.5

/**
 * Plays music plans (data/music.ts, musicPlan): a new plan fades in over the last; a track left
 * behind pauses where it was, so coming back picks it up there. Two tracks that take turns play
 * each to its end, then the other from the top. A track played once tells `onceDone`, so the music
 * under it can come back.
 */
export class MusicDeck {
  private playing: TrackId | null = null
  private plan: MusicPlan | null = null
  /** Which of a plan's tracks is up, by plan key */
  private readonly turn = new Map<string, number>()
  /** Plan keys already started, so a fight or scene starts from the top only once */
  private readonly started = new Set<string>()
  private cancelFade: () => void = () => {}

  constructor(
    private readonly player: (id: TrackId) => DeckPlayer,
    private readonly volume: () => number,
    private readonly onceDone: (plan: MusicPlan) => void,
  ) {}

  /** The track playing (or fading in) */
  get track(): TrackId | null {
    return this.playing
  }

  show(plan: MusicPlan): void {
    if (this.plan?.key === plan.key) return
    this.plan = plan
    let turn = this.turn.get(plan.key) ?? 0
    // A pair track that ended while it faded out has had its turn: the other one is up, from the top
    const handOver = plan.mode === 'turns' && this.playedOut(this.player(plan.tracks[turn % plan.tracks.length]))
    if (handOver) {
      turn += 1
      this.turn.set(plan.key, turn)
    }
    const id = plan.tracks[turn % plan.tracks.length]
    const p = this.player(id)
    p.loop = plan.mode === 'loop'
    if (handOver || (plan.fromTop && !this.started.has(plan.key)) || (this.playedOut(p) && !p.loop)) p.seekTo(0)
    this.started.add(plan.key)
    this.fadeTo(id)
  }

  /** Make a track's player now, so its first play starts on time */
  warm(ids: readonly TrackId[]): void {
    ids.forEach((id) => this.player(id))
  }

  private playedOut(p: DeckPlayer): boolean {
    return p.duration > 0 && p.currentTime >= p.duration - AT_END_SEC
  }

  /** A track played to its end (a looping one never does) */
  ended(id: TrackId): void {
    const plan = this.plan
    if (!plan || id !== this.playing) return
    if (plan.mode === 'once') return this.onceDone(plan)
    if (plan.mode !== 'turns') return
    const next = ((this.turn.get(plan.key) ?? 0) + 1) % plan.tracks.length
    this.turn.set(plan.key, next)
    const nextId = plan.tracks[next]
    const p = this.player(nextId)
    p.loop = false
    p.seekTo(0)
    this.cancelFade()
    this.playing = nextId
    p.volume = this.volume()
    p.play()
  }

  /** End any fade at once (the deck is going away) */
  stop(): void {
    this.cancelFade()
  }

  private fadeTo(id: TrackId): void {
    this.cancelFade()
    const from = this.playing
    this.playing = id
    if (from === id) {
      const p = this.player(id)
      p.volume = this.volume()
      p.play()
      this.cancelFade = () => {}
      return
    }
    this.cancelFade = crossfade(this.player(id), from ? this.player(from) : null, this.volume)
  }
}
