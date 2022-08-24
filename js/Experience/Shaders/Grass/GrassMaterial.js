import { RawShaderMaterial, Vector2, Vector3, DoubleSide } from 'three'

import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'

const params = {
  // The global coordinates
  // - the geometry never leaves a box of width*width around (0, 0)
  // - but we track where in space the camera would be globally
  position: new Vector2(0.01, 0.01),

  // Height over horizon in range [0, PI/2.0]
  elevation: 0.2,
  // Rotation around Y axis in range [0, 2*PI]
  azimuth: 0.4,

  // Lighting variables for grass
  ambientStrength: 0.7,
  translucencyStrength: 1.5,
  specularStrength: 0.5,
  diffuseStrength: 1.5,
  shininess: 256,
  sunColour: new Vector3(1.0, 1.0, 1.0),
  specularColour: new Vector3(1.0, 1.0, 1.0),
}

class GrassMaterial extends RawShaderMaterial {
  constructor({ width, delta, radius, texture, camera }) {
    super({
      side: DoubleSide,
      // transparent: true,
      // depthTest: true,
      // depthWrite: false,

      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uDelta: { value: delta },
        uPosX: { value: params.position.x },
        uPosZ: { value: params.position.y },
        uRadius: { value: radius },
        uWidth: { value: width },
        uMap: { value: texture.grassTexture },
        uAlphaMap: { value: texture.alphaMap },
        uNoiseTexture: { value: texture.noiseTexture },
        uSunDirection: {
          value: new Vector3(
            Math.sin(params.azimuth),
            Math.sin(params.elevation),
            -Math.cos(params.azimuth)
          ),
        },
        uCameraPosition: { value: camera.position.clone() },
        uAmbientStrength: { value: params.ambientStrength },
        uTranslucencyStrength: {
          value: params.translucencyStrength,
        },
        uDiffuseStrength: { value: params.diffuseStrength },
        uSpecularStrength: { value: params.specularStrength },
        uShininess: { value: params.shininess },
        uLightColour: { value: params.sunColour },
        uSpecularColour: { value: params.specularColour },
      },

      vertexShader,
      fragmentShader,
    })
  }
}

export default GrassMaterial
