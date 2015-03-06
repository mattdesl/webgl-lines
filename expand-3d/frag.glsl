#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 color;
uniform float inner;
varying float edge;

const vec3 color2 = vec3(0.5);

void main() {
  float v = 1.0 - abs(edge);
  v = smoothstep(0.65, 0.7, v*inner); 

  gl_FragColor = vec4(mix(color, color2, v), 1.0);
}
