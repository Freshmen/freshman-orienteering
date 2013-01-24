
#!/bin/bash
npm install
./node_modules/forever/bin/forever stop app.js
mkdir -p logs
BUILD_ID=daemon ./node_modules/forever/bin/forever start -l "${PWD}/logs/forever_$1.log" app.js 
