#!/bin/bash
npm install
./node_modules/forever/bin/forever stop app.js
./node_modules/forever/bin/forever start app.js -o out_$1.log -e err_$1.log -l forever_$1.log
