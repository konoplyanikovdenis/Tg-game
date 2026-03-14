/**
 * Act 5 — Финал: Безымянный Подвал (~30–60 мин)
 *
 * Key scenes:
 *  - Нырок в трещину
 *  - Финальный пазл с арфой / статуей Древнира
 *  - Разрешение парадокса пророчества
 *  - 3 концовки в зависимости от кармы + ключевых флагов
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
import { state } from '@/state.js'

/**
 * @param {BABYLON.Scene} scene
 * @param {() => void} onGameOver — called when the game ends
 */
export const initAct5 = (scene, onGameOver) => {
  const disposables = []

  // ── Lighting — dark cellar ─────────────────────────────────────────────────
  const ambient = new HemisphericLight('act5Ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.2
  ambient.diffuse   = new Color3(0.3, 0.2, 0.5)
  disposables.push(ambient)

  const floor = MeshBuilder.CreateGround('act5Floor', { width: 30, height: 30 }, scene)
  const floorMat = new StandardMaterial('act5FloorMat', scene)
  floorMat.diffuseColor = new Color3(0.05, 0.04, 0.10)
  floor.material = floorMat
  disposables.push(floor)

  // ── Drednir statue ────────────────────────────────────────────────────────
  const statue = MeshBuilder.CreateBox('statue', { width: 1.5, height: 4, depth: 1.5 }, scene)
  statue.position.set(0, 2, 12)
  const statueMat = new StandardMaterial('statueMat', scene)
  statueMat.diffuseColor  = new Color3(0.4, 0.35, 0.6)
  statueMat.emissiveColor = new Color3(0.15, 0.10, 0.25)
  statue.material = statueMat
  disposables.push(statue)

  const statueGlow = new PointLight('statueGlow', new Vector3(0, 4, 12), scene)
  statueGlow.diffuse   = new Color3(0.6, 0.4, 1.0)
  statueGlow.intensity = 1.5
  statueGlow.range     = 10
  disposables.push(statueGlow)

  // ── Harp (final puzzle trigger) ───────────────────────────────────────────
  const harp = MeshBuilder.CreateBox('harp', { width: 0.6, height: 1.2, depth: 0.15 }, scene)
  harp.position.set(3, 0.6, 8)
  const harpMat = new StandardMaterial('harpMat', scene)
  harpMat.diffuseColor  = new Color3(0.9, 0.75, 0.2)
  harpMat.emissiveColor = new Color3(0.3, 0.25, 0)
  harp.material = harpMat
  disposables.push(harp)

  harp.actionManager = new ActionManager(scene)
  harp.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      state.setQuestFlag('finalPuzzle', 'good')
      say('Арфа Древнира… её звук разрешает парадокс пророчества!', 6000)
      showEmotion('proud', 5000)
      harp.dispose()
      setTimeout(() => _showEnding(state, onGameOver), 8000)
    }),
  )

  // ── Opening sequence ──────────────────────────────────────────────────────
  say('Безымянный Подвал. Темно. Родинка светится — я иду правильно.', 5000)
  showEmotion('determined', 4000)

  setTimeout(() => {
    say('Арфа или статуя? Пророчество говорит — «звук спасёт молчание».', 5000)
    showEmotion('sad', 3500)
  }, 7000)

  return {
    dispose: () => {
      disposables.forEach(d => {
        try { d.dispose() } catch (_) { /* already disposed */ }
      })
    },
  }
}

/**
 * Determine and display one of 3 endings based on karma + quest flags.
 */
const _showEnding = (stateRef, onGameOver) => {
  const { karma, questFlags } = stateRef
  const goodQuests = Object.values(questFlags).filter(v => v === 'good').length

  let endingTitle, endingText

  if (karma >= 30 && goodQuests >= 3) {
    // Light ending
    endingTitle = '✨ Светлая концовка'
    endingText  = 'Тибидохс спасён. Тanya выбрала свет — и свет выбрал её. Пророчество исполнено с честью.'
  } else if (karma <= -30) {
    // Dark ending
    endingTitle = '🌑 Тёмная концовка'
    endingText  = 'Тибидохс спасён, но цена — тьма. Таня услышала зов тёмного отделения. История продолжается…'
  } else {
    // Mixed ending
    endingTitle = '⚖️ Смешанная концовка'
    endingText  = 'Тибидохс спасён. Таня нашла свой путь — между светом и тьмой. Её история ещё не написана.'
  }

  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position:   'fixed',
    inset:      '0',
    background: 'rgba(0,0,0,0.85)',
    display:    'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color:      '#f0e6ff',
    fontFamily: "'Segoe UI', sans-serif",
    zIndex:     '1000',
    padding:    '40px',
    textAlign:  'center',
  })

  const title = document.createElement('h1')
  title.textContent = endingTitle
  title.style.fontSize = '2.5rem'
  title.style.marginBottom = '24px'

  const text = document.createElement('p')
  text.textContent = endingText
  text.style.fontSize = '1.2rem'
  text.style.maxWidth = '600px'
  text.style.lineHeight = '1.7'

  const karmaLine = document.createElement('p')
  karmaLine.textContent = `Финальная карма: ${karma > 0 ? '+' : ''}${karma}`
  karmaLine.style.marginTop  = '20px'
  karmaLine.style.opacity    = '0.7'
  karmaLine.style.fontSize   = '0.95rem'

  const restartBtn = document.createElement('button')
  restartBtn.textContent = 'Начать заново'
  Object.assign(restartBtn.style, {
    marginTop:    '32px',
    padding:      '12px 32px',
    borderRadius: '28px',
    border:       '1px solid rgba(160,100,255,.5)',
    background:   'rgba(80,40,120,0.6)',
    color:        '#f0e6ff',
    fontSize:     '1.1rem',
    cursor:       'pointer',
  })
  restartBtn.addEventListener('click', () => {
    overlay.remove()
    onGameOver()
  })

  overlay.append(title, text, karmaLine, restartBtn)
  document.body.appendChild(overlay)
}
