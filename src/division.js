/**
 * Division system — manages the light / dark / mixed division assignment
 * and applies the corresponding visual theme to the page.
 *
 * Themes:
 *   light — purple/gold palette, bright particles
 *   dark  — red/black palette, dark smoke particles
 *   mixed — teal/grey palette
 */
import { state } from '@/state.js'

const THEMES = {
  light: {
    bg:          '#0d0020',
    accent:      '#c084fc',
    groundColor: '0.08, 0.02, 0.22',
    label:       'Светлое отделение',
  },
  dark: {
    bg:          '#1a0000',
    accent:      '#f87171',
    groundColor: '0.20, 0.02, 0.02',
    label:       'Тёмное отделение',
  },
  mixed: {
    bg:          '#001a1a',
    accent:      '#67e8f9',
    groundColor: '0.02, 0.14, 0.16',
    label:       'Смешанное отделение',
  },
}

let divisionEl = null

const ensureEl = () => {
  if (divisionEl) return
  divisionEl = document.createElement('div')
  divisionEl.id = 'division-label'
  Object.assign(divisionEl.style, {
    position:   'fixed',
    top:        '18px',
    left:       '18px',
    padding:    '5px 16px',
    borderRadius: '20px',
    fontFamily: "'Segoe UI', sans-serif",
    fontWeight: '600',
    fontSize:   '0.85rem',
    pointerEvents: 'none',
    zIndex:     '200',
  })
  document.body.appendChild(divisionEl)
}

/**
 * Apply the visual theme for the given division string.
 * Called automatically when karma changes via state._updateDivision.
 * @param {'light'|'dark'|'mixed'} division
 */
export const applyDivisionTheme = (division) => {
  ensureEl()
  const theme = THEMES[division] ?? THEMES.light
  document.body.style.background = theme.bg

  divisionEl.textContent    = theme.label
  divisionEl.style.background = `rgba(0,0,0,0.55)`
  divisionEl.style.color      = theme.accent
  divisionEl.style.border     = `1px solid ${theme.accent}44`

  // Store for scene ground color updates
  divisionEl.dataset.groundColor = theme.groundColor
}

/**
 * Return the CSS accent colour for the current division.
 */
export const getDivisionAccent = () => {
  const theme = THEMES[state.division] ?? THEMES.light
  return theme.accent
}

/**
 * Sync visual theme with current state.division.
 */
export const syncDivision = () => applyDivisionTheme(state.division)
