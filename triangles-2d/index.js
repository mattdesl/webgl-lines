const MAX_POINTS = 8, MIN_DIST = 10
const distance = require('vectors/dist')(2)

let stroke = require('extrude-polyline')({
  thickness: 20,
  join: 'miter',
  cap: 'square'
})

let context = require('../base')(render, {
  name: __dirname,
  description: 'click to draw a line with triangles'
})

let canvas = context.canvas
let path = []
let colors = [
    '#4f4f4f',
    '#767676',
    '#d9662d',
    '#d98a2d'
]

let lastPosition = [0, 0]

function render(dt) {
  let { width, height } = canvas
  context.clearRect(0, 0, width, height)

  let dpr = window.devicePixelRatio
  let mesh = stroke.build(path)
  context.save()
  context.scale(dpr, dpr)
  mesh.cells.forEach((cell, i) => {
    let [ f0, f1, f2 ] = cell
    let v0 = mesh.positions[f0],
        v1 = mesh.positions[f1],
        v2 = mesh.positions[f2]
    context.beginPath()
    context.lineTo(v0[0], v0[1])
    context.lineTo(v1[0], v1[1])
    context.lineTo(v2[0], v2[1])
    context.fillStyle = colors[i % colors.length]
    context.fill()
  })
  context.restore()
}

require('touches')(window)
  .on('start', addPoint)
  .on('move', addPoint)

function addPoint(ev, position) {
  //limit our path by distance and capacity
  if (distance(position, lastPosition) < MIN_DIST)
    return
  if (path.length > MAX_POINTS)
    path.shift()
  path.push(position)
  lastPosition = position
}