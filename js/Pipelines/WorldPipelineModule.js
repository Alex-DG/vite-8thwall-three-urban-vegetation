import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import Flowers from '../Experience/Flowers'
import ParticleSystem from '../Experience/ParticleSystem'

import LoadingManager from '../Experience/Utils/LoadingManager'

export const initWorldPipelineModule = () => {
  let progress = 0

  let particleSystem
  let flowers

  const init = () => {
    const { scene, camera, canvas } = XR8.Threejs.xrScene()

    /*-----------------------------------------------------------*/
    /* Loaders                                                   */
    /*-----------------------------------------------------------*/
    const gltfLoader = new GLTFLoader(LoadingManager)

    /*-----------------------------------------------------------*/
    /* Light                                                   */
    /*-----------------------------------------------------------*/
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(0, 2, 1)
    directionalLight.castShadow = true // default false
    scene.add(directionalLight)

    const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x5aa9e7, 1)
    scene.add(hemiLight)

    /*-----------------------------------------------------------*/
    /* Objects                                                   */
    /*-----------------------------------------------------------*/
    particleSystem = new ParticleSystem({ scene, count: 1000 })
    flowers = new Flowers({ scene, camera, canvas, gltfLoader })

    /*-----------------------------------------------------------*/
    /* Progress                                                  */
    /*-----------------------------------------------------------*/
    LoadingManager.onProgress = (_, loaded, total) => {
      progress = (loaded / total) * 100
      console.log('⏳', `${progress}%`)
      if (progress >= 100) console.log('✅', 'World ready')
    }
  }

  const updateWorld = () => {
    particleSystem?.update()
    flowers?.update()
  }

  return {
    name: 'world',

    onStart: () => init(),

    onUpdate: () => updateWorld(),
  }
}
