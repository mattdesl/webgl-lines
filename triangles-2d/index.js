const MAX_POINTS = 8, MIN_DIST = 20
const distance = require('vectors/dist')(2)
const throttle = require('lodash.throttle')
const random = require('randf')

let stroke = require('extrude-polyline')({
  thickness: 20,
  join: 'miter',
  cap: 'square'
})

let context = require('../base')(render, {
  name: __dirname,
  description: 'touch and drag to draw a line with triangles'
})

let canvas = context.canvas
let path = [[40,105],[60,98],[84,100],[96,116],[111,133],[135,140],[153,130]]
let colors = [
    '#4f4f4f',
    '#767676',
    '#d9662d',
    '#d98a2d'
]

let lastPosition = path[path.length-1]

function render(dt) {
  let { width, height } = canvas
  context.clearRect(0, 0, width, height)

  let mesh = stroke.build(path)
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
}

let adder = throttle(addPoint, 30)
let dragging = false

require('touches')(window, { filtered: true })
  .on('move', adder)
  .on('start', () => { //clear path on click
    path.length = 0
    stroke.thickness = random(10, 30)
    dragging = true
  })
  .on('end', () => {
    dragging = false
  })

function addPoint(ev, position) {
  if (!dragging)
    return
  //limit our path by distance and capacity
  if (distance(position, lastPosition) < MIN_DIST)
    return
  if (path.length > MAX_POINTS)
    path.shift()
  path.push(position)
  lastPosition = position
}