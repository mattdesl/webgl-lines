require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({4:[function(require,module,exports){
(function (__dirname){
"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var MAX_POINTS = 8,
    MIN_DIST = 20;
var distance = require("vectors/dist")(2);
var throttle = require("lodash.throttle");
var random = require("randf");

var stroke = require("extrude-polyline")({
  thickness: 20,
  join: "miter",
  miterLimit: 2,
  cap: "square"
});

var context = require("../base")(render, {
  name: __dirname,
  description: "_toch and drag to draw_  \nrendering with triangles  "
});

var canvas = context.canvas;
var path = [[240, 155], [260, 148], [284, 150], [296, 166], [311, 183], [335, 190], [353, 180]];

var colors = ["#4f4f4f", "#767676", "#d9662d", "#d98a2d"];

var lastPosition = path[path.length - 1];

function render(dt) {
  var width = canvas.width;
  var height = canvas.height;

  context.clearRect(0, 0, width, height);

  var mesh = stroke.build(path);
  mesh.cells.forEach(function (cell, i) {
    var _cell = _slicedToArray(cell, 3);

    var f0 = _cell[0];
    var f1 = _cell[1];
    var f2 = _cell[2];

    var v0 = mesh.positions[f0],
        v1 = mesh.positions[f1],
        v2 = mesh.positions[f2];
    context.beginPath();
    context.lineTo(v0[0], v0[1]);
    context.lineTo(v1[0], v1[1]);
    context.lineTo(v2[0], v2[1]);
    context.fillStyle = colors[i % colors.length];
    context.fill();
  });
}

var adder = throttle(addPoint, 30);
var dragging = false;

require("touches")(window, { filtered: true }).on("move", adder).on("start", function () {
  //clear path on click
  path.length = 0;
  stroke.thickness = random(10, 30);
  dragging = true;
}).on("end", function () {
  dragging = false;
});

function addPoint(ev, position) {
  if (!dragging) {
    return;
  } //limit our path by distance and capacity
  if (distance(position, lastPosition) < MIN_DIST) {
    return;
  }if (path.length > MAX_POINTS) path.shift();
  path.push(position);
  lastPosition = position;
}

}).call(this,"/triangles")
},{"../base":5,"extrude-polyline":30,"lodash.throttle":83,"randf":104,"touches":106,"vectors/dist":109}],109:[function(require,module,exports){
/**

### `dist(vec, other)`

Returns the distance between vectors `vec` and `other`:

``` javascript
var dist = require('vectors/dist')(2)
var pos1 = [2, 4]
var pos2 = [4, 4]

dist(pos1, pos2) === 2
```

**/


module.exports = generator

function generator(dims) {
  dims = +dims|0

  var body = []

  body.push('return function dist' + dims + '(vec, other) {')
      var els = []
      for (var i = 0; i < dims; i += 1) {
        body.push('var p'+i+' = other[' + i + ']-vec[' + i + ']')
        els.push('p'+i+'*p'+i)
      }
    body.push('return Math.sqrt(' + els.join(' + ') + ')')
  body.push('}')

  return Function(body.join('\n'))()
}

},{}],104:[function(require,module,exports){
function random(start, end) {
    var n0 = typeof start === 'number',
        n1 = typeof end === 'number'

    if (n0 && !n1) {
        end = start
        start = 0
    } else if (!n0 && !n1) {
        start = 0
        end = 1
    }
    return start + Math.random() * (end - start)
}

module.exports = random
},{}],83:[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var debounce = require('lodash.debounce');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as an internal `_.debounce` options object by `_.throttle`. */
var debounceOptions = {
  'leading': false,
  'maxWait': 0,
  'trailing': false
};

/**
 * Creates a function that only invokes `func` at most once per every `wait`
 * milliseconds. The created function comes with a `cancel` method to cancel
 * delayed invocations. Provide an options object to indicate that `func`
 * should be invoked on the leading and/or trailing edge of the `wait` timeout.
 * Subsequent calls to the throttled function return the result of the last
 * `func` call.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the throttled function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} wait The number of milliseconds to throttle invocations to.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=true] Specify invoking on the leading
 *  edge of the timeout.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // avoid excessively updating the position while scrolling
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // invoke `renewToken` when the click event is fired, but not more than once every 5 minutes
 * var throttled =  _.throttle(renewToken, 300000, { 'trailing': false })
 * jQuery('.interactive').on('click', throttled);
 *
 * // cancel a trailing throttled call
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (options === false) {
    leading = false;
  } else if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  debounceOptions.leading = leading;
  debounceOptions.maxWait = +wait;
  debounceOptions.trailing = trailing;
  return debounce(func, wait, debounceOptions);
}

/**
 * Checks if `value` is the language type of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

module.exports = throttle;

},{"lodash.debounce":84}],84:[function(require,module,exports){
/**
 * lodash 3.0.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isNative = require('lodash.isnative');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeNow = isNative(nativeNow = Date.now) && nativeNow;

/**
 * Gets the number of milliseconds that have elapsed since the Unix epoch
 * (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @category Date
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => logs the number of milliseconds it took for the deferred function to be invoked
 */
var now = nativeNow || function() {
  return new Date().getTime();
};

/**
 * Creates a function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time it was invoked. The created function comes
 * with a `cancel` method to cancel delayed invocations. Provide an options
 * object to indicate that `func` should be invoked on the leading and/or
 * trailing edge of the `wait` timeout. Subsequent calls to the debounced
 * function return the result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=false] Specify invoking on the leading
 *  edge of the timeout.
 * @param {number} [options.maxWait] The maximum time `func` is allowed to be
 *  delayed before it is invoked.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // avoid costly calculations while the window size is in flux
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
 * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // ensure `batchLog` is invoked once after 1 second of debounced calls
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', _.debounce(batchLog, 250, {
 *   'maxWait': 1000
 * }));
 *
 * // cancel a debounced call
 * var todoChanges = _.debounce(batchLog, 1000);
 * Object.observe(models.todo, todoChanges);
 *
 * Object.observe(models, function(changes) {
 *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
 *     todoChanges.cancel();
 *   }
 * }, ['delete']);
 *
 * // ...at some point `models.todo` is changed
 * models.todo.completed = true;
 *
 * // ...before 1 second has passed `models.todo` is deleted
 * // which cancels the debounced `todoChanges` call
 * delete models.todo;
 */
function debounce(func, wait, options) {
  var args,
      maxTimeoutId,
      result,
      stamp,
      thisArg,
      timeoutId,
      trailingCall,
      lastCalled = 0,
      maxWait = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = wait < 0 ? 0 : (+wait || 0);
  if (options === true) {
    var leading = true;
    trailing = false;
  } else if (isObject(options)) {
    leading = options.leading;
    maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
    trailing = 'trailing' in options ? options.trailing : trailing;
  }

  function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
  }

  function delayed() {
    var remaining = wait - (now() - stamp);
    if (remaining <= 0 || remaining > wait) {
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
      }
      var isCalled = trailingCall;
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (isCalled) {
        lastCalled = now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
      }
    } else {
      timeoutId = setTimeout(delayed, remaining);
    }
  }

  function maxDelayed() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
    if (trailing || (maxWait !== wait)) {
      lastCalled = now();
      result = func.apply(thisArg, args);
      if (!timeoutId && !maxTimeoutId) {
        args = thisArg = null;
      }
    }
  }

  function debounced() {
    args = arguments;
    stamp = now();
    thisArg = this;
    trailingCall = trailing && (timeoutId || !leading);

    if (maxWait === false) {
      var leadingCall = leading && !timeoutId;
    } else {
      if (!maxTimeoutId && !leading) {
        lastCalled = stamp;
      }
      var remaining = maxWait - (stamp - lastCalled),
          isCalled = remaining <= 0 || remaining > maxWait;

      if (isCalled) {
        if (maxTimeoutId) {
          maxTimeoutId = clearTimeout(maxTimeoutId);
        }
        lastCalled = stamp;
        result = func.apply(thisArg, args);
      }
      else if (!maxTimeoutId) {
        maxTimeoutId = setTimeout(maxDelayed, remaining);
      }
    }
    if (isCalled && timeoutId) {
      timeoutId = clearTimeout(timeoutId);
    }
    else if (!timeoutId && wait !== maxWait) {
      timeoutId = setTimeout(delayed, wait);
    }
    if (leadingCall) {
      isCalled = true;
      result = func.apply(thisArg, args);
    }
    if (isCalled && !timeoutId && !maxTimeoutId) {
      args = thisArg = null;
    }
    return result;
  }
  debounced.cancel = cancel;
  return debounced;
}

/**
 * Checks if `value` is the language type of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

module.exports = debounce;

},{"lodash.isnative":85}],85:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Used to match `RegExp` special characters.
 * See this [article on `RegExp` characters](http://www.regular-expressions.info/characters.html#special)
 * for more details.
 */
var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
    reHasRegExpChars = RegExp(reRegExpChars.source);

/**
 * Converts `value` to a string if it is not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  return value == null ? '' : (value + '');
}

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reNative = RegExp('^' +
  escapeRegExp(objToString)
  .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (objToString.call(value) == funcTag) {
    return reNative.test(fnToString.call(value));
  }
  return (isObjectLike(value) && reHostCtor.test(value)) || false;
}

/**
 * Escapes the `RegExp` special characters "\", "^", "$", ".", "|", "?", "*",
 * "+", "(", ")", "[", "]", "{" and "}" in `string`.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https://lodash\.com/\)'
 */
function escapeRegExp(string) {
  string = baseToString(string);
  return (string && reHasRegExpChars.test(string))
    ? string.replace(reRegExpChars, '\\$&')
    : string;
}

module.exports = isNative;

},{}],30:[function(require,module,exports){
var number = require('as-number')
var vec = require('./vecutil')

var tmp = vec.create()
var capEnd = vec.create()
var lineA = vec.create()
var lineB = vec.create()
var tangent = vec.create()
var miter = vec.create()

var util = require('polyline-miter-util')
var computeMiter = util.computeMiter,
    normal = util.normal,
    direction = util.direction

function Stroke(opt) {
    if (!(this instanceof Stroke))
        return new Stroke(opt)
    opt = opt||{}
    this.miterLimit = number(opt.miterLimit, 10)
    this.thickness = number(opt.thickness, 1)
    this.join = opt.join || 'miter'
    this.cap = opt.cap || 'butt'
    this._normal = null
    this._lastFlip = -1
    this._started = false
}

Stroke.prototype.mapThickness = function(point, i, points) {
    return this.thickness
}

Stroke.prototype.build = function(points) {
    var complex = {
        positions: [],
        cells: []
    }

    if (points.length <= 1)
        return complex

    var total = points.length

    //clear flags
    this._lastFlip = -1
    this._started = false
    this._normal = null

    //join each segment
    for (var i=1, count=0; i<total; i++) {
        var last = points[i-1]
        var cur = points[i]
        var next = i<points.length-1 ? points[i+1] : null
        var thickness = this.mapThickness(cur, i, points)
        var amt = this._seg(complex, count, last, cur, next, thickness/2)
        count += amt
    }
    return complex
}

Stroke.prototype._seg = function(complex, index, last, cur, next, halfThick) {
    var count = 0
    var cells = complex.cells
    var positions = complex.positions
    var capSquare = this.cap === 'square'
    var joinBevel = this.join === 'bevel'

    //get unit direction of line
    direction(lineA, cur, last)

    //if we don't yet have a normal from previous join,
    //compute based on line start - end
    if (!this._normal) {
        this._normal = vec.create()
        normal(this._normal, lineA)
    }

    //if we haven't started yet, add the first two points
    if (!this._started) {
        this._started = true

        //if the end cap is type square, we can just push the verts out a bit
        if (capSquare) {
            vec.scaleAndAdd(capEnd, last, lineA, -halfThick)
            last = capEnd
        }

        extrusions(positions, last, this._normal, halfThick)
    }

    cells.push([index+0, index+1, index+2])

    /*
    // now determine the type of join with next segment

    - round (TODO)
    - bevel 
    - miter
    - none (i.e. no next segment, use normal)
     */
    
    if (!next) { //no next segment, simple extrusion
        //now reset normal to finish cap
        normal(this._normal, lineA)

        //push square end cap out a bit
        if (capSquare) {
            vec.scaleAndAdd(capEnd, cur, lineA, halfThick)
            cur = capEnd
        }

        extrusions(positions, cur, this._normal, halfThick)
        cells.push(this._lastFlip===1 ? [index, index+2, index+3] : [index+2, index+1, index+3])

        count += 2
     } else { //we have a next segment, start with miter
        //get unit dir of next line
        direction(lineB, next, cur)

        //stores tangent & miter
        var miterLen = computeMiter(tangent, miter, lineA, lineB, halfThick)

        // normal(tmp, lineA)
        
        //get orientation
        var flip = (vec.dot(tangent, this._normal) < 0) ? -1 : 1

        var bevel = joinBevel
        if (!bevel && this.join === 'miter') {
            var limit = miterLen / (halfThick)
            if (limit > this.miterLimit)
                bevel = true
        }

        if (bevel) {    
            //next two points in our first segment
            vec.scaleAndAdd(tmp, cur, this._normal, -halfThick * flip)
            positions.push(vec.clone(tmp))
            vec.scaleAndAdd(tmp, cur, miter, miterLen * flip)
            positions.push(vec.clone(tmp))


            cells.push(this._lastFlip!==-flip
                    ? [index, index+2, index+3] 
                    : [index+2, index+1, index+3])

            //now add the bevel triangle
            cells.push([index+2, index+3, index+4])

            normal(tmp, lineB)
            vec.copy(this._normal, tmp) //store normal for next round

            vec.scaleAndAdd(tmp, cur, tmp, -halfThick*flip)
            positions.push(vec.clone(tmp))

            // //the miter is now the normal for our next join
            count += 3
        } else { //miter
            //next two points for our miter join
            extrusions(positions, cur, miter, miterLen)
            cells.push(this._lastFlip===1
                    ? [index, index+2, index+3] 
                    : [index+2, index+1, index+3])

            flip = -1

            //the miter is now the normal for our next join
            vec.copy(this._normal, miter)
            count += 2
        }
        this._lastFlip = flip
     }
     return count
}

function extrusions(positions, point, normal, scale) {
    //next two points to end our segment
    vec.scaleAndAdd(tmp, point, normal, -scale)
    positions.push(vec.clone(tmp))

    vec.scaleAndAdd(tmp, point, normal, scale)
    positions.push(vec.clone(tmp))
}

module.exports = Stroke
},{"./vecutil":32,"as-number":31,"polyline-miter-util":95}],32:[function(require,module,exports){
function clone(arr) {
    return [arr[0], arr[1]]
}

function create() {
    return [0, 0]
}

module.exports = {
    create: create,
    clone: clone,
    copy: require('gl-vec2/copy'),
    scaleAndAdd: require('gl-vec2/scaleAndAdd'),
    dot: require('gl-vec2/dot')
}
},{"gl-vec2/copy":72,"gl-vec2/dot":73,"gl-vec2/scaleAndAdd":75}],75:[function(require,module,exports){
module.exports = scaleAndAdd

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
function scaleAndAdd(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale)
    out[1] = a[1] + (b[1] * scale)
    return out
}
},{}],72:[function(require,module,exports){
module.exports = copy

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
function copy(out, a) {
    out[0] = a[0]
    out[1] = a[1]
    return out
}
},{}],31:[function(require,module,exports){
module.exports = function numtype(num, def) {
	return typeof num === 'number'
		? num 
		: (typeof def === 'number' ? def : 0)
}
},{}]},{},[4]);
