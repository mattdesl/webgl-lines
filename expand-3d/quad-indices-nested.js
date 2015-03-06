var create = require('quad-indices')

module.exports = function(opt) {
    var indices = create(opt)
    return unflatten(indices, 3)
}

function unflatten(array, stride) {
    var out = []
    for (var i=0; i<array.length; i+=stride) {
        var slice = []
        for (var j=0; j<stride; j++) 
            slice.push(array[i + j])
        out.push(slice)
    }
    return out
}