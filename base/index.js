const ContextWebGL = require('webgl-context')
const Context2D = require('2d-context')
const fit = require('canvas-fit')
const loop = require('raf-loop')
const touches = require('touches')
const minstache = require('minstache')
const domify = require('domify')
const xtend = require('xtend')
const marked = require('marked')
const template = require('fs').readFileSync(`${__dirname}/template.hbs`, 'utf8')

const DPR = window.devicePixelRatio

module.exports = function(render, opt) {
  opt = opt || {}

  let isWebGL = opt.context === 'webgl'
  let context = (isWebGL ? ContextWebGL : Context2D)(opt)
  let resize = () => {
    fit(context.canvas, window, DPR)
    renderRetina(0)
  }

  window.addEventListener('resize', resize, false)
  process.nextTick(resize)
  
  let engine = loop(renderRetina)

  // window.addEventListener('mouseover', () => { engine.start() })
  // window.addEventListener('mouseout', () => { engine.stop() })
  touches(window, { filtered: true })
    .on('start', () => { engine.start() })
    .on('end', () => { engine.stop() })

  require('domready')(() => {
    document.body.style.margin = '0'
    document.body.appendChild(context.canvas)
    info(opt)
  })

  function renderRetina(dt) {
    if (!isWebGL) {
      let { width, height } = context.canvas
      context.clearRect(0, 0, width, height)
      context.save()
      context.scale(DPR, DPR)
    } else {
      let gl = context
      let width = gl.drawingBufferWidth
      let height = gl.drawingBufferHeight
      gl.clearColor(0.8,0.8,0.8,1)
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
      gl.viewport(0, 0, width, height)
    }
    render(dt)
    if (!isWebGL)
      context.restore()
  }

  return context
}

function info(opt) {
  opt = xtend({ name: '', description: '' }, opt)
  opt.name = opt.name.replace(/[\\\/]+/g, '')
  opt.description = marked(opt.description)
  let element = domify(minstache(template, opt))
  document.body.appendChild(element)
}