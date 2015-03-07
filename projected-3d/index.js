const createLine = require('./gl-line-3d')
const curve = require('adaptive-bezier-curve')
const mat4 = require('gl-mat4')
const transformMat4 = require('gl-vec3/transformMat4')
const arc = require('arc-to')

let gl = require('../base')(render, {
  name: __dirname,
  context: 'webgl',
  description: `projected and miter-joined in screen space  
  touch to animate paths`
})

let time = 0
let projection = mat4.create()
let identity = mat4.create()
let rotation = mat4.create()
let left = mat4.create()
let leftRotation = mat4.create()
let view = mat4.create()

mat4.translate(view, view, [0.0, 0.0, -3])
mat4.translate(left, left, [-0.25, 0.25, 0.0])
mat4.scale(left, left, [0.5, 0.5, 0.5])
mat4.scale(rotation, rotation, [0.75, 0.75, 0.75])

let line = createLine(gl)

let spin = mat4.create()


function render(dt) {
  time += dt/1000
  let width = gl.drawingBufferWidth
  let height = gl.drawingBufferHeight

  gl.enable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)

  mat4.perspective(projection, Math.PI/4, width/height, 0, 1000)
  line.aspect = width/height

  drawMitered()
  drawSpinning()
}

function drawSpinning() {
  mat4.rotateY(rotation, rotation, 0.01)
  mat4.identity(spin)

  //first create a circle with a small radius
  let path = arc(0, 0, 1, 0, Math.PI*1.5, false, 256)
  path = path.map((point, i) => {
    let [x, y, z] = point
    let v3 = [x||0, y||0, z||0]
    mat4.rotateY(spin, spin, Math.sin(x/10 * Math.sin(time/1)))
    transformMat4(v3, v3, spin)
    return v3
  })

  line.color = [0.2, 0.2, 0.2]
  line.projection = projection
  line.model = rotation
  line.view = view
  line.update(path)
  line.thickness = 0.21
  line.miter = 0
  line.draw()
}

function drawMitered() {
  mat4.identity(leftRotation)
  mat4.multiply(leftRotation, leftRotation, left)
  mat4.rotateY(leftRotation, leftRotation, Math.sin(time)*0.8)

  let path = [
    [0, -1], [1, -1],
    [0, 0], [1, 0],
    [0.25, -0.75]
  ]
  line.projection = projection

  line.model = leftRotation
  line.color = [0.8, 0.8, 0.8]
  line.view = view
  line.update(path)
  line.thickness = 0.1
  line.miter = 1
  line.draw()
}
