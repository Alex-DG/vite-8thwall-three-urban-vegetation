import gsap from 'gsap'

import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import ParticlesGroundMaterial from './Shaders/ParticlesGround/ParticlesGroundMaterial'

class Ground {
  constructor(options) {
    this.scene = options.scene
    this.flowers = options.flowers
    this.numberParticles = options.numberParticles || 20000
    this.isReady = false
  }

  init(mesh) {
    this.mesh = mesh

    this.particlesMaterial = new ParticlesGroundMaterial()

    // Create a sampler for a Mesh surface.
    const sampler = new MeshSurfaceSampler(this.mesh)
      .setWeightAttribute('color')
      .build()

    const numberParticles = this.numberParticles

    this.particlesGeometry = new THREE.BufferGeometry()

    const particlesPosition = new Float32Array(numberParticles * 3)
    const particlesRandomness = new Float32Array(numberParticles * 3)

    for (let i = 0; i < numberParticles; i++) {
      const pos = new THREE.Vector3()
      sampler.sample(pos)

      particlesPosition.set([pos.x, pos.y, pos.z], i * 3)

      particlesRandomness.set(
        [
          Math.random() * 2 - 1, // -1 to 1
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
        ],
        i * 3
      )
    }

    this.particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlesPosition, 3)
    )
    this.particlesGeometry.setAttribute(
      'aRandom',
      new THREE.BufferAttribute(particlesRandomness, 3)
    )

    /**
     * Particles
     */
    this.particles = new THREE.Points(
      this.particlesGeometry,
      this.particlesMaterial
    )
    this.particles.position.y = mesh.position.y + 0.1

    this.add()
  }

  add() {
    this.isReady = true
    this.scene.add(this.particles)
    this.flowers.setSurface(this.particles)

    gsap.to(this.particlesMaterial.uniforms.uScale, {
      value: 1.02,
      duration: 1.5,
      delay: 0.5,
      ease: 'power3.out',
    })
  }

  update() {
    if (this.isReady) {
      this.particlesMaterial.uniforms.uTime.value = performance.now() / 1000
    }
  }
}

export default Ground
