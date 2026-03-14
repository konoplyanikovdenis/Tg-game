/**
 * Tanya Grotter — speech & inner monologue system.
 *
 * - Tanya speaks every 20–40 seconds (randomised interval)
 * - Lines are drawn from act-specific + karma-aware pools
 * - Each line is automatically scanned for emotion triggers
 */
import { state } from '@/state.js'
import { detectAndShow } from '@/emotions.js'

// ── Act-specific line pools ──────────────────────────────────────────────────

const LINES_ACT1 = [
  'Они думают, что я ничто. Но я чувствую — внутри что-то есть…',
  'Контрабас смотрит на меня. Странно. Очень странно.',
  'Мама… папа… где вы сейчас?',
  'Дядя Герман стал кроликом! Это точно случайность? Нет.',
  'Держись крепче — контрабас не ждёт!',
  'Лети выше! Там — звёзды и свобода!',
]

const LINES_ACT2 = [
  'Остров Буян… замок в тумане. Я дома?',
  'Клятва на черепе — серьёзно? Ладно. Я клянусь.',
  'Светлое отделение… посмотрим, что это значит.',
  'Гробыня храпит. Привыкну.',
  'Чувствуешь магию? Она везде в этих стенах.',
]

const LINES_ACT3 = [
  'Медузия снова поставила мне «неуд». Обидно.',
  'Дракнбол — мой шанс доказать, что я не случайная.',
  'Библиотека… Абдулла что-то знает о пророчестве Древнира.',
  'Осторожно — двигающиеся лестницы не шутят.',
  'Ягун мне подмигнул. Ягун? Серьёзно?',
  'Гробыня говорит, что я избранная. Верить ли ей?',
  'Чума-дель-Торт смотрит на меня слишком долго.',
]

const LINES_ACT4 = [
  'Волос Древнира разрублен. Земля трясётся — бежим!',
  'Пророчество сбывается прямо сейчас.',
  'Клопп? Неужели это он?',
  'Родинка горит… значит, я на правильном пути.',
  'Нельзя терять время — Тибидохс в опасности!',
]

const LINES_ACT5 = [
  'Безымянный Подвал. Назад дороги нет.',
  'Арфа… статуя Древнира… что это всё значит?',
  'Пророчество — ловушка или спасение?',
  'Родинка светится ярче, чем когда-либо.',
  'Я сделала это. Тибидохс спасён.',
]

const LINES_DARK = [
  'Может, Тёмное отделение — не так уж и плохо?',
  'Тьма даёт силу. Почему бы не использовать её?',
]

const LINES_LIGHT = [
  'Свет всегда побеждает. Я верю в это.',
  'Добро требует смелости. У меня она есть.',
]

const STUCK_HINTS = [
  'Попробуй нажать на светящийся предмет.',
  'Загадка решается проще, чем кажется.',
  'Облети локацию — может, заметишь подсказку.',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

const POOLS = [LINES_ACT1, LINES_ACT2, LINES_ACT3, LINES_ACT4, LINES_ACT5]

const linesForState = () => {
  const actIndex = Math.max(0, Math.min(4, state.currentAct - 1))
  const pool = [...(POOLS[actIndex] ?? POOLS[0])]
  if (state.division === 'dark')  pool.push(...LINES_DARK)
  if (state.division === 'light') pool.push(...LINES_LIGHT)
  return pool
}

// ── DOM element ──────────────────────────────────────────────────────────────

const el = document.getElementById('tanya-speech')
let hideTimer = null
let lineIdx   = 0

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Display a speech bubble with optional duration.
 * Auto-detects emotion triggers.
 * @param {string} text
 * @param {number} [duration=5000]
 */
export const say = (text, duration = 5000) => {
  el.textContent = text
  el.classList.add('visible')
  detectAndShow(text)
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => el.classList.remove('visible'), duration)
}

/**
 * Start Tanya's inner monologue loop.
 * The interval is randomised between minMs and maxMs (default 20–40 s).
 * Returns a stop function.
 * @param {number} [minMs=20000]
 * @param {number} [maxMs=40000]
 * @returns {() => void}
 */
export const startTanyaLoop = (minMs = 20000, maxMs = 40000) => {
  let timeoutId = null

  const next = () => {
    const lines = linesForState()
    say(lines[lineIdx % lines.length])
    lineIdx++
    const delay = minMs + Math.random() * (maxMs - minMs)
    timeoutId = setTimeout(next, delay)
  }

  // First line immediately
  next()

  return () => clearTimeout(timeoutId)
}

/**
 * Show a contextual puzzle hint.
 * @param {number} [idx] — forced hint index (cycles if omitted)
 */
export const showHint = (idx) => {
  const i = idx !== undefined ? idx : lineIdx % STUCK_HINTS.length
  say(STUCK_HINTS[i], 6000)
}

