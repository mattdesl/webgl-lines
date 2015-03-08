require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({3:[function(require,module,exports){
(function (__dirname){
"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var createLine = require("./gl-line-3d");
var curve = require("adaptive-bezier-curve");
var mat4 = require("gl-mat4");
var transformMat4 = require("gl-vec3/transformMat4");
var arc = require("arc-to");

var description = "_touch to animate paths_  \n3D lines expanded in screen-space  \nmiter join computed in vertex shader";

var gl = require("../base")(render, {
  name: __dirname,
  context: "webgl",
  description: description
});

var time = 0;
var projection = mat4.create();
var identity = mat4.create();
var rotation = mat4.create();
var left = mat4.create();
var leftRotation = mat4.create();
var view = mat4.create();

mat4.translate(view, view, [0, 0, -3]);
mat4.translate(left, left, [-0.25, 0.25, 0]);
mat4.scale(left, left, [0.5, 0.5, 0.5]);
mat4.scale(rotation, rotation, [0.75, 0.75, 0.75]);

var line = createLine(gl);

var spin = mat4.create();

function render(dt) {
  time += dt / 1000;
  var width = gl.drawingBufferWidth;
  var height = gl.drawingBufferHeight;

  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);

  mat4.perspective(projection, Math.PI / 4, width / height, 0, 1000);
  line.aspect = width / height;

  drawMitered();
  drawSpinning();
}

function drawSpinning() {
  mat4.rotateY(rotation, rotation, 0.01);
  mat4.identity(spin);

  //first create a circle with a small radius
  var path = arc(0, 0, 1, 0, Math.PI * 1.5, false, 256);
  path = path.map(function (point, i) {
    var _point = _slicedToArray(point, 3);

    var x = _point[0];
    var y = _point[1];
    var z = _point[2];

    var v3 = [x || 0, y || 0, z || 0];
    mat4.rotateY(spin, spin, Math.sin(x / 10 * Math.sin(time / 1)));
    transformMat4(v3, v3, spin);
    return v3;
  });

  line.color = [0.2, 0.2, 0.2];
  line.projection = projection;
  line.model = rotation;
  line.view = view;
  line.update(path);
  line.thickness = 0.21;
  line.miter = 0;
  line.draw();
}

function drawMitered() {
  mat4.identity(leftRotation);
  mat4.multiply(leftRotation, leftRotation, left);
  mat4.rotateY(leftRotation, leftRotation, Math.sin(time) * 0.8);

  var path = [[0, -1], [1, -1], [0, 0], [1, 0], [0.25, -0.75]];
  line.projection = projection;

  line.model = leftRotation;
  line.color = [0.8, 0.8, 0.8];
  line.view = view;
  line.update(path);
  line.thickness = 0.1;
  line.miter = 1;
  line.draw();
}

}).call(this,"/projected")
},{"../base":5,"./gl-line-3d":115,"adaptive-bezier-curve":10,"arc-to":11,"gl-mat4":48,"gl-vec3/transformMat4":78}],115:[function(require,module,exports){
"use strict";

var _slicedToArray = function(arr, i) {
    if (Array.isArray(arr)) {
        return arr;
    } else if (Symbol.iterator in Object(arr)) {
        var _arr = [];

        for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done; ) {
            _arr.push(_step.value);

            if (i && _arr.length === i)
                break;
        }

        return _arr;
    } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
};

var getNormals = require("polyline-normals");
var createBuffer = require("gl-buffer");
var createVAO = require("gl-vao");
var createElements = require("quad-indices");
var pack = require("array-pack-2d");
var identity = require("gl-mat4/identity");
var _require = require("../base/line-utils");
var duplicate = _require.duplicate;
var createIndices = _require.createIndices;
var clamp = require("clamp");
var glslify = require("glslify");
var createShader = require("glslify/adapter.js")("\n#define GLSLIFY 1\n\nattribute vec3 position;\nattribute float direction;\nattribute vec3 next;\nattribute vec3 previous;\nuniform mat4 projection;\nuniform mat4 model;\nuniform mat4 view;\nuniform float aspect;\nuniform float thickness;\nuniform int miter;\nvoid main() {\n  vec2 aspectVec = vec2(aspect, 1.0);\n  mat4 projViewModel = projection * view * model;\n  vec4 previousProjected = projViewModel * vec4(previous, 1.0);\n  vec4 currentProjected = projViewModel * vec4(position, 1.0);\n  vec4 nextProjected = projViewModel * vec4(next, 1.0);\n  vec2 currentScreen = currentProjected.xy / currentProjected.w * aspectVec;\n  vec2 previousScreen = previousProjected.xy / previousProjected.w * aspectVec;\n  vec2 nextScreen = nextProjected.xy / nextProjected.w * aspectVec;\n  float len = thickness;\n  float orientation = direction;\n  vec2 dir = vec2(0.0);\n  if(currentScreen == previousScreen) {\n    dir = normalize(nextScreen - currentScreen);\n  } else if(currentScreen == nextScreen) {\n    dir = normalize(currentScreen - previousScreen);\n  } else {\n    vec2 dirA = normalize((currentScreen - previousScreen));\n    if(miter == 1) {\n      vec2 dirB = normalize((nextScreen - currentScreen));\n      vec2 tangent = normalize(dirA + dirB);\n      vec2 perp = vec2(-dirA.y, dirA.x);\n      vec2 miter = vec2(-tangent.y, tangent.x);\n      dir = tangent;\n      len = thickness / dot(miter, perp);\n    } else {\n      dir = dirA;\n    }\n  }\n  vec2 normal = vec2(-dir.y, dir.x);\n  normal *= len / 2.0;\n  normal.x /= aspect;\n  vec4 offset = vec4(normal * orientation, 0.0, 1.0);\n  gl_Position = currentProjected + offset;\n  gl_PointSize = 1.0;\n}", "\n#define GLSLIFY 1\n\n#ifdef GL_ES\n\nprecision mediump float;\n#endif\n\nuniform vec3 color;\nvoid main() {\n  gl_FragColor = vec4(color, 1.0);\n}", [{"name":"projection","type":"mat4"},{"name":"model","type":"mat4"},{"name":"view","type":"mat4"},{"name":"aspect","type":"float"},{"name":"thickness","type":"float"},{"name":"miter","type":"int"},{"name":"color","type":"vec3"}], [{"name":"position","type":"vec3"},{"name":"direction","type":"float"},{"name":"next","type":"vec3"},{"name":"previous","type":"vec3"}]);

module.exports = function(gl, opt) {
    var shader = createShader(gl);
    shader.bind();
    shader.attributes.position.location = 0;
    shader.attributes.direction.location = 1;
    shader.attributes.next.location = 2;
    shader.attributes.previous.location = 3;
    var indexBuffer = emptyBuffer(Uint16Array, gl.ELEMENT_ARRAY_BUFFER);
    var positionBuffer = emptyBuffer();
    var previousBuffer = emptyBuffer();
    var nextBuffer = emptyBuffer();
    var directionBuffer = emptyBuffer();
    var count = 0;
    var vao = createVAO(gl);

    function update(path) {
        if (path.length > 0 && path[0].length !== 3) {
            path = path.map(function(point) {
                var _point = _slicedToArray(point, 3);
                var x = _point[0];
                var y = _point[1];
                var z = _point[2];
                return [x || 0, y || 0, z || 0];
            });
        }

        count = (path.length - 1) * 6;

        var direction = duplicate(path.map(function(x) {
            return 1;
        }), true);

        var positions = duplicate(path);
        var previous = duplicate(path.map(relative(-1)));
        var next = duplicate(path.map(relative(+1)));
        var indexUint16 = createIndices(path.length);
        positionBuffer.update(pack(positions));
        previousBuffer.update(pack(previous));
        nextBuffer.update(pack(next));
        directionBuffer.update(pack(direction));
        indexBuffer.update(indexUint16);

        vao.update([{
            buffer: positionBuffer,
            size: 3
        }, {
            buffer: directionBuffer,
            size: 1
        }, {
            buffer: nextBuffer,
            size: 3
        }, {
            buffer: previousBuffer,
            size: 3
        }], indexBuffer);
    }

    var model = identity([]);
    var projection = identity([]);
    var view = identity([]);
    var thickness = 1;
    var aspect = 1;
    var miter = 0;
    var color = [1, 1, 1];

    return {
        update: update,
        model: model,
        view: view,
        projection: projection,
        thickness: thickness,
        color: color,
        miter: miter,
        aspect: aspect,

        draw: function draw() {
            shader.bind();
            shader.uniforms.model = this.model;
            shader.uniforms.view = this.view;
            shader.uniforms.projection = this.projection;
            shader.uniforms.color = this.color;
            shader.uniforms.thickness = this.thickness;
            shader.uniforms.aspect = this.aspect;
            shader.uniforms.miter = this.miter;
            vao.bind();
            vao.draw(gl.TRIANGLES, count);
            vao.unbind();
        }
    };

    function emptyBuffer(arrayType, type) {
        arrayType = arrayType || Float32Array;
        return createBuffer(gl, new arrayType(), type || gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
    }
};

function relative(offset) {
    return function(point, index, list) {
        index = clamp(index + offset, 0, list.length - 1);
        return list[index];
    };
}
},{"../base/line-utils":6,"array-pack-2d":12,"clamp":22,"gl-buffer":34,"gl-mat4/identity":47,"gl-vao":70,"glslify":81,"glslify/adapter.js":80,"polyline-normals":96,"quad-indices":98}],22:[function(require,module,exports){
module.exports = clamp

function clamp(value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value)
}

},{}],78:[function(require,module,exports){
module.exports = transformMat4;

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
function transformMat4(out, a, m) {
    var x = a[0], y = a[1], z = a[2],
        w = m[3] * x + m[7] * y + m[11] * z + m[15]
    w = w || 1.0
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w
    return out
}
},{}],11:[function(require,module,exports){
//if 'steps' is not specified, we'll just approximate it
module.exports = function arc(x, y, radius, start, end, clockwise, steps, path) {
    if (!path)
        path = []

    x = x||0
    y = y||0
    radius = radius||0
    start = start||0
    end = end||0

    //determine distance between the two angles
    //...probably a nicer way of writing this
    var dist = Math.abs(start-end)
    if (!clockwise && start > end)
        dist = 2*Math.PI - dist
    else if (clockwise && end > start)
        dist = 2*Math.PI - dist

    //approximate the # of steps using the cube root of the radius
    if (typeof steps !== 'number') 
        steps = Math.max(6, Math.floor(6 * Math.pow(radius, 1/3) * (dist / (Math.PI))))

    //ensure we have at least 3 steps..
    steps = Math.max(steps, 3)
    
    var f = dist / (steps),
        t = start

    //modify direction
    f *= clockwise ? -1 : 1

    for (var i=0; i<steps+1; i++) {
        var cs = Math.cos(t),
            sn = Math.sin(t)

        var nx = x + cs*radius,
            ny = y + sn*radius

        path.push([ nx, ny ])

        t += f
    }
    return path
}
},{}]},{},[3]);
