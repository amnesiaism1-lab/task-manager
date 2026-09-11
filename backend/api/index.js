const handler = require('../dist/main');

module.exports = handler.default || handler;
module.exports.default = module.exports;
