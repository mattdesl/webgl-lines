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

module.exports = function(render, opt) {
  opt = opt || {}

  let context = (opt.context === 'webgl' ? ContextWebGL : Context2D)(opt)
  let resize = () => {
    fit(context.canvas, window, window.devicePixelRatio)
    render(0)
  }

  window.addEventListener('resize', resize, false)
  process.nextTick(resize)
  
  let engine = loop(render)

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

  return context
}

function info(opt) {
  opt = xtend({ name: '', description: '' }, opt)
  opt.name = opt.name.replace(/[\\\/]+/g, '')
  opt.description = marked(opt.description)
  let element = domify(minstache(template, opt))
  document.body.appendChild(element)
}