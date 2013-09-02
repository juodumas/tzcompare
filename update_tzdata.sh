#!/bin/sh -e

TMPD=$(mktemp -d)

cleanup() {
  trap - EXIT
  if [ -d $TMPD ]; then
    rm -fr $TMPD
  fi
}

trap cleanup EXIT

cd $(dirname "$0")

wget --retr-symlinks 'ftp://ftp.iana.org/tz/tzdata-latest.tar.gz' -O-|tar -zx --directory "$TMPD"

node "timezone-js/src/node-preparse.js" "$TMPD" >> "$TMPD/tzdata.json"

echo "var TZDATA = " > "src/js_lib/tzdata.json"
cat "$TMPD/tzdata.json" >> "src/js_lib/tzdata.json"
echo ";" >> "src/js_lib/tzdata.json"

echo "Done. Updated tzdata in src/js_lib/tzdata.json"
