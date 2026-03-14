/**
 * Contrabass flight system.
 *
 * The contrabass is the primary movement mechanic.
 * - WASD / Arrow keys control direction
 * - The bass responds only to Tanya (visual: birthmark glows on special events)
 * - Returns a stop function and the bass mesh
 */
import {
  FollowCamera,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  ParticleSystem,
  Texture,
} from '@babylonjs/core'
import { state } from '@/state.js'

const KEY_STATE = {}

const onKeyDown = (e) => { KEY_STATE[e.code] = true }
const onKeyUp   = (e) => { KEY_STATE[e.code] = false }

/**
 * Spawn a simple glow-particle trail from the contrabass.
 * @param {BABYLON.Scene} scene
 * @param {BABYLON.Mesh}  emitter
 */
const addTrailParticles = (scene, emitter) => {
  const ps = new ParticleSystem('bassTrail', 60, scene)
// Fallback 1×1 transparent pixel — used when no asset file is bundled
  ps.particleTexture = new Texture(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    scene,
  )
  ps.emitter       = emitter
  ps.minSize       = 0.05
  ps.maxSize       = 0.18
  ps.minLifeTime   = 0.3
  ps.maxLifeTime   = 0.8
  ps.emitRate      = 40
  ps.color1        = new Color4(0.7, 0.4, 1.0, 0.8)
  ps.color2        = new Color4(0.4, 0.2, 0.7, 0.4)
  ps.colorDead     = new Color4(0, 0, 0, 0)
  ps.direction1    = new Vector3(-0.2, 0, -1)
  ps.direction2    = new Vector3(0.2, 0.2, -1)
  ps.minEmitPower  = 0.5
  ps.maxEmitPower  = 1.2
  ps.updateSpeed   = 0.02
  ps.start()
  return ps
}

/**
 * Start the contrabass flight in the given scene.
 * @param {BABYLON.Scene} scene
 * @returns {{ stop: () => void, bass: BABYLON.Mesh }}
 */
export const startFlight = (scene) => {
  // Contrabass body
  const bass = MeshBuilder.CreateBox('bass', { width: 0.3, height: 0.15, depth: 2 }, scene)
  const mat  = new StandardMaterial('bassMat', scene)
  mat.diffuseColor = new Color3(0.35, 0.15, 0.05)
  bass.material    = mat
  bass.position.set(0, 2, 0)

  // Follow camera
  const cam = new FollowCamera('flightCam', new Vector3(0, 4, -10), scene)
  cam.lockedTarget        = bass
  cam.radius              = 8
  cam.heightOffset        = 3
  cam.rotationOffset      = 180
  cam.cameraAcceleration  = 0.05
  cam.maxCameraSpeed      = 20
  scene.activeCamera      = cam

  // Particle trail
  const trail = addTrailParticles(scene, bass)

  // Register keyboard handlers
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup',   onKeyUp)

  // Velocity state
  const velocity = Vector3.Zero()
  const SPEED         = 8
  const LIFT          = 4
  const DRAG          = 0.88
  const MIN_AUTO_SPEED = 2

  const obs = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000

    // ── Input ────────────────────────────────────────────────────────────────
    if (KEY_STATE['KeyW'] || KEY_STATE['ArrowUp'])    velocity.z += SPEED * dt
    if (KEY_STATE['KeyS'] || KEY_STATE['ArrowDown'])  velocity.z -= SPEED * dt
    if (KEY_STATE['KeyA'] || KEY_STATE['ArrowLeft'])  velocity.x -= SPEED * dt
    if (KEY_STATE['KeyD'] || KEY_STATE['ArrowRight']) velocity.x += SPEED * dt
    if (KEY_STATE['Space'])                           velocity.y += LIFT  * dt
    if (KEY_STATE['ShiftLeft'] || KEY_STATE['ShiftRight']) velocity.y -= LIFT * dt

    // ── Drag & minimum auto-flight ────────────────────────────────────────
    velocity.scaleInPlace(DRAG)
    // Always drift forward slightly so it feels like flying
    velocity.z = Math.max(velocity.z, MIN_AUTO_SPEED * dt)

    // ── Move ─────────────────────────────────────────────────────────────────
    bass.position.addInPlace(velocity.scale(dt * 60))
    bass.position.y = Math.max(0.5, bass.position.y)

    // ── Tilt based on lateral velocity ───────────────────────────────────────
    bass.rotation.z = -velocity.x * 0.06
    bass.rotation.x =  velocity.z * 0.03

    // ── Birthmark glow on key acts ────────────────────────────────────────────
    const isKeyMoment = state.currentAct === 4 || state.currentAct === 5
    mat.emissiveColor = isKeyMoment
      ? new Color3(0.4, 0.1, 0.6)
      : Color3.Black()
  })

  const stop = () => {
    scene.onBeforeRenderObservable.remove(obs)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup',   onKeyUp)
    trail.stop()
    trail.dispose()
    bass.dispose()
  }

  return { stop, bass }
}

