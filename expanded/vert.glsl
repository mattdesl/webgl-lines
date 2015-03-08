attribute vec2 position;
attribute vec2 normal;
attribute float miter; 
uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform float thickness;
varying float edge;

void main() {
  edge = sign(miter);
  vec2 pointPos = position.xy + vec2(normal * thickness/2.0 * miter);
  gl_Position = projection * view * model * vec4(pointPos, 0.0, 1.0);
  gl_PointSize = 1.0;
}
