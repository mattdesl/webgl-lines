const MAX_POINTS = 8, MIN_DIST = 20
const distance = require('vectors/dist')(2)
const throttle = require('lodash.throttle')
const random = require('randf')
const curve = require('adaptive-bezier-curve')

let stroke = require('extrude-polyline')({
  thickness: 20,
  join: 'miter',
  miterLimit: 2,
  cap: 'square'
})

let context = require('../base')(render, {
  name: __dirname,
  description: `_toch and drag to draw_  
rendering with triangles  `
})

let canvas = context.canvas
let colors = [
    '#4f4f4f',
    '#767676',
    '#d9662d',
    '#d98a2d'
]

let path = getInitialPath()
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

require('touches')(document, { filtered: true })
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

//gets a nice curved stroke to start off
function getInitialPath() {
  let width2 = window.innerWidth/2
  let height2 = window.innerHeight/2
  let len = Math.min(100, window.innerWidth*0.25), off = 100
  return curve(
    [width2-len, height2], 
    [width2-len/2, height2-off], 
    [width2+len/2, height2+off], 
    [width2+len, height2],
    0.1 //scaling factor
  ).slice(0, MAX_POINTS)
}