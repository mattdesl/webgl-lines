#!/usr/bin/env node
var path = require('path')
var browserify = require('browserify')
var fs = require('fs')
var uglify = require('uglify-stream')

var folders = ['native', 'triangles', 'expanded', 'projected']
var entries = folders.map(function(f) {
  return ['./', f, '/index.js'].join('')
})

var bundles = folders.map(function(f) {
  var file = path.join('./', f, '/bundle.js')
  return fs.createWriteStream(file)
})

var b = browserify(entries)
b.plugin('factor-bundle', { outputs: bundles })
b.bundle()
  .pipe(minify())
  .pipe(fs.createWriteStream('./build/common.min.js'))

function minify() {
  return uglify({ compress: false, mangle: false })
}