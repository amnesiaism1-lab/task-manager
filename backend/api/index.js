// Prepend module search paths for Vercel Serverless environment
const _path = require('path');
const _fs = require('fs');
[
  _path.join(__dirname, 'node_modules'),
  _path.join(__dirname, '..', 'node_modules'),
  _path.join(__dirname, '..', 'backend', 'node_modules'),
  _path.join(process.cwd(), 'node_modules'),
  _path.join(process.cwd(), 'backend', 'node_modules'),
  '/var/task/node_modules',
  '/var/task/backend/node_modules'
].forEach(p => {
  if (_fs.existsSync(p) && !module.paths.includes(p)) {
    module.paths.unshift(p);
  }
});

// Static references so Vercel's NFT (Node File Trace) bundler traces all core packages
require('reflect-metadata');
require('@nestjs/core');
require('@nestjs/common');
require('@nestjs/platform-express');
require('pg');
require('typeorm');

let handler;
try {
  handler = require('../dist/main');
} catch (err) {
  console.error("Initialization crash:", err);
  handler = (req, res) => {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'CRASH_ON_REQUIRE',
      message: err.message,
      stack: err.stack,
      code: err.code
    }));
  };
}

module.exports = handler.default || handler;
module.exports.default = module.exports;
