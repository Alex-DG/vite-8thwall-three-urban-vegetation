import { getRandomFloat } from './Utils/Maths'
import { createFlower, generateFlowerURLS } from './Utils/Data/Flower'
import { gsap } from 'gsap'

const FLOWERS_COUNT = 25

class Flowers {
  constructor(options) {
    this.isReady = false

    this.scene = options.scene
    this.camera = options.camera
    this.canvas = options.canvas
    this.gltfLoader = options.gltfLoader

    // Tap event
    this.raycaster = new THREE.Raycaster()

    // Models
    this.urls = generateFlowerURLS(FLOWERS_COUNT)
    this.flowerModels = []

    // Flowers animation
    this.flowers = []
    this.growthSpeed = []
    this.scales = []

    this.init()
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////

  async init() {
    this.bind()

    this.setTouchEvent()
    // this.setSurface()
    await this.setFlowers()

    this.isReady = true
  }

  bind() {
    this.placeObjectTouchHandler = this.placeObjectTouchHandler.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    this.animateIn = this.animateIn.bind(this)
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////

  animateIn(point, rotationY) {
    const totalFlowers = getRandomFloat(1, 2)
    const flowers = []

    for (let i = 0; i < totalFlowers; i++) {
      const items = this.flowerModels
      const randomFlower = items[Math.floor(Math.random() * items.length)]
      const flower = createFlower(point, rotationY, randomFlower)

      const scale = {
        value: flower.scale.clone(),
        maxScale: getRandomFloat(0.1, 0.2, 3),
      }

      this.flowers.push(flower)
      this.growthSpeed.push(0)
      this.scales.push(scale)

      flowers.push(flower)
    }
    this.scene.add(...flowers)
  }

  onTouchEnd() {
    this.model?.traverse((child) => {
      if (child?.userData.blink) {
        child.material = this.modelMaterials[child.userData.index]
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

  placeObjectTouchHandler(event) {
    // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
    // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.
    if (event.touches.length === 2) XR8.XrController.recenter()
    if (event.touches.length > 2) return

    // --> If the canvas is tapped with one finger and hits the "surface", spawn an object.

    // calculate tap position in normalized device coordinates (-1 to +1) for both components.
    const coords = {
      x: (event.touches[0].clientX / window.innerWidth) * 2 - 1,
      y: -(event.touches[0].clientY / window.innerHeight) * 2 + 1,
    }

    // Update the picking ray with the camera and tap position.
    this.raycaster.setFromCamera(coords, this.camera)

    // Raycast against the "surface" object.
    const intersects = this.raycaster.intersectObject(this.surface)

    if (intersects.length > 0) {
      const intersect = intersects[0]
      if (intersect) {
        const rotationY = Math.random() * 360

        this.model?.traverse((child) => {
          if (!child?.userData.blink) {
            child.material = this.blinkMaterial
            child.userData.blink = true

            gsap.fromTo(
              child.material,
              {
                opacity: 0,
              },
              {
                opacity: 1,
                duration: 1.5,
                // delay: 0.2,
                ease: 'power3.out',
              }
            )
          }
        })

        this.animateIn(intersect.point, rotationY)
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////

  setTouchEvent() {
    this.canvas.addEventListener(
      'touchstart',
      this.placeObjectTouchHandler,
      true
    )

    this.canvas.addEventListener('touchend', this.onTouchEnd, true)
  }

  setSurface(ground) {
    ground.geometry.computeBoundingSphere()
    const boundingSphere = ground.geometry.boundingSphere

    const size = boundingSphere.radius
    const center = new THREE.Vector3()
    center.copy(boundingSphere.center)

    const surfaceGeometry = new THREE.CircleGeometry(size, 32)
    // const surfaceMaterial = new THREE.MeshNormalMaterial()
    const surfaceMaterial = new THREE.ShadowMaterial({
      transparent: true,
      opacity: 0.4,
    })

    this.surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial)
    this.surface.rotateX(-Math.PI / 2)
    this.surface.position.set(center.x, 0.01, center.z)
    this.surface.receiveShadow = true
    this.scene.add(this.surface)
  }

  async setFlowers() {
    try {
      const promises = this.urls.map((url) => this.gltfLoader.loadAsync(url))
      this.flowerModels = await Promise.all(promises)
      this.flowerModels.forEach((model) => {
        model.scene.scale.multiplyScalar(0)
        model.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true

            const material = child.material
            const map = material.map

            material.emissive = new THREE.Color('#ffffff')
            material.emissiveIntensity = 1
            material.emissiveMap = map
            material.color.convertSRGBToLinear()

            map.encoding = THREE.sRGBEncoding
          }
        })
      })
    } catch (error) {
      console.error('❌', { error })
    }
  }

  attachData(data) {
    this.model = data.mesh
    this.modelMaterials = data.materials
    this.blinkMaterial = data.blinkMaterial
  }

  update() {
    if (!this.isReady) return

    for (let index = 0; index < this.flowers.length; index++) {
      const flower = this.flowers[index]

      if (flower) {
        let growthSpeed = this.growthSpeed[index]
        let scale = this.scales[index].value

        growthSpeed += getRandomFloat(0.01, 0.02, 3)
        scale.x += growthSpeed
        scale.y += growthSpeed
        scale.z += growthSpeed

        const maxScale = this.scales[index].maxScale
        flower.scale.x = Math.min(maxScale, scale.x)
        flower.scale.y = Math.min(maxScale, scale.y)
        flower.scale.z = Math.min(maxScale, scale.z)
      }
    }
  }
}

export default Flowers
