#!/bin/bash
npm install -dev
node_modules/mocha/bin/mocha -R xunit > build/xunit.xml