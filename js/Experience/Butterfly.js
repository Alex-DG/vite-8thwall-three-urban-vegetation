import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import { FBM } from 'three-noise'

class Butterfly {
  constructor(options) {
    this.scene = options.scene
    this.gltfLoader = options.gltfLoader
    this.group = new THREE.Group()
    // this.group.scale.multiplyScalar(0.15)
    this.scene.add(this.group)

    this.clock = new THREE.Clock()
    this.elapsedTime = 0
    this.previousTime = 0
    this.deltaTime = 0

    this.isReady = false

    this.vec = new Vector2()

    this.init()
  }

  async init() {
    await this.setButterfly()
  }

  async setButterfly() {
    try {
      const model = await this.gltfLoader.loadAsync(
        '../../assets/models/butterfly.glb'
      )

      //   this.mixer = new THREE.AnimationMixer(model.scene)
      //   // this.action = this.mixer.clipAction(model.animations[0])
      //   // this.action.play()

      //   let actions = []
      //   for (let i = 0; i <= model.animations.length - 1; i++) {
      //     actions.push(this.mixer.clipAction(model.animations[i]))
      //   }

      //   this.cloneScene = SkeletonUtils.clone(model.scene)

      //   this.fbm = new FBM({ seed: Math.random() })
      //   const offset = Math.random() * 100

      //   for (const key in actions) {
      //     actions[key].setEffectiveTimeScale(6)
      //     setTimeout(() => {
      //       actions[key].play()
      //     }, Math.random() * 1000)
      //   }
      //   this.group.rotation.y = offset
      //   this.group.add(this.cloneScene)

      this.isReady = true
    } catch (error) {
      console.error({ error })
    }
  }

  update() {
    if (!this.isReady) return

    // this.elapsedTime = this.clock.getElapsedTime()
    // this.deltaTime = this.elapsedTime - this.previousTime
    // this.previousTime = this.elapsedTime

    // this.mixer?.update(this.deltaTime)

    // try {
    //   this.vec.set(this.clock.elapsedTime, this.clock.elapsedTime)
    //   this.group.position.set(0, this.fbm.get2(this.vec), 0)
    //   this.group.rotation.y -= this.deltaTime
    // } catch (error) {
    //   console.log({ error })
    // }
  }
}

export default Butterfly
