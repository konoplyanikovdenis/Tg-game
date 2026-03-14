/**
 * Act manager — bootstraps the correct act based on state.currentAct
 * and wires act-to-act transitions.
 *
 * Usage:
 *   const actManager = createActManager(scene)
 *   actManager.start()   // starts from state.currentAct
 *   actManager.reset()   // resets state to Act 1 and restarts
 */
import { initAct1 } from '@/acts/act1.js'
import { initAct2 } from '@/acts/act2.js'
import { initAct3 } from '@/acts/act3.js'
import { initAct4 } from '@/acts/act4.js'
import { initAct5 } from '@/acts/act5.js'
import { state } from '@/state.js'
import { say } from '@/tanya.js'
import { syncDivision } from '@/division.js'

const ACT_INIT = [null, initAct1, initAct2, initAct3, initAct4, initAct5]

/**
 * @param {BABYLON.Scene} scene
 * @returns {{ start: () => void, reset: () => void }}
 */
export const createActManager = (scene) => {
  let currentDispose = null

  const transition = (nextActNumber) => {
    // Teardown previous act
    if (currentDispose) {
      currentDispose()
      currentDispose = null
    }

    // Sync visual theme
    syncDivision()

    // Say act title
    const titles = {
      1: 'Акт 1: Москва, квартира Дурневых',
      2: 'Акт 2: Прибытие в Тибидохс',
      3: 'Акт 3: Школьная жизнь',
      4: 'Акт 4: Угроза Тибидохсу',
      5: 'Акт 5: Безымянный Подвал',
    }
    if (titles[nextActNumber]) say(titles[nextActNumber], 5000)

    const initFn = ACT_INIT[nextActNumber]
    if (!initFn) return

    let result
    if (nextActNumber === 5) {
      result = initFn(scene, reset)
    } else {
      result = initFn(scene, transition)
    }
    currentDispose = result?.dispose ?? null
  }

  const start = () => transition(state.currentAct)

  const reset = () => {
    // Reset game state
    state.karma      = 0
    state.division   = 'light'
    state.currentAct = 1
    state.emotion    = 'neutral'
    Object.keys(state.questFlags).forEach(k => { state.questFlags[k] = null })
    syncDivision()
    start()
  }

  return { start, reset }
}
