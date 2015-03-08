rm -rf **/bundle.min.js
for var in "$@"
do
    cp base/index.html $var/index.html && \
      uglifyjs $var/bundle.js > $var/bundle.min.js
done
