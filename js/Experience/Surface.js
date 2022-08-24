import * as THREE from 'three'

import gsap from 'gsap'

import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'

import SurfaceParticles from './Shaders/SurfaceParticles/SurfaceParticles'

class Surface {
  constructor(options) {
    const { scene } = options
    this.scene = scene
    this.isReady = false
  }

  init(model) {
    this.model = model.scene

    this.mesh = model.scene.children[0]

    this.particlesMaterial = new SurfaceParticles()

    // Create a sampler for a Mesh surface.
    const sampler = new MeshSurfaceSampler(this.mesh)
      .setWeightAttribute('color')
      .build()

    const numberParticles = 20000

    this.particlesGeometry = new THREE.BufferGeometry()

    const particlesPosition = new Float32Array(numberParticles * 3) // x,y,z
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
    // this.particles = new THREE.Points(
    //   this.particlesGeometry,
    //   this.particlesMaterial
    // )
    // //   this.particles.scale.multiplyScalar(1.1)
    // this.particles.position.y = 0.1

    // this.add()
  }

  add() {
    this.scene.add(this.particles)

    gsap.to(this.particlesMaterial.uniforms.uScale, {
      value: 1.01,
      duration: 0.8,
      delay: 0.3,
      ease: 'power3.out',
    })

    // const tl = gsap.timeline()
    // tl.fromTo(
    //   this.particlesMaterial.uniforms.uScale,
    //   { value: 0 },
    //   {
    //     value: 1.5,
    //     duration: 1,
    //     delay: 0.3,
    //     ease: 'power3.out',
    //   }
    // )
    // tl.to(this.particlesMaterial.uniforms.uScale, {
    //   value: 1.0,
    //   duration: 1,
    //   ease: 'power3.in',
    // })

    // if (!this.isReady) {
    //   gsap.fromTo(
    //     this.particles.rotation,
    //     {
    //       y: Math.PI,
    //     },
    //     {
    //       y: 0,
    //       duration: 0.8,
    //       ease: 'power3.out',
    //     }
    //   )
    // }

    this.isReady = true
  }

  remove() {
    gsap.to(this.particlesMaterial.uniforms.uScale, {
      value: 0,
      duration: 0.8,
      ease: 'power3.out',
      onComplete: () => {
        this.scene.remove(this.particles)
        this.isReady = false
      },
    })

    gsap.to(this.particles.rotation.uScale, {
      y: Math.PI,
      duration: 0.8,
      ease: 'power3.out',
    })
  }

  update() {
    if (this.isReady) {
      //   this.particlesMaterial.uniforms.uTime.value = performance.now() / 1000
    }
  }
}

export default Surface
