//we need to duplicate vertex attributes to expand in the shader
//and mirror the normals
module.exports.duplicate = function duplicate(nestedArray, mirror) {
  var out = []
  nestedArray.forEach(x => {
    let x1 = mirror ? -x : x
    out.push(x1, x)
  })
  return out
}

//counter-clockwise indices but prepared for duplicate vertices
module.exports.createIndices = function createIndices(length) {
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