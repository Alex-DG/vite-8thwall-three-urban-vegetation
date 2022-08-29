import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'

class Model {
  constructor(options) {
    this.scene = options.scene
    this.ground = options.ground
    this.butterfly = options.butterfly
    this.flowers = options.flowers
    this.name = options.name || 'hachiko'
    this.path = `../../assets/models/${this.name}.glb`
    this.gltfLoader = options.gltfLoader

    this.init()
  }

  async init() {
    try {
      const materials = []

      const blinkMaterial = new THREE.MeshNormalMaterial({
        wireframe: true,
        wireframeLinewidth: 2,
        transparent: true,
        blending: THREE.AdditiveBlending,
      })

      const model = await this.gltfLoader.loadAsync(this.path)
      model.scene.children[0].name = this.name

      let index = 0
      model.scene.traverse((child) => {
        if (child.isMesh) {
          materials.push(child.material)
          child.material.transparent = true
          child.castShadow = true
          child.receiveShadow = true
          child.userData.blink = false
          child.userData.index = index
          index++
        }
      })

      const mesh = model.scene.children[0]
      const flowersData = {
        blinkMaterial,
        materials,
        mesh,
      }

      this.scene.add(model.scene)

      this.ground.attachData(mesh)
      this.butterfly.attachData(mesh)
      this.flowers.attachData(flowersData)
    } catch (error) {
      console.error({ error })
    }
  }

  update() {}
}

export default Model
