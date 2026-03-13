import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
} from '@babylonjs/core'
import { startTanyaLoop } from '@/tanya.js'
import { startFlight } from '@/flight.js'

const canvas = document.getElementById('renderCanvas')
const engine = new Engine(canvas, true)
const scene = new Scene(engine)

const camera = new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 3, 14, Vector3.Zero(), scene)
camera.attachControl(canvas, true)

new HemisphericLight('light', new Vector3(0, 1, 0), scene)

const ground = MeshBuilder.CreateGround('ground', { width: 30, height: 30 }, scene)
const groundMat = new StandardMaterial('groundMat', scene)
groundMat.diffuseColor = new Color3(0.1, 0.05, 0.2)
ground.material = groundMat

const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 1.5 }, scene)
sphere.position.y = 0.75
const sphereMat = new StandardMaterial('sphereMat', scene)
sphereMat.diffuseColor = new Color3(0.6, 0.2, 0.9)
sphere.material = sphereMat

engine.runRenderLoop(() => scene.render())
window.addEventListener('resize', () => engine.resize())

const stopTanya = startTanyaLoop()

setTimeout(() => {
  stopTanya()
  startFlight(scene)
}, 15000)
