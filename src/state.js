/**
 * Game state store for Тanya Grotter: Magic Contrabass.
 *
 * Built on top of the reactive createStore factory.
 *
 * Exports:
 *   store       — raw store ({ getState, setState, subscribe })
 *   state       — backward-compatible proxy (same property/method API as before)
 *   resetState  — reset all game state back to initial values
 *
 * State shape:
 *   karma      — alignment  -100 (dark) … +100 (light)
 *   division   — 'light' | 'dark' | 'mixed'
 *   currentAct — 1..5
 *   emotion    — 'neutral'|'sad'|'angry'|'determined'|'proud'
 *   questFlags — per-quest outcome: 'good'|'cunning'|'neutral'|null (incomplete)
 */
import { createStore } from '@/store.js'

const INITIAL_STATE = {
  karma: 0,
  division: 'light',
  currentAct: 1,
  emotion: 'neutral',
  questFlags: {
    bassFound: null,
    libraryKey: null,
    dragonTamed: null,
    mirrorBroken: null,
    oathTaken: null,
    prophesyRead: null,
    hairOfDrednir: null,
    finalPuzzle: null,
  },
}

/** Raw reactive store — use store.subscribe() to react to any state change. */
export const store = createStore(INITIAL_STATE, { persistKey: 'tg-game-state' })

// ── Helper ────────────────────────────────────────────────────────────────────

const _division = (karma) => {
  if (karma >= 30)  return 'light'
  if (karma <= -30) return 'dark'
  return 'mixed'
}

// ── State mutation methods ────────────────────────────────────────────────────

const methods = {
  /** Clamp karma to [-100, 100] and recalculate division. */
  addKarma(delta) {
    store.setState(s => {
      const karma = Math.max(-100, Math.min(100, s.karma + delta))
      return { karma, division: _division(karma) }
    })
  },

  /** Set a quest outcome flag. */
  setQuestFlag(quest, outcome) {
    store.setState(s => {
      if (!Object.hasOwn(s.questFlags, quest)) {
        console.warn(`[state] setQuestFlag: unknown quest "${quest}"`)
        return {}
      }
      return { questFlags: { ...s.questFlags, [quest]: outcome } }
    })
  },

  /** Set Tanya's current emotion. */
  setEmotion(emotion) {
    store.setState({ emotion })
  },

  /** Advance to next act (1→5). */
  nextAct() {
    store.setState(s => s.currentAct < 5 ? { currentAct: s.currentAct + 1 } : {})
  },

  /** Recalculate division based on karma thresholds (kept for backward compat). */
  _updateDivision() {
    store.setState(s => ({ division: _division(s.karma) }))
  },
}

/**
 * Backward-compatible reactive proxy.
 * Read state properties directly (state.karma, state.questFlags, …)
 * or call mutation methods (state.addKarma, state.setQuestFlag, …).
 * Direct property assignment also routes through the store.
 */
export const state = new Proxy(methods, {
  get(target, prop) {
    if (prop in target) return target[prop]
    return store.getState()[prop]
  },
  set(_, prop, value) {
    store.setState({ [prop]: value })
    return true
  },
})

/**
 * Reset all game state back to initial values (start new game).
 * Also clears localStorage persistence so the reset survives a page reload.
 */
export const resetState = () => {
  store.setState(JSON.parse(JSON.stringify(INITIAL_STATE)))
  try { localStorage.removeItem('tg-game-state') } catch (_) {}
}
