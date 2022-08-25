uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;

varying vec3 vPosition;

void main()
{
    // vec3 red = vec3(1.0, 0.0, 0.0);
    // vec3 yelloe = vec3(1.0, 1.0, 0.0);

    float depth =  vPosition.z * 0.5 + 0.5;
    vec3 color =  mix(uColor1, uColor2, depth);

    gl_FragColor = vec4(color, depth);

    // float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    // float strength = 0.05 / distanceToCenter - 0.1;

    // gl_FragColor = vec4(color, strength);

    // float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    // float strength = 0.05 / distanceToCenter - 0.1;

    // gl_FragColor = vec4(1.0, 1.0, 1.0, strength);
}