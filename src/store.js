/**
 * Minimal reactive state store — no external dependencies.
 *
 * createStore(initialState, options?) → { getState, setState, subscribe }
 *
 * setState accepts:
 *   - a partial state patch:      store.setState({ karma: 5 })
 *   - a functional updater:       store.setState(s => ({ karma: s.karma + 5 }))
 *
 * subscribe(listener) → unsubscribe function
 *   listener is called with the full next state on every change.
 *
 * Options:
 *   persistKey — localStorage key for automatic save/restore across page loads
 */
/**
 * Recursively merge `override` into `base`.
 * Plain objects are merged so that keys present only in `base` are preserved
 * (important when restoring an older persisted snapshot that lacks new fields).
 * @param {object} base
 * @param {object} override
 * @returns {object}
 */
const deepMerge = (base, override) => {
  const result = { ...base }
  for (const key of Object.keys(override)) {
    const bv = base[key]
    const ov = override[key]
    if (
      ov !== null &&
      typeof ov === 'object' &&
      !Array.isArray(ov) &&
      bv !== null &&
      typeof bv === 'object' &&
      !Array.isArray(bv)
    ) {
      result[key] = deepMerge(bv, ov)
    } else {
      result[key] = ov
    }
  }
  return result
}

export const createStore = (initialState, { persistKey } = {}) => {
  // Restore persisted state from localStorage when a persistKey is provided
  let persisted = null
  if (persistKey) {
    try {
      const raw = localStorage.getItem(persistKey)
      if (raw) persisted = JSON.parse(raw)
    } catch (_) { /* ignore corrupt / missing data */ }
  }

  // Deep-merge so that keys added to initialState after a save are still present
  let state = persisted
    ? deepMerge(JSON.parse(JSON.stringify(initialState)), persisted)
    : JSON.parse(JSON.stringify(initialState))

  const listeners = new Set()

  /** Return the current state snapshot (read-only reference). */
  const getState = () => state

  /**
   * Merge a patch or apply a functional updater, then notify all subscribers.
   * @param {object | ((state: object) => object)} updater
   */
  const setState = (updater) => {
    const patch = typeof updater === 'function' ? updater(state) : updater
    state = { ...state, ...patch }

    if (persistKey) {
      try { localStorage.setItem(persistKey, JSON.stringify(state)) } catch (_) {}
    }

    listeners.forEach(fn => fn(state))
  }

  /**
   * Subscribe to state changes.
   * @param {(state: object) => void} listener
   * @returns {() => void} unsubscribe function
   */
  const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return { getState, setState, subscribe }
}
