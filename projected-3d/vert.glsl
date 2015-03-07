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

  //end point
  if (currentScreen == nextScreen) {
    currentScreen = previousScreen;
  }
  //start point
  else if (currentScreen == previousScreen) {

  }

  //Single segment
  //find the normal from (B - A)
  vec2 dir = normalize(nextScreen - currentScreen);
  vec2 normal = vec2(-dir.y, dir.x);
  float halfThick = (thickness/2.0) * direction / currentProjected.w;
  gl_Position = currentProjected + vec4(normal * halfThick, 0.0, 0.0);
    
  gl_PointSize = 1.0;
}
