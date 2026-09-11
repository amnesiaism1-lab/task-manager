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
