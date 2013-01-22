#!/bin/bash
npm install
node_modules/mocha/bin/mocha -R xunit > build/xunit.xml
