// import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'

import { gsap } from 'gsap'
import EventEmitter from './Utils/EventEmitter'

class Model {
  constructor(options) {
    this.scene = options.scene
    this.ground = options.ground
    this.butterfly = options.butterfly
    this.flowers = options.flowers
    this.name = options.name || 'hachiko'
    this.path = `../../assets/models/${this.name}.glb`
    this.gltfLoader = options.gltfLoader

    this.blinkMaterial = new THREE.MeshNormalMaterial({
      wireframe: true,
      wireframeLinewidth: 2,
      transparent: true,
      blending: THREE.AdditiveBlending,
    })
    this.materials = []

    this.init()
  }

  bind() {
    this.onFlowerAdded = this.onFlowerAdded.bind(this)
    this.onFlowerAddedEnd = this.onFlowerAddedEnd.bind(this)
  }

  async init() {
    this.bind()

    EventEmitter.on('flower:added', this.onFlowerAdded)
    EventEmitter.on('flower:addedEnd', this.onFlowerAddedEnd)

    await this.setModel()
  }

  ////////////////////////////////////////////////////////////////////////

  onFlowerAdded() {
    this.mesh?.traverse((child) => {
      if (!child?.userData.blink) {
        child.material = this.blinkMaterial.clone()
        child.userData.blink = true

        gsap.fromTo(
          child.material,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 1.5,
            ease: 'power3.out',
          }
        )
      }
    })
  }

  onFlowerAddedEnd() {
    this.mesh?.traverse((child) => {
      if (child?.userData.blink) {
        child.material = this.materials[child.userData.index]
        child.userData.blink = false

        gsap.fromTo(
          child.material,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
          }
        )
      }
    })
  }

  ////////////////////////////////////////////////////////////////////////

  async setModel() {
    try {
      const model = await this.gltfLoader.loadAsync(this.path)
      this.scene.add(model.scene)

      this.mesh = model.scene.children[0]
      this.mesh.name = this.name

      let index = 0
      model.scene.traverse((child) => {
        if (child.isMesh) {
          this.materials.push(child.material)
          child.material.transparent = true
          child.castShadow = true
          child.receiveShadow = true
          child.userData.blink = false
          child.userData.index = index
          index++
        }
      })

      this.ground.attachData(this.mesh)
      this.butterfly.attachData(this.mesh)
    } catch (error) {
      console.error({ error })
    }
  }

  update() {}
}

export default Model
