'use strict';

var fs =  require ('fs');
var ejs = require('ejs');

var tick = (new Date()).getTime();

var templateFile = process.argv[2]; // https://nodejs.org/docs/latest/api/process.html#process_process_argv
var template = fs.readFileSync(templateFile,'utf8');

var html = ejs.render(template, {styles:'index.css?v=' + tick, scripts:'app.js?v=' + tick});

process.stdout.write(html);