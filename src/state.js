/**
 * Global game state for Тanya Grotter: Magic Contrabass.
 *
 * karma      — alignment  -100 (dark) … +100 (light)
 * division   — 'light' | 'dark' | 'mixed'
 * currentAct — 1..5
 * emotion    — current Tanya emotion: 'neutral'|'sad'|'angry'|'determined'|'proud'
 * questFlags — per-quest outcome: 'good'|'cunning'|'neutral'|null (incomplete)
 */
export const state = {
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

  /** Clamp karma to [-100, 100] and recalculate division. */
  addKarma(delta) {
    state.karma = Math.max(-100, Math.min(100, state.karma + delta))
    state._updateDivision()
  },

  /** Set a quest outcome flag. */
  setQuestFlag(quest, outcome) {
    if (Object.hasOwn(state.questFlags, quest)) {
      state.questFlags[quest] = outcome
    }
  },

  /** Set Tanya's current emotion. */
  setEmotion(emotion) {
    state.emotion = emotion
  },

  /** Advance to next act (1→5). */
  nextAct() {
    if (state.currentAct < 5) state.currentAct++
  },

  /** Recalculate division based on karma thresholds. */
  _updateDivision() {
    if (state.karma >= 30) {
      state.division = 'light'
    } else if (state.karma <= -30) {
      state.division = 'dark'
    } else {
      state.division = 'mixed'
    }
  },
}
