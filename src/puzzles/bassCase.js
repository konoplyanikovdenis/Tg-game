/**
 * BassCase puzzle (Act 1) — Opening the contrabass case.
 *
 * The player must click all three glowing latches on the case in
 * the correct order (left → middle → right) to open it.
 * Wrong order triggers a visual flash and a fail callback.
 */
import { MeshBuilder, StandardMaterial, Color3, ActionManager, ExecuteCodeAction } from '@babylonjs/core'
import { BasePuzzle } from '@/puzzles/basePuzzle.js'

const CORRECT_ORDER = ['latch_L', 'latch_M', 'latch_R']

export class BassCase extends BasePuzzle {
  constructor() {
    super({
      id:          'bassFound',
      karmaReward: 15,
      solveText:   'Контрабас… он настоящий! И он ждал меня…',
      failText:    'Нет — замки не так. Попробуй снова.',
      hints: [
        'Щёлкни замки слева направо.',
        'Три замка, три клика — в нужном порядке.',
      ],
    })
    this._meshes  = []
    this._clicked = []
  }

  setup(scene) {
    this._scene = scene

    // Case body
    const caseBody = MeshBuilder.CreateBox('caseBody', { width: 1.8, height: 0.4, depth: 0.8 }, scene)
    caseBody.position.set(0, 0.2, 0)
    const caseMat = new StandardMaterial('caseMat', scene)
    caseMat.diffuseColor = new Color3(0.18, 0.10, 0.04)
    caseBody.material = caseMat
    this._meshes.push(caseBody)

    // Three latches
    const latchPositions = { latch_L: -0.6, latch_M: 0, latch_R: 0.6 }
    Object.entries(latchPositions).forEach(([name, x]) => {
      const latch = MeshBuilder.CreateBox(name, { width: 0.18, height: 0.12, depth: 0.12 }, scene)
      latch.position.set(x, 0.42, 0)
      const latchMat = new StandardMaterial(`${name}Mat`, scene)
      latchMat.diffuseColor  = new Color3(0.8, 0.7, 0.1)
      latchMat.emissiveColor = new Color3(0.4, 0.35, 0)
      latch.material = latchMat

      latch.actionManager = new ActionManager(scene)
      latch.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickTrigger, () => this._onLatch(name, latchMat)),
      )
      this._meshes.push(latch)
    })
  }

  _onLatch(name, mat) {
    if (this.solved) return

    const expected = CORRECT_ORDER[this._clicked.length]
    if (name === expected) {
      mat.emissiveColor = new Color3(0, 0.8, 0.2)
      this._clicked.push(name)
      if (this._clicked.length === CORRECT_ORDER.length) {
        this.solve('good')
      }
    } else {
      // Wrong order — flash red and reset
      mat.emissiveColor = new Color3(0.9, 0.1, 0.1)
      setTimeout(() => { mat.emissiveColor = new Color3(0.4, 0.35, 0) }, 600)
      this._clicked = []
      this.fail()
    }
  }

  teardown() {
    this._meshes.forEach(m => m.dispose())
    this._meshes = []
  }
}
