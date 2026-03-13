import { FollowCamera, Vector3, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core'

export const startFlight = (scene) => {
  const bass = MeshBuilder.CreateBox('bass', { width: 0.3, height: 0.15, depth: 2 }, scene)
  const mat = new StandardMaterial('bassMat', scene)
  mat.diffuseColor = new Color3(0.35, 0.15, 0.05)
  bass.material = mat
  bass.position.set(0, 2, 0)

  const cam = new FollowCamera('flightCam', new Vector3(0, 4, -10), scene)
  cam.lockedTarget = bass
  cam.radius = 8
  cam.heightOffset = 3
  cam.rotationOffset = 180
  cam.cameraAcceleration = 0.05
  cam.maxCameraSpeed = 20
  scene.activeCamera = cam

  let t = 0
  const obs = scene.onBeforeRenderObservable.add(() => {
    t += scene.getEngine().getDeltaTime() / 1000
    bass.position.x = Math.sin(t * 0.7) * 6
    bass.position.y = 2 + Math.sin(t * 1.1) * 1.5
    bass.position.z = t * 5
    bass.rotation.z = -Math.sin(t * 0.7) * 0.3
  })

  return () => {
    scene.onBeforeRenderObservable.remove(obs)
    bass.dispose()
  }
}
