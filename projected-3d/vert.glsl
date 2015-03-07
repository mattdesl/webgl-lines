attribute vec3 position;
attribute float direction; 
attribute vec3 next;
attribute vec3 previous;
uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

uniform float thickness;

void main() {
  mat4 projViewModel = projection * view * model;
  vec4 previousProjected = projViewModel * vec4(previous, 1.0);
  vec4 currentProjected = projViewModel * vec4(position, 1.0);
  vec4 nextProjected = projViewModel * vec4(next, 1.0);

  //get 2D screen space with W divide
  vec2 currentScreen = currentProjected.xy / currentProjected.w;
  vec2 previousScreen = previousProjected.xy / previousProjected.w;
  vec2 nextScreen = nextProjected.xy / nextProjected.w;

  //end point, no next segment
  if (currentScreen == nextScreen) {
    currentScreen = previousScreen;
  } else if (currentScreen == previousScreen) {
  }

  float PI = 3.14159;
  float PI2 = PI * 2.0;

  vec2 delta1 = currentScreen - previousScreen;
  vec2 delta2 = currentScreen - nextScreen;

  float angle1 = atan(delta1.y, delta1.x);
  float angle2 = atan(delta2.y, delta2.x);
  if (angle1 - angle2 > PI) {
    angle2 += PI2;
  }
  if (angle2 - angle1 > PI) {
    angle1 += PI2;
  }
  float angle = (angle1 + angle2) / 2.0;
  vec2 offset = vec2(cos(angle), sin(angle)) * direction * thickness * currentProjected.w;
  gl_Position = currentProjected + vec4(offset, 0.0, 0.0);


  

  // //Single segment
  // //find the normal from (B - A)
  // vec2 dir = normalize(nextScreen - currentScreen);
  // vec2 normal = vec2(-dir.y, dir.x);

  // float halfThick = (thickness/2.0) * direction;
  // vec4 offset = vec4(normal * halfThick * currentProjected.w, 0.0, 0.0);
  // gl_Position = currentProjected + offset;
    
  gl_PointSize = 1.0;
}
