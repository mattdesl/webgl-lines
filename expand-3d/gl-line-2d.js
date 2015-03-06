const getNormals = require('polyline-normals')
const createBuffer = require('gl-buffer')
const createVAO = require('gl-vao')
const createElements = require('quad-indices')
const pack = require('array-pack-2d')
const identity = require('gl-mat4/identity')

const glslify = require('glslify')
const createShader = glslify({
  vertex: './vert.glsl',
  fragment: './frag.glsl'
})

module.exports = function(gl, opt) {
  let shader = createShader(gl)
  shader.bind()
  shader.attributes.position.location = 0
  shader.attributes.normal.location = 1
  shader.attributes.miter.location = 2
  
  let indexBuffer = emptyBuffer(Uint16Array, gl.ELEMENT_ARRAY_BUFFER)
  let positionBuffer = emptyBuffer()
  let normalBuffer = emptyBuffer()
  let miterBuffer = emptyBuffer()
  let count = 0
  let vao = createVAO(gl)

  //in real-world you wouldn't want to create so
  //many typed arrays per frame
  function update(path, closed) {
    let tags = getNormals(path, closed)

    //and update our VAO
    if (closed) {
        path = path.slice()
        path.push(path[0])
        tags.push(tags[0])
    }
    
    let normals = tags.map(x => x[0])
    let miters = tags.map(x => x[1])
    count = (path.length-1) * 6

    //our vertex attributes (positions, normals) need to be duplicated
    //the only difference is that one has a negative miter length
    normals = duplicate(normals)
    miters = duplicate(miters, true)
    let positions = duplicate(path)
    let indexUint16 = createIndices(path.length)

    //now update the buffers with float/short data
    positionBuffer.update(pack(positions))
    normalBuffer.update(pack(normals))
    miterBuffer.update(pack(miters))
    indexBuffer.update(indexUint16)

    vao.update([ 
      { buffer: positionBuffer, size: 2 },
      { buffer: normalBuffer, size: 2 },
      { buffer: miterBuffer, size: 1 }
    ], indexBuffer)
  }

  //default uniforms
  let model = identity([])
  let projection = identity([])
  let view = identity([])
  let thickness = 1
  let inner = 0
  let color = [1,1,1]

  return { 
    update,
    model,
    view,
    projection,
    thickness,
    color,
    inner,

    draw() {
      shader.bind()
      shader.uniforms.model = this.model
      shader.uniforms.view = this.view
      shader.uniforms.projection = this.projection
      shader.uniforms.color = this.color
      shader.uniforms.thickness = this.thickness
      shader.uniforms.inner = this.inner

      vao.bind()
      vao.draw(gl.TRIANGLES, count)
      vao.unbind()
    }
  }

  function emptyBuffer(arrayType, type) {
    arrayType = arrayType || Float32Array
    return createBuffer(gl, new arrayType(), type || gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW)
  }
}

//we need to duplicate vertex attributes to expand in the shader
//and mirror the normals
function duplicate(nestedArray, mirror) {
  var out = []
  nestedArray.forEach(x => {
    let x1 = mirror ? -x : x
    out.push(x1, x)
  })
  return out
}

//counter-clockwise indices but prepared for duplicate vertices
function createIndices(length) {
  let indices = new Uint16Array(length * 6)
  let c = 0, index = 0
  for (let j=0; j<length; j++) {
    let i = index
    indices[c++] = i + 0 
    indices[c++] = i + 1 
    indices[c++] = i + 2 
    indices[c++] = i + 2 
    indices[c++] = i + 1 
    indices[c++] = i + 3 
    index += 2
  }
  return indices
}