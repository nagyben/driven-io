#!/bin/sh
ps axf | grep driven-io-server.js | grep -v grep | awk '{print "kill -9 " $1}' | sh
forever -w driven-io-server.js &
