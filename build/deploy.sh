#!/bin/bash
npm install
./node_modules/forever/bin/forever restart app.js
./node_modules/forever/bin/forever list
