#!/bin/bash
npm install
node_modules/forever/bin/forever stop app.js
node_modules/forever/bin/forever -l ./build_$1.log start app.js