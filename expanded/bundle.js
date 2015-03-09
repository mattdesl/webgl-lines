require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (__dirname){
"use strict";

var createLine = require("./gl-line-2d");
var curve = require("adaptive-bezier-curve");
var mat4 = require("gl-mat4");

var gl = require("../base")(render, {
  name: __dirname,
  context: "webgl",
  description: "\n_touch to animate_  \n2D lines expanded in a vertex shader  \n"
});

var time = 0;
var projection = mat4.create();
var identity = mat4.create();
var rotation = mat4.create();
var view = mat4.create();

mat4.translate(view, view, [0.5, 0, -3]);
mat4.scale(rotation, rotation, [0.5, 0.5, 0.5]);
mat4.rotateY(rotation, rotation, -0.5);
var line = createLine(gl);

function render(dt) {
  time += dt / 1000;
  var width = gl.drawingBufferWidth;
  var height = gl.drawingBufferHeight;

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);

  line.color = [0.2, 0.2, 0.2];
  gl.clear(gl.DEPTH_BUFFER_BIT);
  mat4.rotateY(rotation, rotation, 0.01);
  drawBox(width, height);
  drawCurve(width, height);
}

//draw a thick-lined rectangle in 3D space
function drawBox(width, height) {
  mat4.perspective(projection, Math.PI / 4, width / height, 0, 100);

  var path = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

  line.update(path, true);
  line.model = rotation;
  line.view = view;
  line.projection = projection;
  line.thickness = 0.2;
  line.inner = 0;
  line.draw();
}

//draw a bezier curve in 2D orthographic space,
function drawCurve(width, height) {
  //top-left ortho projection
  mat4.ortho(projection, 0, width, height, 0, 0, 1);
  line.projection = projection;
  //reset others to identity 
  line.model = identity;
  line.view = identity;

  //get a bezier curve
  var x = width / 4,
      y = height / 2;
  var off = 200;
  var len = 100;
  var path = curve([x - len, y], [x, y + off], [x + len / 2, y - off], [x + len, y]);

  //also add in sharp edges to demonstrate miter joins
  path.push([x + len + 50, y + 25]);
  path.unshift([x - len - 50, y + 25]);

  line.update(path);
  line.thickness = (Math.sin(time) / 2 + 0.5) * 30 + 10;
  line.inner = Math.sin(time) / 2 + 0.5;
  line.draw();
}

}).call(this,"/expanded")
},{"../base":5,"./gl-line-2d":7,"adaptive-bezier-curve":10,"gl-mat4":66}],7:[function(require,module,exports){
"use strict";
var getNormals = require("polyline-normals");
var createBuffer = require("gl-buffer");
var createVAO = require("gl-vao");
var pack = require("array-pack-2d");
var identity = require("gl-mat4/identity");
var lineUtils = require("../base/line-utils");
var glslify = require("glslify");
var createShader = require("glslify/adapter.js")("\n#define GLSLIFY 1\n\nattribute vec2 position;\nattribute vec2 normal;\nattribute float miter;\nuniform mat4 projection;\nuniform mat4 model;\nuniform mat4 view;\nuniform float thickness;\nvarying float edge;\nvoid main() {\n  edge = sign(miter);\n  vec2 pointPos = position.xy + vec2(normal * thickness / 2.0 * miter);\n  gl_Position = projection * view * model * vec4(pointPos, 0.0, 1.0);\n  gl_PointSize = 1.0;\n}", "\n#define GLSLIFY 1\n\n#ifdef GL_ES\n\nprecision mediump float;\n#endif\n\nuniform vec3 color;\nuniform float inner;\nvarying float edge;\nconst vec3 color2 = vec3(0.8);\nvoid main() {\n  float v = 1.0 - abs(edge);\n  v = smoothstep(0.65, 0.7, v * inner);\n  gl_FragColor = mix(vec4(color, 1.0), vec4(0.0), v);\n}", [{"name":"projection","type":"mat4"},{"name":"model","type":"mat4"},{"name":"view","type":"mat4"},{"name":"thickness","type":"float"},{"name":"color","type":"vec3"},{"name":"inner","type":"float"}], [{"name":"position","type":"vec2"},{"name":"normal","type":"vec2"},{"name":"miter","type":"float"}]);

module.exports = function(gl, opt) {
    var shader = createShader(gl);
    shader.bind();
    shader.attributes.position.location = 0;
    shader.attributes.normal.location = 1;
    shader.attributes.miter.location = 2;
    var indexBuffer = emptyBuffer(Uint16Array, gl.ELEMENT_ARRAY_BUFFER);
    var positionBuffer = emptyBuffer();
    var normalBuffer = emptyBuffer();
    var miterBuffer = emptyBuffer();
    var count = 0;
    var vao = createVAO(gl);

    function update(path, closed) {
        var tags = getNormals(path, closed);

        if (closed) {
            path = path.slice();
            path.push(path[0]);
            tags.push(tags[0]);
        }

        var normals = tags.map(function(x) {
            return x[0];
        });

        var miters = tags.map(function(x) {
            return x[1];
        });

        count = (path.length - 1) * 6;
        normals = lineUtils.duplicate(normals);
        miters = lineUtils.duplicate(miters, true);
        var positions = lineUtils.duplicate(path);
        var indexUint16 = lineUtils.createIndices(path.length);
        positionBuffer.update(pack(positions));
        normalBuffer.update(pack(normals));
        miterBuffer.update(pack(miters));
        indexBuffer.update(indexUint16);

        vao.update([{
            buffer: positionBuffer,
            size: 2
        }, {
            buffer: normalBuffer,
            size: 2
        }, {
            buffer: miterBuffer,
            size: 1
        }], indexBuffer);
    }

    var model = identity([]);
    var projection = identity([]);
    var view = identity([]);
    var thickness = 1;
    var inner = 0;
    var color = [1, 1, 1];

    return {
        update: update,
        model: model,
        view: view,
        projection: projection,
        thickness: thickness,
        color: color,
        inner: inner,

        draw: function draw() {
            shader.bind();
            shader.uniforms.model = this.model;
            shader.uniforms.view = this.view;
            shader.uniforms.projection = this.projection;
            shader.uniforms.color = this.color;
            shader.uniforms.thickness = this.thickness;
            shader.uniforms.inner = this.inner;
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
},{"../base/line-utils":6,"array-pack-2d":12,"gl-buffer":40,"gl-mat4/identity":65,"gl-vao":91,"glslify":95,"glslify/adapter.js":94,"polyline-normals":101}]},{},[1]);
