/**
 * Act 2 — Прибытие и распределение (~20–40 мин)
 *
 * Scenes:
 *  1. Полёт над островом Буян, wow-эффект замка
 *  2. Клятва на черепе (мини-выбор → стартовая карма)
 *  3. Распределение по отделению
 *  4. Знакомство с ключевыми NPC
 *  5. Первая ночь в спальне, разговоры с Гробыней
 */
import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  HemisphericLight,
  DirectionalLight,
} from '@babylonjs/core'
import { say } from '@/tanya.js'
import { showEmotion } from '@/emotions.js'
import { applyKarma } from '@/karma.js'
import { syncDivision } from '@/division.js'
import { state } from '@/state.js'

const MIN_TOWER_HEIGHT   = 4
const TOWER_HEIGHT_RANGE = 6

/**
 * @param {BABYLON.Scene} scene
 * @param {(nextAct: number) => void} onComplete
 */
export const initAct2 = (scene, onComplete) => {
  // ── Lighting — magical island dusk ────────────────────────────────────────
  const sun = new DirectionalLight('act2Sun', new Vector3(-1, -2, -1), scene)
  sun.intensity   = 0.9
  sun.diffuse     = new Color3(1.0, 0.85, 0.6)

  const fill = new HemisphericLight('act2Fill', new Vector3(0, 1, 0), scene)
  fill.intensity  = 0.3
  fill.diffuse    = new Color3(0.5, 0.6, 1.0)

  // ── Island ground ─────────────────────────────────────────────────────────
  const island = MeshBuilder.CreateGround('island', { width: 50, height: 50 }, scene)
  const islandMat = new StandardMaterial('islandMat', scene)
  islandMat.diffuseColor = new Color3(0.15, 0.35, 0.15)
  island.material = islandMat

  // ── Tibidokhs castle silhouette (box stand-ins) ───────────────────────────
  const towers = []
  const towerPositions = [
    [-6, 0], [-2, 0], [2, 0], [6, 0],
    [-8, -4], [8, -4],
  ]
  towerPositions.forEach(([x, z], i) => {
    const h = MIN_TOWER_HEIGHT + Math.random() * TOWER_HEIGHT_RANGE
    const t = MeshBuilder.CreateBox(`tower${i}`, { width: 1.5, height: h, depth: 1.5 }, scene)
    t.position.set(x, h / 2, z)
    const tMat = new StandardMaterial(`towerMat${i}`, scene)
    tMat.diffuseColor = new Color3(0.22, 0.18, 0.35)
    t.material = tMat
    towers.push(t)
  })

  // ── Opening awe dialogue ───────────────────────────────────────────────────
  say('Остров Буян… Тибидохс в тумане. Это… невероятно!', 5000)
  showEmotion('proud', 4000)

  // ── Oath choice ───────────────────────────────────────────────────────────
  setTimeout(() => {
    _showOathChoice(onComplete, scene, () => {
      // cleanup
      towers.forEach(t => t.dispose())
      island.dispose()
      sun.dispose()
      fill.dispose()
    })
  }, 7000)

  return {
    dispose: () => {
      towers.forEach(t => t.dispose())
      island.dispose()
      sun.dispose()
      fill.dispose()
    },
  }
}

/** Show the oath choice UI and apply karma accordingly. */
const _showOathChoice = (onComplete, scene, cleanup) => {
  say('Клятва на черепе — как ты поклянёшься?', 4000)

  const container = document.createElement('div')
  Object.assign(container.style, {
    position:   'fixed',
    bottom:     '140px',
    left:       '50%',
    transform:  'translateX(-50%)',
    display:    'flex',
    gap:        '16px',
    zIndex:     '300',
  })

  const makeBtn = (label, onClick) => {
    const btn = document.createElement('button')
    btn.textContent = label
    Object.assign(btn.style, {
      padding:      '10px 24px',
      borderRadius: '24px',
      border:       '1px solid rgba(160,100,255,.5)',
      background:   'rgba(0,0,0,.7)',
      color:        '#f0e6ff',
      font:         '600 15px/1.4 "Segoe UI", sans-serif',
      cursor:       'pointer',
    })
    btn.addEventListener('click', onClick)
    return btn
  }

  const choose = (outcome, karmaDelta, text) => {
    container.remove()
    applyKarma(karmaDelta, 'клятва')
    state.setQuestFlag('oathTaken', outcome)
    syncDivision()
    say(text, 5000)
    showEmotion(karmaDelta >= 0 ? 'proud' : 'determined', 4000)
    setTimeout(() => {
      state.nextAct()
      onComplete(state.currentAct)
    }, 6000)
  }

  container.appendChild(makeBtn(
    '⚡ Поклясться честно',
    () => choose('good', 20, 'Я даю слово. Честное слово Тани Гроттер.'),
  ))
  container.appendChild(makeBtn(
    '🌑 Поклясться хитро',
    () => choose('cunning', -10, 'Обещаю… как умею. Это тоже клятва.'),
  ))
  container.appendChild(makeBtn(
    '⚖️ Нейтрально',
    () => choose('neutral', 0, 'Я… подумаю об этом.'),
  ))

  document.body.appendChild(container)
}
