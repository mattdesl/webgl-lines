for var in "$@"
do
    browserify $var/index.js | uglifyjs -cm > $var/bundle.js
done
