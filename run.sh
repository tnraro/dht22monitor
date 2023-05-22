#!/bin/bash

./src/dht

set -o allexport
source .env
set +o allexport

if [ -z "$SERVER_PATH" ]; then
  >&2 echo "no SERVER_PATH"
  exit 1
fi

cp -r dist/dht.dat "$SERVER_PATH"