import { FBM } from 'three-noise'
import { ease, lerp } from './Utils/Maths'

const INSTANCES = 6

class Butterfly {
  constructor(options) {
    this.scene = options.scene
    this.gltfLoader = options.gltfLoader

    this.parentGroup = new THREE.Group()
    this.parentGroup.position.x = -0.5
    this.parentGroup.position.z = -0.5
    this.parentGroup.position.y = 1

    this.group = new THREE.Group()

    this.group.scale.multiplyScalar(0.5)

    this.parentGroup.add(this.group)
    this.scene.add(this.parentGroup)

    this.butterflies = []

    this.path = null

    // this.path = {
    //   start: {
    //     x: this.parentGroup.position.x,
    //     y: this.parentGroup.position.y,
    //     z: this.parentGroup.position.z,
    //   },
    //   end: { x: 0.5, y: 1, z: 0.5 },
    // }

    this.clock = new THREE.Clock()
    this.elapsedTime = 0
    this.previousTime = 0
    this.deltaTime = 0
    this.isReady = false
    this.vec = new THREE.Vector2()

    this.t = 0
    this.dt = 0.02

    this.init()
  }

  async init() {
    await this.setButterfly()
  }

  async setButterfly() {
    try {
      const model = await this.gltfLoader.loadAsync(
        '../../assets/models/flying_butterfly.glb'
      )

      this.mixer = new THREE.AnimationMixer(model.scene)
      this.action = this.mixer.clipAction(model.animations[0])
      this.action.play()

      let actions = []
      for (let i = 0; i <= model.animations.length - 1; i++) {
        actions.push(this.mixer.clipAction(model.animations[i]))
      }

      this.fbm = new FBM({ seed: Math.random() })
      const offset = Math.random() * 100

      for (const key in actions) {
        actions[key].setEffectiveTimeScale(6)
        setTimeout(() => {
          actions[key].play()
        }, Math.random() * 1000)
      }

      this.group.rotation.y = offset
      this.group.add(model.scene)

      this.isReady = true
    } catch (error) {
      console.error({ error })
    }
  }

  attachModel(model) {
    const box = model.geometry.boundingBox

    this.path = {
      start: {
        x: box.min.x,
        y: 1,
        z: model.position.z + 0.5,
      },
      end: { x: box.max.x, y: 1, z: model.position.z + 0.5 },
    }
  }

  updateFlyingPath() {
    if (this.path) {
      const { start, end } = this.path

      const newX = lerp(start.x, end.x, ease(this.t)) // interpolate between start and end where
      const newY = lerp(start.y, end.y, ease(this.t)) // t is first passed through a easing
      const newZ = lerp(start.z, end.z, ease(this.t)) // function in this example.

      this.parentGroup.position.set(newX, newY, newZ) // set new position

      this.t += this.dt * 0.1
      if (this.t <= 0 || this.t >= 1) this.dt = -1 * this.dt
    }
  }

  update() {
    if (!this.isReady) return

    // this.t += 0.01

    this.elapsedTime = this.clock.getElapsedTime()
    this.deltaTime = this.elapsedTime - this.previousTime
    this.previousTime = this.elapsedTime
    this.mixer?.update(this.deltaTime)

    this.vec.set(this.clock.elapsedTime, this.clock.elapsedTime)
    this.group.position.set(0, this.fbm.get2(this.vec), 0)
    this.group.rotation.y -= this.deltaTime

    this.updateFlyingPath()

    // this.parentGroup.rotation.y += 0.03
    // this.parentGroup.position.x = 1 * Math.cos(this.t) + 0
    // this.parentGroup.position.z = 1 * Math.sin(this.t) + 0 // These to strings make it work
  }
}

export default Butterfly
