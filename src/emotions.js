/**
 * Emotions system for Tanya Grotter.
 *
 * Emotions: neutral | sad | angry | determined | proud
 *
 * Shows an icon above the speech bubble and optionally emits CSS particles.
 * Trigger rules:
 *  - mentioning parents  → sad
 *  - pity / жалость      → angry
 *  - Чума-дель-Торт      → determined
 *  - achievement         → proud
 */
import { state } from '@/state.js'

const ICONS = {
  neutral:    '',
  sad:        '😢',
  angry:      '😠',
  determined: '😤',
  proud:      '✨',
}

const PARENT_TRIGGERS   = ['мама', 'папа', 'родители', 'родинка', 'пророчество']
const PITY_TRIGGERS     = ['жалко', 'жалость', 'бедная']
const CHUMA_TRIGGERS    = ['чума-дель-торт', 'чума дель торт', 'чума']
const PROUD_TRIGGERS    = ['молодец', 'отлично', 'победа', 'получилось']

let iconEl = null
let particleTimeout = null

/** Inject the emotion icon element once into the DOM. */
const ensureEl = () => {
  if (iconEl) return
  iconEl = document.createElement('div')
  iconEl.id = 'tanya-emotion'
  Object.assign(iconEl.style, {
    position:   'fixed',
    bottom:     '90px',
    left:       '50%',
    transform:  'translateX(-50%)',
    fontSize:   '2.2rem',
    lineHeight: '1',
    pointerEvents: 'none',
    opacity:    '0',
    transition: 'opacity 0.4s',
    zIndex:     '100',
  })
  document.body.appendChild(iconEl)
}

/** Show emotion icon for `duration` ms. */
export const showEmotion = (emotion, duration = 5000) => {
  ensureEl()
  state.setEmotion(emotion)
  iconEl.textContent = ICONS[emotion] ?? ''
  iconEl.style.opacity = '1'
  clearTimeout(particleTimeout)
  particleTimeout = setTimeout(() => {
    iconEl.style.opacity = '0'
    // Reset to neutral after display
    state.setEmotion('neutral')
  }, duration)
}

/**
 * Scan a text line and trigger the appropriate emotion automatically.
 * Returns the detected emotion (or 'neutral').
 */
export const detectAndShow = (text) => {
  const lower = text.toLowerCase()
  if (PARENT_TRIGGERS.some(t => lower.includes(t))) {
    showEmotion('sad')
    return 'sad'
  }
  if (PITY_TRIGGERS.some(t => lower.includes(t))) {
    showEmotion('angry')
    return 'angry'
  }
  if (CHUMA_TRIGGERS.some(t => lower.includes(t))) {
    showEmotion('determined')
    return 'determined'
  }
  if (PROUD_TRIGGERS.some(t => lower.includes(t))) {
    showEmotion('proud')
    return 'proud'
  }
  return 'neutral'
}
