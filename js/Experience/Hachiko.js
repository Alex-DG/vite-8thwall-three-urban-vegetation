import modelSrc from '../../assets/models/hachiko.glb' // dog

class Hachiko {
  constructor(options) {
    this.scene = options.scene
    this.gltfLoader = options.gltfLoader
    this.grass = options.grass

    this.init()
  }

  async init() {
    try {
      const model = await this.gltfLoader.loadAsync(modelSrc)
      this.model = model.scene
      this.model.position.z = -3.5
      this.model.children[0].name = 'hachiko'

      this.scene.add(this.model)
      this.grass.setSampler(model)
    } catch (error) {
      console.error({ error })
    }
  }

  update() {}
}

export default Hachiko
