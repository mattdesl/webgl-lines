for var in "$@"
do
    cp base/index.html $var/index.html && \
      browserify $var/index.js | uglifyjs -cm > $var/bundle.js
done
