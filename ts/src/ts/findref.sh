#!/bin/bash

# this file generates ref lines for test.ts

# the following show file list on the screen
# find . |grep \.ts|grep -o 'grep -o 'com[/a-z_A-Z0-9]*'

for i in `find . |grep \.ts|grep -o 'com[/a-z_A-Z0-9]*'`
do 
 echo "///<reference path=\"$i\" />"
done
