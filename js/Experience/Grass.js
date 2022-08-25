// import grassTextureSrc from './../assets/textures/grass/blade_diffuse.jpg'

import grassTextureSrc from '../../assets/textures/grass/blade_diffuse.jpg'
import alphaMapSrc from '../../assets/textures/grass/blade_alpha.jpg'
import noiseTextureSrc from '../../assets/textures/grass/perlinFbm.jpg'

import GrassMaterial from './Shaders/Grass/GrassMaterial'

import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'

class Grass {
  constructor(options) {
    // this.time = 0
    this.isReady = false

    this.scene = options.scene
    this.camera = options.camera
    this.textureLoader = options.textureLoader

    const resolution = options.resolution || 4 //6 / 10
    const width = options.width || 4 //50 / 10

    this.config = {
      width, // Patch side length
      resolution, // Number of vertices on ground plane side
      instances: options.instances || 7000, // Number of blades
      delta: width / resolution, // Distance between two ground plane vertices
      radius: options.radius || 150, // Radius of the sphere onto which the ground plane is bent
      blade: {
        joints: 4,
        // bladeWidth: 0.12,
        // bladeHeight: 0.9,
        bladeWidth: 0.012,
        bladeHeight: 0.09,
      },
    }

    // Mesh Surface Sampler / Instanced Mesh - Setup
    this.ages = new Float32Array(this.config.instances)
    this.growthSpeed = new Float32Array(this.config.instances) // each sunflower has a different growth speed
    this.scales = new Float32Array(this.config.instances)
    this.dummy = new THREE.Object3D()

    this.currentPoint = new THREE.Vector3()
    this.position = new THREE.Vector3()
    this.positions = []
    this.normal = new THREE.Vector3()
    this.normals = []
    this.scale = new THREE.Vector3()

    this.init()
  }

  async init() {
    await this.setTextures()
    this.setGrass()
  }

  async setTextures() {
    // Get alpha map and blade texture
    // These have been taken from "Realistic real-time grass rendering" by Eddie Lee, 2010
    const [grassTexture, alphaMap, noiseTexture] = await Promise.all([
      this.textureLoader.loadAsync(grassTextureSrc),
      this.textureLoader.loadAsync(alphaMapSrc),
      this.textureLoader.loadAsync(noiseTextureSrc),
    ])
    noiseTexture.wrapS = THREE.RepeatWrappin
    noiseTexture.wrapT = THREE.RepeatWrapping

    this.texture = {
      grassTexture,
      alphaMap,
      noiseTexture,
    }
  }

  setGrass() {
    const { blade, delta, radius, width, instances } = this.config
    const { bladeWidth, bladeHeight, joints } = blade

    // Define base geometry that will be instanced. We use a plane for an individual blade of grass
    this.grassBaseGeometry = new THREE.PlaneBufferGeometry(
      bladeWidth,
      bladeHeight,
      1,
      joints
    )
    this.grassBaseGeometry.translate(0, blade.bladeHeight / 2, 0)

    // Define the bend of the grass blade as the combination of three quaternion rotations
    let vertex = new THREE.Vector3()
    let quaternion0 = new THREE.Quaternion()
    let quaternion1 = new THREE.Quaternion()
    let x, y, z, w, angle, sinAngle, rotationAxis

    // Rotate around Y
    angle = 0.05
    sinAngle = Math.sin(angle / 2.0)
    rotationAxis = new THREE.Vector3(0, 1, 0)
    x = rotationAxis.x * sinAngle
    y = rotationAxis.y * sinAngle
    z = rotationAxis.z * sinAngle
    w = Math.cos(angle / 2.0)

    // Rotate around X
    angle = 0.3
    sinAngle = Math.sin(angle / 2.0)
    rotationAxis.set(1, 0, 0)
    x = rotationAxis.x * sinAngle
    y = rotationAxis.y * sinAngle
    z = rotationAxis.z * sinAngle
    w = Math.cos(angle / 2.0)
    quaternion1.set(x, y, z, w)

    // Combine rotations to a single quaternion
    quaternion0.multiply(quaternion1)

    // Rotate around Z
    angle = 0.1
    sinAngle = Math.sin(angle / 2.0)
    rotationAxis.set(0, 0, 1)
    x = rotationAxis.x * sinAngle
    y = rotationAxis.y * sinAngle
    z = rotationAxis.z * sinAngle
    w = Math.cos(angle / 2.0)
    quaternion1.set(x, y, z, w)

    // Combine rotations to a single quaternion
    quaternion0.multiply(quaternion1)

    let quaternion2 = new THREE.Quaternion()

    // Bend grass base geometry for more organic look
    for (
      let v = 0;
      v < this.grassBaseGeometry.attributes.position.array.length;
      v += 3
    ) {
      quaternion2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
      vertex.x = this.grassBaseGeometry.attributes.position.array[v]
      vertex.y = this.grassBaseGeometry.attributes.position.array[v + 1]
      vertex.z = this.grassBaseGeometry.attributes.position.array[v + 2]
      let frac = vertex.y / blade.bladeHeight
      quaternion2.slerp(quaternion0, frac)
      vertex.applyQuaternion(quaternion2)
      this.grassBaseGeometry.attributes.position.array[v] = vertex.x
      this.grassBaseGeometry.attributes.position.array[v + 1] = vertex.y
      this.grassBaseGeometry.attributes.position.array[v + 2] = vertex.z
    }
    this.grassBaseGeometry.computeVertexNormals()

    const instancedGeometry = new THREE.InstancedBufferGeometry()
    instancedGeometry.index = this.grassBaseGeometry.index
    instancedGeometry.attributes.position =
      this.grassBaseGeometry.attributes.position
    instancedGeometry.attributes.uv = this.grassBaseGeometry.attributes.uv
    instancedGeometry.attributes.normal =
      this.grassBaseGeometry.attributes.normal

    // Each instance has its own data for position, orientation and scale
    const indices = []
    const offsets = []
    const scales = []
    const halfRootAngles = []

    // For each instance of the grass blade
    for (let i = 0; i < instances; i++) {
      indices.push(i / instances)

      // Offset of the roots
      offsets.push(
        Math.random() * width - width / 2,
        0,
        Math.random() * width - width / 2
      )

      // Random orientation
      const angle = Math.PI - Math.random() * (2 * Math.PI)
      halfRootAngles.push(Math.sin(0.5 * angle), Math.cos(0.5 * angle))

      // Define variety in height
      if (i % 3 != 0) {
        scales.push(2.0 + Math.random() * 1.25)
      } else {
        scales.push(2.0 + Math.random())
      }
    }

    const attribute = {
      offset: new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3),
      scale: new THREE.InstancedBufferAttribute(new Float32Array(scales), 1),
      halfRootAngle: new THREE.InstancedBufferAttribute(
        new Float32Array(halfRootAngles),
        2
      ),
      index: new THREE.InstancedBufferAttribute(new Float32Array(indices), 1),
    }

    instancedGeometry.setAttribute('offset', attribute.offset)
    instancedGeometry.setAttribute('scale', attribute.scale)
    instancedGeometry.setAttribute('halfRootAngle', attribute.halfRootAngle)
    instancedGeometry.setAttribute('index', attribute.index)

    this.grassMaterial = new GrassMaterial({
      width,
      delta,
      radius,
      texture: this.texture,
      camera: this.camera,
    })

    this.grass = new THREE.Mesh(instancedGeometry, this.grassMaterial)
    // this.grass.scale.set(0.25, 0.25, 0.25)
    // this.grass.position.z = -10
    // this.scene.add(this.grass)
  }

  setSampler(model, mergedGeometriesMesh) {
    const sampler = new MeshSurfaceSampler(mergedGeometriesMesh)
      .setWeightAttribute('uv')
      .build()

    const geometry = this.grass.geometry
    const material = this.grassMaterial

    const count = this.config.instances

    this.grass2 = new THREE.InstancedMesh(geometry, material, count)

    const _position = new THREE.Vector3()
    const _matrix = new THREE.Matrix4()

    // Sample randomly from the surface, creating an instance of the sample
    // geometry at each sample point.
    for (let i = 0; i < count; i++) {
      sampler.sample(_position)

      _matrix.makeTranslation(_position.x, _position.y, _position.z)

      this.grass2.setMatrixAt(i, _matrix)
    }

    this.grass2.instanceMatrix.needsUpdate = true
    // this.grass2.scale.multiplyScalar(0.25)
    // this.grass2.position.z = -3.5
    this.scene.add(this.grass2)

    this.isReady = true
  }

  update() {
    if (!this.isReady) return

    // this.time += 0.05
    this.grassMaterial.uniforms.uTime.value = performance.now() * 0.0025
  }
}

export default Grass
