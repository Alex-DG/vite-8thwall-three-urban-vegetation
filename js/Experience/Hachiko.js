import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'

import Ground from './Ground'

import modelSrc from '../../assets/models/hachiko.glb' // dog

class Hachiko {
  constructor(options) {
    this.scene = options.scene
    this.gltfLoader = options.gltfLoader
    this.ground = new Ground({ scene: options.scene })

    this.init()
  }

  async init() {
    try {
      const model = await this.gltfLoader.loadAsync(modelSrc)
      // this.model = model.scene
      // this.model.position.z = -3.5
      model.scene.children[0].name = 'hachiko'
      // console.log({ model })
      // let objectGeometries = []

      // this.iterations = 0
      // this.model.traverse((child) => {
      //   if (child.isMesh) {
      //     this.iterations++

      //     // child.material.side = THREE.DoubleSide
      //     // child.material.transparent = false
      //     // child.material.depthTest = true
      //     // child.material.depthWrite = false

      //     child.castShadow = true
      //     child.receiveShadow = true
      //     child.geometry.computeVertexNormals() // Computes vertex normals by averaging face normals https://threejs.org/docs/#api/en/core/BufferGeometry.computeVertexNormals

      //     if (this.iterations % 2 === 0) {
      //       child.material = new THREE.MeshStandardMaterial({
      //         color: 0x00ffff,
      //         wireframe: true,
      //       })
      //     }

      //     objectGeometries.push(child.geometry)
      //   }
      // })

      // const mergedGeometries = mergeBufferGeometries(objectGeometries)
      // const mergedGeometriesMat = new THREE.MeshNormalMaterial()
      // const mergedGeometriesMesh = new THREE.Mesh(
      //   mergedGeometries,
      //   mergedGeometriesMat
      // )

      this.scene.add(model.scene)
      this.ground.init(model.scene.children[0])
    } catch (error) {
      console.error({ error })
    }
  }

  update() {
    this.ground?.update()
  }
}

export default Hachiko
