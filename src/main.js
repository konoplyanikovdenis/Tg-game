import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
} from '@babylonjs/core'
import { startTanyaLoop } from '@/tanya.js'
import { startFlight } from '@/flight.js'
import { syncDivision } from '@/division.js'
import { createActManager } from '@/acts/index.js'

// ── Canvas & engine ──────────────────────────────────────────────────────────
const canvas = document.getElementById('renderCanvas')
const engine = new Engine(canvas, true)
const scene  = new Scene(engine)

// ── Default camera (overridden per-act) ──────────────────────────────────────
const camera = new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 14, Vector3.Zero(), scene)
camera.attachControl(canvas, true)

new HemisphericLight('defaultLight', new Vector3(0, 1, 0), scene)

// ── Render loop ───────────────────────────────────────────────────────────────
engine.runRenderLoop(() => scene.render())
window.addEventListener('resize', () => engine.resize())

// ── Apply initial division theme ──────────────────────────────────────────────
syncDivision()

// ── Start Tanya's monologue loop (20–40 s intervals) ─────────────────────────
startTanyaLoop(20000, 40000)

// ── Kick off flight (always-on core mechanic) ─────────────────────────────────
startFlight(scene)

// ── Act manager ───────────────────────────────────────────────────────────────
const actManager = createActManager(scene)
actManager.start()
