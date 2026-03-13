const LINES = [
  'Держись крепче — контрабас не ждёт!',
  'Чувствуешь магию? Она везде…',
  'Осторожно, тут могут быть ловушки.',
  'Тиборт точно что-то скрывает.',
  'Мне кажется, дверь слева была открыта.',
  'Быстрее! Нам нельзя опаздывать!',
]

const el = document.getElementById('tanya-speech')
let hideTimer = null
let lineIdx = 0

export const say = (text, duration = 4000) => {
  el.textContent = text
  el.classList.add('visible')
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => el.classList.remove('visible'), duration)
}

export const startTanyaLoop = (interval = 12000) => {
  const id = setInterval(() => {
    say(LINES[lineIdx % LINES.length])
    lineIdx++
  }, interval)
  say(LINES[lineIdx++])
  return () => clearInterval(id)
}
