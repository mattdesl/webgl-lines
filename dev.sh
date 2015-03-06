# 1. copy index.html template into folder
# 2. run watchify server with live reload
cp base/index.html $1/index.html \
  && budo $1/index.js -o $1/bundle.js -v -d --live | garnish -v
