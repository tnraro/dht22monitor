#!/bin/bash

bun run web/build.ts

cp web/index.html dist/

set -o allexport
source .env
set +o allexport

if [ -z "$SERVER_PATH" ]; then
  >&2 echo "no SERVER_PATH"
  exit 1
fi

rm -rf "$SERVER_PATH*"
cp -r dist/* "$SERVER_PATH"