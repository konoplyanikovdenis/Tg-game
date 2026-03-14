/**
 * Act 3 — Школьная жизнь + основные загадки (~3–6 ч)
 *
 * Key scenes:
 *  - Уроки (зелья у Медузии, магия у Сарданапала и др.)
 *  - Драконбол (полёты + сбор колец)
 *  - Библиотека → Абдулла → пророчество Древнира
 *  - Запретные коридоры, двигающиеся лестницы, привидения
 *  - Квесты с Ягуном, Гробыней, Ванькой (2–3 пути)
 *  - Первые намёки на угрозу Чумы-дель-Торт
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
import { say, showHint } from '@/tanya.js'
import { showEmotion } from '@/emotions.js'
import { applyKarma } from '@/karma.js'
import { state } from '@/state.js'

/**
 * @param {BABYLON.Scene} scene
 * @param {(nextAct: number) => void} onComplete
 */
export const initAct3 = (scene, onComplete) => {
  const disposables = []

  // ── Lighting — magical school ─────────────────────────────────────────────
  const ambient = new HemisphericLight('act3Ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.5
  disposables.push(ambient)

  // ── School corridors (floor) ──────────────────────────────────────────────
  const floor = MeshBuilder.CreateGround('schoolFloor', { width: 60, height: 60 }, scene)
  const floorMat = new StandardMaterial('schoolFloorMat', scene)
  floorMat.diffuseColor = new Color3(0.18, 0.16, 0.28)
  floor.material = floorMat
  disposables.push(floor)

  // ── Dragonball rings ──────────────────────────────────────────────────────
  const rings = []
  const ringPositions = [
    [0, 8, 20], [8, 10, 35], [-8, 12, 50],
    [4, 9, 65], [-4, 11, 80],
  ]
  ringPositions.forEach(([x, y, z], i) => {
    const ring = MeshBuilder.CreateTorus(`ring${i}`, { diameter: 2.5, thickness: 0.2, tessellation: 32 }, scene)
    ring.position.set(x, y, z)
    ring.rotation.x = Math.PI / 2
    const ringMat = new StandardMaterial(`ringMat${i}`, scene)
    ringMat.diffuseColor  = new Color3(1.0, 0.8, 0.1)
    ringMat.emissiveColor = new Color3(0.5, 0.4, 0)
    ring.material = ringMat

    ring.actionManager = new ActionManager(scene)
    const bassMesh = scene.getMeshByName('bass')
    if (bassMesh) {
      ring.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnIntersectionEnterTrigger, {
          mesh: bassMesh,
          usePreciseIntersection: false,
        }, () => {
          applyKarma(5, 'драконбол-кольцо')
          ring.dispose()
          rings.splice(rings.indexOf(ring), 1)
          if (rings.length === 0) {
            say('Все кольца собраны! Ягун в шоке!', 4000)
            showEmotion('proud', 3500)
          }
        }),
      )
    }
    rings.push(ring)
    disposables.push(ring)
  })

  // ── Library book (prophecy of Drednir) ────────────────────────────────────
  const book = MeshBuilder.CreateBox('libraryBook', { width: 0.4, height: 0.6, depth: 0.08 }, scene)
  book.position.set(-8, 1.5, 5)
  const bookMat = new StandardMaterial('bookMat', scene)
  bookMat.diffuseColor  = new Color3(0.6, 0.1, 0.1)
  bookMat.emissiveColor = new Color3(0.2, 0.05, 0.05)
  book.material = bookMat
  disposables.push(book)

  const bookGlow = new PointLight('bookGlow', new Vector3(-8, 2, 5), scene)
  bookGlow.diffuse   = new Color3(0.8, 0.3, 0.3)
  bookGlow.intensity = 0.5
  bookGlow.range     = 3
  disposables.push(bookGlow)

  book.actionManager = new ActionManager(scene)
  book.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      state.setQuestFlag('prophesyRead', 'good')
      applyKarma(8, 'пророчество')
      say('Пророчество Древнира… «Та, что несёт звук, спасёт молчание».', 6000)
      showEmotion('sad', 4000)
      book.dispose()
      bookGlow.dispose()
      // Check if we can progress
      _checkAct3Progress(state, onComplete)
    }),
  )

  // ── Opening dialogue ──────────────────────────────────────────────────────
  say('Тибидохс! Лестницы двигаются. Это нормально?', 5000)
  showEmotion('determined', 3000)

  setTimeout(() => {
    say('Собери все кольца на Драконболе — или найди книгу в библиотеке!', 6000)
  }, 7000)

  setTimeout(() => {
    say('Чума-дель-Торт снова смотрит на меня. Неприятно.', 4000)
    showEmotion('determined', 3000)
  }, 20000)

  return {
    dispose: () => {
      disposables.forEach(d => {
        try { d.dispose() } catch (_) { /* already disposed */ }
      })
    },
    showHint,
  }
}

const _checkAct3Progress = (stateRef, onComplete) => {
  const { prophesyRead } = stateRef.questFlags
  if (prophesyRead) {
    setTimeout(() => {
      stateRef.nextAct()
      onComplete(stateRef.currentAct)
    }, 7000)
  }
}
