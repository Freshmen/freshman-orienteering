#!/bin/bash
npm install
./node_modules/forever/bin/forever stop app.js
./node_modules/forever/bin/forever -l ./build_$1.log -o ./build_$1.out -e ./build_$1.err start app.js