precision mediump float;

uniform vec3 uCameraPosition;

// Light uniforms
uniform float uAmbientStrength;
uniform float uDiffuseStrength;
uniform float uSpecularStrength;
uniform float uTranslucencyStrength;
uniform float uShininess;
uniform float uOpacity;
uniform vec3 uLightColour;
uniform vec3 uSunDirection;

// Surface uniforms
uniform sampler2D uMap;
uniform sampler2D uAlphaMap;
uniform vec3 uSpecularColour;

varying float frc;
varying float idx;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

vec3 ACESFilm(vec3 x){
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

void main() {
  // If transparent, don't draw
  if(texture2D(uAlphaMap, vUv).r < 0.15){
    discard;
  }

  vec3 normal;

  // Flip normals when viewing reverse of the blade
  if(gl_FrontFacing){
      normal = normalize(vNormal);
  }else{
      normal = normalize(-vNormal);
  }

  // Get colour data from texture
  vec3 textureColour = pow(texture2D(uMap, vUv).rgb, vec3(2.2));
  
  // Add different green tones towards root
  vec3 mixColour = idx > 0.75 ? vec3(0.07, 0.52, 0.06) : vec3(0.07, 0.43, 0.08);
  textureColour = mix(pow(mixColour, vec3(2.2)), textureColour, frc);
  vec3 lightTimesTexture = uLightColour * textureColour;
  vec3 ambient = textureColour;
  vec3 lightDir = normalize(uSunDirection);
  
  // How much a fragment faces the light
  float dotNormalLight = dot(normal, lightDir);
  float diff = max(dotNormalLight, 0.0);

  // Colour when lit by light
  vec3 diffuse = diff * lightTimesTexture;
  float sky = max(dot(normal, vec3(0,1,0)), 0.0);
  vec3 skyLight = sky * vec3(0.12, 0.29, 0.55);
  vec3 viewDirection = normalize(uCameraPosition - vPosition);
  vec3 halfwayDir = normalize(lightDir + viewDirection);
  
  // How much a fragment directly reflects the light to the camera
  float spec = pow(max(dot(normal, halfwayDir), 0.0), uShininess);
  
  // Colour of light sharply reflected into the camera
  vec3 specular = spec * uSpecularColour * uLightColour;

  // https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Translucent_Surfaces
  vec3 diffuseTranslucency = vec3(0);
  vec3 forwardTranslucency = vec3(0);
  float dotViewLight = dot(-lightDir, viewDirection);
  if(dotNormalLight <= 0.0){
    diffuseTranslucency = lightTimesTexture * uTranslucencyStrength * -dotNormalLight;
    if(dotViewLight > 0.0){
        forwardTranslucency = lightTimesTexture * uTranslucencyStrength * pow(dotViewLight, 16.0);
    }
  }
  vec3 col = 0.3 * skyLight * textureColour + uAmbientStrength * ambient + uDiffuseStrength * diffuse + uSpecularStrength * specular + diffuseTranslucency + forwardTranslucency;
  
  // Tonemapping
  col = ACESFilm(col);
  
  // Gamma correction 1.0/2.2 = 0.4545...
  col = pow(col, vec3(0.4545));
 
  // Add a shadow towards root
  col = mix(vec3(0.0, 0.2, 0.0), col, frc);
  
  gl_FragColor = vec4(col, uOpacity);
}