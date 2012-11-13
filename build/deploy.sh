#!/bin/bash
npm install
node_modules/forever/bin/forever stopall
node_modules/forever/bin/forever -l forever.log start app.js