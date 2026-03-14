/**
 * Karma system — helper that applies karma deltas, fires division update
 * and optionally shows a brief UI notification.
 */
import { state } from '@/state.js'

let notifyEl = null

const ensureEl = () => {
  if (notifyEl) return
  notifyEl = document.createElement('div')
  notifyEl.id = 'karma-notify'
  Object.assign(notifyEl.style, {
    position:   'fixed',
    top:        '18px',
    right:      '18px',
    padding:    '6px 18px',
    borderRadius: '24px',
    fontFamily: "'Segoe UI', sans-serif",
    fontWeight: '700',
    fontSize:   '1rem',
    pointerEvents: 'none',
    opacity:    '0',
    transition: 'opacity 0.5s',
    zIndex:     '200',
  })
  document.body.appendChild(notifyEl)
}

let hideTimer = null

/**
 * Apply a karma delta and show a brief "+N karma" / "−N karma" notification.
 * @param {number} delta
 * @param {string} [reason] — optional label shown in the notification
 */
export const applyKarma = (delta, reason = '') => {
  ensureEl()
  state.addKarma(delta)
  const sign   = delta >= 0 ? '+' : ''
  const color  = delta >= 0 ? '#a8f0a8' : '#f0a8a8'
  const label  = reason ? ` (${reason})` : ''
  notifyEl.textContent = `${sign}${delta} карма${label}`
  notifyEl.style.background = delta >= 0
    ? 'rgba(50,150,50,0.85)'
    : 'rgba(150,50,50,0.85)'
  notifyEl.style.color = color
  notifyEl.style.opacity = '1'
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    notifyEl.style.opacity = '0'
  }, 2500)
}

/**
 * Return the current karma value.
 */
export const getKarma = () => state.karma
