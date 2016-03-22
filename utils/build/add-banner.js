'use strict';

var pckgJson = require(process.env.PWD +'/package.json');

var banner = '/* ' + pckgJson.name + ' - '+ pckgJson.config.banner +' - ' + new Date() + ' */\n';

//Time marker
var timeMarker = new Date();
process.stderr.write(timeMarker.toString() + '   ');

process.stdout.write(banner);
process.stdin.pipe(process.stdout);

