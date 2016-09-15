#!/usr/bin/env bash

OLD_DIR="finger-old"

cd $(dirname $0)

if [ ! -d "$OLD_DIR" ]; then
    git clone https://github.com/paldepind/finger-tree "$OLD_DIR"
    cd "$OLD_DIR"
    npm install
    npm run build
fi

pwd;
