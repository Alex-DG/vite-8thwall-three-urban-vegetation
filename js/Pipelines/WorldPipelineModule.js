import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import Flowers from '../Experience/Flowers'
import Model from '../Experience/Model'
import Ground from '../Experience/Ground'
import ParticleSystem from '../Experience/ParticleSystem'

import LoadingManager from '../Experience/Utils/LoadingManager'
import Butterfly from '../Experience/Butterfly'

export const initWorldPipelineModule = () => {
  let progress = 0

  let particleSystem
  let flowers
  let ground
  let model
  let butterfly

  const init = () => {
    const { scene, camera, canvas } = XR8.Threejs.xrScene()

    /*-----------------------------------------------------------*/
    /* Loaders                                                   */
    /*-----------------------------------------------------------*/
    const gltfLoader = new GLTFLoader(LoadingManager)
    // const textureLoader = new THREE.TextureLoader(LoadingManager)

    /*-----------------------------------------------------------*/
    /* Light                                                   */
    /*-----------------------------------------------------------*/
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(0, 2, 1)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    /*-----------------------------------------------------------*/
    /* Objects                                                   */
    /*-----------------------------------------------------------*/
    particleSystem = new ParticleSystem({ scene, count: 1000 })
    flowers = new Flowers({ scene, camera, canvas, gltfLoader })
    ground = new Ground({ scene, flowers })
    butterfly = new Butterfly({ scene, gltfLoader })
    model = new Model({
      scene,
      gltfLoader,
      ground,
      flowers,
      butterfly,
      name: 'hachiko',
    })

    /*-----------------------------------------------------------*/
    /* Progress                                                  */
    /*-----------------------------------------------------------*/
    LoadingManager.onProgress = (_, loaded, total) => {
      progress = (loaded / total) * 100 || 0
      // console.log('⏳', `Loading ${Number(progress).toFixed(0)}%`)
      if (progress >= 100) console.log('✅', 'World ready')
    }
  }

  const updateWorld = () => {
    particleSystem?.update()
    ground?.update()
    flowers?.update()
    model?.update()
    butterfly?.update()
  }

  return {
    name: 'world',

    onStart: () => init(),

    onUpdate: () => updateWorld(),
  }
}
