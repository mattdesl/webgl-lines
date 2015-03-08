# 1. copy dev HTML template into folder
# 2. run watchify server with live reload
rm -rf $1/bundle.js $1/bundle.min.js \
  && cp base/dev.html $1/index.html \
  && budo $1/index.js -o $1/bundle.js -v -d --live | garnish -v
