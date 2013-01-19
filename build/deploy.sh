#!/bin/bash
npm install
./node_modules/forever/bin/forever stop app.js
./node_modules/forever/bin/forever start app.js
