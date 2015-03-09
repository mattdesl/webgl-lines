# webgl-lines

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

Some interactive content for a blog post.

Demos:

- [native](http://mattdesl.github.io/webgl-lines/native/) - rendering with `gl.LINES`
- [triangles](http://mattdesl.github.io/webgl-lines/triangles/) - triangulated stroke
- [expanded](http://mattdesl.github.io/webgl-lines/expanded/) - expanded in a vertex shader
- [projected](http://mattdesl.github.io/webgl-lines/projected/) - screen space projected lines

## running demos

First you need to git clone and install dependencies:

```sh
git clone https://github.com/mattdesl/webgl-lines.git
cd webgl-lines
npm install
```

To start developing a demo, use one of the following:

```
  npm run native
  npm run triangles
  npm run expanded
  npm run projected
```

And open `localhost:9966/[demo]`, for example `localhost:9966/native`.

## production

For the bundle splitting and uglify step, use `npm run build-all`. 

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/webgl-lines/blob/master/LICENSE.md) for details.
