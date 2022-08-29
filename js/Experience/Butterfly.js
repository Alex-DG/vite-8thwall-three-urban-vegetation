import { FBM } from 'three-noise'
import { ease, lerp } from './Utils/Maths'

import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'

class Butterfly {
  constructor(options) {
    this.scene = options.scene
    this.instances = options.instances || 3
    this.gltfLoader = options.gltfLoader

    this.parentGroup = new THREE.Group()
    this.scene.add(this.parentGroup)

    this.mixers = []
    this.butterflies = []

    this.path = null

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

  ////////////////////////////////////////////////////////////////////////

  attachData(mesh) {
    const box = mesh.geometry.boundingBox

    this.path = {
      start: {
        x: box.min.x,
        y: 1,
        z: mesh.position.z + 0.5,
      },
      end: { x: box.max.x, y: 1, z: mesh.position.z + 0.5 },
    }

    for (let i = 0; i < this.instances; i++) this.createButterfly()
  }

  playAnimation(mixer) {
    let actions = []
    for (let i = 0; i <= this.animations.length - 1; i++) {
      actions.push(mixer.clipAction(this.animations[i]))
    }
    for (const key in actions) {
      actions[key].setEffectiveTimeScale(6)
      setTimeout(() => {
        actions[key].play()
      }, Math.random() * 1000)
    }

    this.mixers.push(mixer)
  }

  createButterfly(index) {
    const butterflyClone = SkeletonUtils.clone(this.butterfly)
    butterflyClone.name = `butterfly-${index}`
    butterflyClone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material.clone()
        mat.color.setHex(Math.random() * 0xffffff)
        mat.emissive = new THREE.Color(Math.random() * 0xffffff)
        mat.emissiveIntensity = Math.random()
        mat.emissiveMap = mat.map
        child.material = mat
      }
    })
    butterflyClone.position.y = 2 * Math.random()
    butterflyClone.position.x = 2 * Math.random()

    const group = new THREE.Group()
    group.scale.multiplyScalar(Math.random() + 0.1)
    group.rotation.y = 100 * Math.random()
    group.add(butterflyClone)

    const mixer = new THREE.AnimationMixer(butterflyClone)
    this.playAnimation(mixer)

    this.butterflies.push({
      butterfly: group,
      fbm: new FBM({ seed: Math.random() }),
    })
    this.parentGroup.add(group)
  }

  ////////////////////////////////////////////////////////////////////////

  async setButterfly() {
    try {
      const model = await this.gltfLoader.loadAsync(
        '../../assets/models/flying_butterfly.glb'
      )

      this.butterfly = model.scene
      this.animations = model.animations
      this.butterfly.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material
          const map = material.map
          map.encoding = THREE.sRGBEncoding
          material.color.convertSRGBToLinear()
        }
      })
      this.isReady = true
    } catch (error) {
      console.error({ error })
    }
  }

  ////////////////////////////////////////////////////////////////////////

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

  updatePosition() {
    this.vec.set(this.clock.elapsedTime, this.clock.elapsedTime)
    this.butterflies.forEach(({ butterfly, fbm }) => {
      if (butterfly) {
        butterfly.position.set(0, fbm.get2(this.vec), 0)
        butterfly.rotation.y -= this.deltaTime
      }
    })
  }

  updateMixers() {
    this.mixers.forEach((m) => {
      m?.update(this.deltaTime)
    })
  }

  updateTime() {
    this.elapsedTime = this.clock.getElapsedTime()
    this.deltaTime = this.elapsedTime - this.previousTime
    this.previousTime = this.elapsedTime
  }

  update() {
    if (!this.isReady) return

    this.updateTime()
    this.updateMixers()
    this.updatePosition()
    this.updateFlyingPath()

    // Rotation animation:
    // this.t += 0.01
    // this.parentGroup.rotation.y += 0.03
    // this.parentGroup.position.x = 1 * Math.cos(this.t) + 0
    // this.parentGroup.position.z = 1 * Math.sin(this.t) + 0 // These to strings make it work
  }
}

export default Butterfly
