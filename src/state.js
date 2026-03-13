export const state = {
  karma: 0,
  floor: 1,
  quests: {
    bassFound: false,
    libraryKey: false,
    dragonTamed: false,
    mirrorBroken: false,
  },
  addKarma: (delta) => {
    state.karma = Math.max(-100, Math.min(100, state.karma + delta))
  },
}
