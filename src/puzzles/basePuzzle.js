/**
 * BasePuzzle — abstract base for all in-game puzzles.
 *
 * Subclasses must implement:
 *   setup(scene)  — create meshes / listeners
 *   teardown()    — clean up meshes / listeners
 *
 * The base handles the solved/failed state, karma reward, and optional
 * Tanya commentary callbacks.
 */
import { applyKarma } from '@/karma.js'
import { say, showHint } from '@/tanya.js'
import { state } from '@/state.js'

export class BasePuzzle {
  /**
   * @param {object} options
   * @param {string}   options.id           — unique puzzle identifier matching state.questFlags key
   * @param {number}   [options.karmaReward=10] — karma awarded on solve
   * @param {number}   [options.karmaPenalty=0] — karma deducted on fail
   * @param {string}   [options.solveText]  — speech line on solve
   * @param {string}   [options.failText]   — speech line on fail
   * @param {string[]} [options.hints=[]]   — contextual hints shown when stuck
   */
  constructor({
    id,
    karmaReward  = 10,
    karmaPenalty = 0,
    solveText    = 'Получилось!',
    failText     = 'Нет, это не так…',
    hints        = [],
  }) {
    this.id           = id
    this.karmaReward  = karmaReward
    this.karmaPenalty = karmaPenalty
    this.solveText    = solveText
    this.failText     = failText
    this.hints        = hints
    this.solved       = false
    this._hintIdx     = 0
    this._scene       = null
  }

  /** Initialise puzzle in the scene. Call from subclass after super.init(scene). */
  init(scene) {
    this._scene = scene
    this.setup(scene)
  }

  /** Subclass hook — create puzzle elements. */
  setup(_scene) {}

  /** Subclass hook — remove puzzle elements. */
  teardown() {}

  /**
   * Call when the player solves the puzzle.
   * @param {'good'|'cunning'|'neutral'} [outcome='good']
   */
  solve(outcome = 'good') {
    if (this.solved) return
    this.solved = true
    state.setQuestFlag(this.id, outcome)
    applyKarma(this.karmaReward, this.id)
    say(this.solveText, 5000)
    this.teardown()
  }

  /** Call when the player makes a wrong attempt. */
  fail() {
    applyKarma(-this.karmaPenalty, this.id)
    say(this.failText, 4000)
  }

  /** Show next contextual hint for this puzzle. */
  hint() {
    if (this.hints.length === 0) {
      showHint()
      return
    }
    say(this.hints[this._hintIdx % this.hints.length], 6000)
    this._hintIdx++
  }
}
