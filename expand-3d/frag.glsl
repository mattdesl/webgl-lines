#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 color;
uniform float inner;
varying float edge;

const vec3 color2 = vec3(0.8);

void main() {
  float v = 1.0 - abs(edge);
  v = smoothstep(0.65, 0.7, v*inner); 
  gl_FragColor = mix(vec4(color, 1.0), vec4(0.0), v);
}
