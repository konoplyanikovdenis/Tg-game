/**
 * Act 1 — Пролог: Москва, квартира Дурневых (~10–20 мин)
 *
 * Scenes:
 *  1. Унижения от Пипы и Дурневых
 *  2. Открытие футляра контрабаса (BassCase puzzle)
 *  3. Превращение дяди Германа в кролика Сюсюкалку
 *  4. Первый полёт на контрабасе → портал в Тибидохс
 *
 * Emotions: angry → surprised → delighted
 */
import { MeshBuilder, StandardMaterial, Color3, Vector3, HemisphericLight, PointLight } from '@babylonjs/core'
import { BassCase } from '@/puzzles/bassCase.js'
import { say } from '@/tanya.js'
import { showEmotion } from '@/emotions.js'
import { state } from '@/state.js'

/**
 * @param {BABYLON.Scene} scene
 * @param {(nextAct: number) => void} onComplete — callback to transition to Act 2
 */
export const initAct1 = (scene, onComplete) => {
  // ── Lighting — dingy apartment ────────────────────────────────────────────
  const ambientLight = new HemisphericLight('act1Ambient', new Vector3(0, 1, 0), scene)
  ambientLight.intensity  = 0.4
  ambientLight.diffuse    = new Color3(0.7, 0.6, 0.5)

  // ── Ground — worn parquet ─────────────────────────────────────────────────
  const floor = MeshBuilder.CreateGround('act1Floor', { width: 20, height: 20 }, scene)
  const floorMat = new StandardMaterial('act1FloorMat', scene)
  floorMat.diffuseColor = new Color3(0.28, 0.20, 0.12)
  floor.material = floorMat

  // ── Bass case in the centre of the room ───────────────────────────────────
  const bassCase = new BassCase()
  bassCase.init(scene)

  // ── Mysterious glow above the case ────────────────────────────────────────
  const glowLight = new PointLight('caseGlow', new Vector3(0, 1.2, 0), scene)
  glowLight.diffuse    = new Color3(0.6, 0.3, 0.9)
  glowLight.intensity  = 0.6
  glowLight.range      = 4

  // ── Opening dialogue sequence ─────────────────────────────────────────────
  say('Опять Дурневы. Опять насмешки. Сколько можно терпеть?', 5000)
  showEmotion('angry', 4000)

  setTimeout(() => {
    say('Что это?.. Контрабас в нашем чулане?', 4000)
    showEmotion('sad', 3500)
  }, 6000)

  setTimeout(() => {
    say('Попробуй открыть футляр — кликай на замки слева направо!', 6000)
  }, 11000)

  // ── Monkey-patch bassCase.solve so we can chain the next scene ─────────────
  const originalSolve = bassCase.solve.bind(bassCase)
  bassCase.solve = (outcome) => {
    originalSolve(outcome)
    _onCaseOpened(scene, glowLight, onComplete)
  }

  return {
    dispose: () => {
      bassCase.teardown()
      floor.dispose()
      glowLight.dispose()
      ambientLight.dispose()
    },
  }
}

const _onCaseOpened = (scene, glowLight, onComplete) => {
  // Flash of magic light
  glowLight.intensity = 3
  setTimeout(() => { glowLight.intensity = 0.8 }, 400)

  say('Он настоящий… и он зовёт меня!', 5000)
  showEmotion('determined', 4000)

  // Uncle Herman transforms (sphere stands in as "rabbit Syusyukalka")
  setTimeout(() => {
    const rabbit = MeshBuilder.CreateSphere('rabbit', { diameter: 0.5 }, scene)
    rabbit.position.set(3, 0.25, 2)
    const rabbitMat = new StandardMaterial('rabbitMat', scene)
    rabbitMat.diffuseColor = new Color3(0.9, 0.85, 0.8)
    rabbit.material = rabbitMat
    say('Дядя Герман… стал кроликом?! Сюсюкалка!', 5000)
    showEmotion('proud', 4000)

    // Transition to flight and Act 2
    setTimeout(() => {
      state.nextAct()
      onComplete(state.currentAct)
    }, 6000)
  }, 6000)
}
