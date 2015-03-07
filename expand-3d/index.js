const createLine = require('./gl-line-2d')
const curve = require('adaptive-bezier-curve')
const mat4 = require('gl-mat4')

let gl = require('../base')(render, {
  name: __dirname,
  context: 'webgl',
  description: `lines expanded in a vertex shader  
  touch to animate`
})

let time = 0
let projection = mat4.create()
let identity = mat4.create()
let rotation = mat4.create()
let view = mat4.create()

mat4.translate(view, view, [0.5, 0.0, -3])
mat4.scale(rotation, rotation, [0.3, 0.3, 0.3])
mat4.rotateY(rotation, rotation, 1)
let line = createLine(gl)

function render(dt) {
  time += dt/1000
  let width = gl.drawingBufferWidth
  let height = gl.drawingBufferHeight

  gl.disable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)
  gl.enable(gl.BLEND)

  line.color = [0.2, 0.2, 0.2]

  mat4.rotateY(rotation, rotation, 0.01)
  drawBox(width, height)  
  drawCurve(width, height)
}

//draw a thick-lined rectangle in 3D space
function drawBox(width, height) {
  mat4.perspective(projection, Math.PI/4, width/height, 0, 1000)

  let path = [ 
    [-1, -1], [1, -1], 
    [1, 1], [-1, 1]
  ]

  line.update(path, true)
  line.model = rotation
  line.view = view
  line.projection = projection
  line.thickness = 0.4
  line.inner = 0
  line.draw()
}

//draw a bezier curve in 2D orthographic space,
function drawCurve(width, height) {
  //top-left ortho projection
  mat4.ortho(projection, 0, width, height, 0, 0, 1)
  line.projection = projection
  //reset others to identity  
  line.model = identity
  line.view = identity

  //get a new curve based on animation
  let x = 100
  let y = height/2
  let t = Math.sin(time)*100 + y
  let path = curve([x, y], [x+150, y + 100-t], [x+20, y + t - 50], [x+200, y])

  //also add in sharp edges to demonstrate miter joins
  path.push([350, y+25])
  path.unshift([x-50, y-25])

  line.update(path)
  line.thickness = Math.sin(time) * 10 + 30
  line.inner = Math.sin(time)/2+0.5
  line.draw()
}