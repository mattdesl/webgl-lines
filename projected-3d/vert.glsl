attribute vec3 position;
attribute float direction; 
attribute vec3 next;
attribute vec3 previous;
uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform float aspect;

uniform float thickness;

// Miter joins are necessary
// for sharp edges (like a rectangle)
// to look good... but they cause artifacts
// at sharp edges. A more robust implementation
// would fall back to a different join style
// if the miter length is above a certain threshold.
// #define USE_MITER 1

void main() {
  mat4 projViewModel = projection * view * model;
  vec4 previousProjected = projViewModel * vec4(previous, 1.0);
  vec4 currentProjected = projViewModel * vec4(position, 1.0);
  vec4 nextProjected = projViewModel * vec4(next, 1.0);

  //get 2D screen space with W divide and aspect correction
  vec2 aspectVec = vec2(1.0, 1.0);
  vec2 currentScreen = currentProjected.xy / currentProjected.w * aspectVec;
  vec2 previousScreen = previousProjected.xy / previousProjected.w * aspectVec;
  vec2 nextScreen = nextProjected.xy / nextProjected.w * aspectVec;

  float halfThick = (thickness/2.0);
  float len = halfThick;
  float orientation = direction;

  //starting point uses (next - current)
  vec2 dir = vec2(0.0);
  if (currentScreen == previousScreen) {
    dir = normalize(nextScreen - currentScreen);
  } 
  //ending point uses (current - previous)
  else if (currentScreen == nextScreen) {
    dir = normalize(currentScreen - previousScreen);
  }
  //somewhere in middle, needs a join
  else {
    vec2 dirA = normalize((currentScreen - previousScreen));
    #ifdef USE_MITER
      //find the directions from (C - B) and (B - A)
      vec2 dirB = normalize((nextScreen - currentScreen));
      vec2 tangent = normalize(dirA + dirB);
      vec2 perp = vec2(-dirA.y, dirA.x);
      vec2 miter = vec2(-tangent.y, tangent.x);
      dir = tangent;
      len = halfThick / dot(miter, perp);
    #else 
      dir = dirA;
    #endif

  }
  vec2 normal = vec2(-dir.y, dir.x);
  normal *= vec2(len/aspect, len);

  vec4 offset = vec4(normal * orientation, 0.0, 1.0);
  gl_Position = currentProjected + offset;
  gl_PointSize = 1.0;
}
