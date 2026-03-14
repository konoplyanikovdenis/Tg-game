/**
 * Act 4 — Кульминация: угроза Тибидохсу (~1–2 ч)
 *
 * Key scenes:
 *  - Разрублен Волос Древнира
 *  - Землетрясение, трещина, голос Древнира
 *  - Сбор элементов пророчества (воздушные пазлы)
 *  - Подозрения на Клоппа / других
 *  - Возможный перевод на тёмное отделение
 */
import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  HemisphericLight,
  PointLight,
  ActionManager,
  ExecuteCodeAction,
} from '@babylonjs/core'
import { say } from '@/tanya.js'
import { showEmotion } from '@/emotions.js'
import { applyKarma } from '@/karma.js'
import { syncDivision } from '@/division.js'
import { state } from '@/state.js'

/**
 * @param {BABYLON.Scene} scene
 * @param {(nextAct: number) => void} onComplete
 */
export const initAct4 = (scene, onComplete) => {
  const disposables = []

  const ambient = new HemisphericLight('act4Ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.35
  ambient.diffuse   = new Color3(0.6, 0.4, 0.8)
  disposables.push(ambient)

  const floor = MeshBuilder.CreateGround('act4Floor', { width: 60, height: 60 }, scene)
  const floorMat = new StandardMaterial('act4FloorMat', scene)
  floorMat.diffuseColor = new Color3(0.10, 0.08, 0.18)
  floor.material = floorMat
  disposables.push(floor)

  // ── Crack in the ground ───────────────────────────────────────────────────
  const crack = MeshBuilder.CreateBox('crack', { width: 0.5, height: 0.1, depth: 12 }, scene)
  crack.position.set(0, 0.05, 0)
  const crackMat = new StandardMaterial('crackMat', scene)
  crackMat.diffuseColor  = new Color3(0, 0, 0)
  crackMat.emissiveColor = new Color3(0.5, 0.1, 0.6)
  crack.material = crackMat
  disposables.push(crack)

  const crackGlow = new PointLight('crackGlow', new Vector3(0, 0.5, 0), scene)
  crackGlow.diffuse   = new Color3(0.7, 0.2, 0.9)
  crackGlow.intensity = 1.2
  crackGlow.range     = 8
  disposables.push(crackGlow)

  // ── Prophecy elements (air puzzles) ───────────────────────────────────────
  const ELEMENTS = [
    { name: 'elem_wind',  pos: [8, 6, 10],  color: new Color3(0.5, 0.8, 1.0),   label: 'Ветер собран' },
    { name: 'elem_fire',  pos: [-8, 8, 15], color: new Color3(1.0, 0.4, 0.1),   label: 'Огонь собран' },
    { name: 'elem_earth', pos: [0, 4, 25],  color: new Color3(0.4, 0.8, 0.3),   label: 'Земля собрана' },
  ]
  let collected = 0

  ELEMENTS.forEach(({ name, pos, color, label }) => {
    const sphere = MeshBuilder.CreateSphere(name, { diameter: 1.2 }, scene)
    sphere.position.set(...pos)
    const mat = new StandardMaterial(`${name}Mat`, scene)
    mat.diffuseColor  = color
    mat.emissiveColor = color.scale(0.4)
    sphere.material   = mat
    disposables.push(sphere)

    sphere.actionManager = new ActionManager(scene)
    sphere.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        applyKarma(10, name)
        say(`${label}!`, 4000)
        showEmotion('determined', 3000)
        sphere.dispose()
        collected++
        if (collected === ELEMENTS.length) {
          state.setQuestFlag('hairOfDrednir', 'good')
          _onAllCollected(state, onComplete)
        }
      }),
    )
  })

  // ── Opening earthquake sequence ───────────────────────────────────────────
  say('Волос Древнира разрублен! Земля трясётся!', 5000)
  showEmotion('angry', 4000)

  setTimeout(() => {
    say('Голос Древнира… он говорит со мной. Родинка горит!', 5000)
    showEmotion('sad', 4000)
  }, 7000)

  setTimeout(() => {
    say('Собери три элемента пророчества — ветер, огонь, земля!', 5000)
  }, 13000)

  return {
    dispose: () => disposables.forEach(d => { if (!d.isDisposed?.()) d.dispose() }),
  }
}

const _onAllCollected = (stateRef, onComplete) => {
  say('Все элементы собраны. Тибидохс можно спасти. Но кто предатель?', 6000)
  showEmotion('determined', 5000)

  // Possible division transfer based on karma
  syncDivision()

  setTimeout(() => {
    stateRef.nextAct()
    onComplete(stateRef.currentAct)
  }, 8000)
}
