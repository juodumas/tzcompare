#!/bin/sh -e

cd ${0%/*}

MINIFY=true
if [ "$1" = "--nomin" ]; then
  MINIFY=false
  shift
fi

out=index.html
if [ -n "$1" ]; then
  out="$1"
fi

src="src"

# HTML head.
cat > "$out" <<EOF
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
EOF

# CSS.
cat ${src}/styles/*.css >> "$out"

echo '</style>' >> "$out"

if [ -f ${src}/head.html ]; then
  cat ${src}/head.html >> "$out"
fi

echo '</head><body>' >> "$out"

# HTML body.
cat ${src}/body.html >> "$out"

# HTML templates.
for t in ./${src}/templates/*.html; do
  [ -e "$t" ] || continue
  name=$(basename ${t%.html})
  if test ${name%.multi} = "$name"; then
    echo "<script type=\"text/html\" id=\"t-$name\">" >> "$out"
    cat "$t" >> "$out"
    echo "</script>" >> "$out"
  else
    cat "$t" >> "$out"
  fi
done

# Javascript
echo '<script>' >> "$out"

for f in ./${src}/js_lib/*.js; do
  [ -e "$f" ] || continue
  if $MINIFY && [ ${f%%.min.js} = "$f" ]; then
    uglifyjs "$f" -c -m >> "$out"
  else
    cat "$f" >> "$out"
  fi
  echo >> "$out"
done

for f in ./${src}/js_app/*.js; do
  [ -e "$f" ] || continue  
  if $MINIFY; then
    uglifyjs "$f" -c -m >> "$out"
  else
    cat "$f" >> "$out"
  fi
  echo >> "$out"
done 

echo '</script>' >> "$out"

# Close HTML.
echo '</body></html>' >> "$out"
