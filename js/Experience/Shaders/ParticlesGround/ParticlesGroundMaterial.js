import { ShaderMaterial, AdditiveBlending, Color } from 'three'

import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'

class ParticlesGroundMaterial extends ShaderMaterial {
  constructor(color1 = 'hotpink', color2 = 'lightgreen') {
    super({
      // transparent: true,
      // blending: AdditiveBlending,
      // depthWrite: false,

      uniforms: {
        uColor1: { value: new Color(color1) },
        uColor2: { value: new Color(color2) },
        uTime: { value: 0 },
        uScale: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    })
  }
}

export default ParticlesGroundMaterial
