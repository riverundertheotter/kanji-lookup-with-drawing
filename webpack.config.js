const { resolve } = require('path');

module.exports = {
  resolve: {
    alias: {
      buffer: resolve(__dirname, 'node_modules', 'buffer', 'index.js'),
    },
    fallback: {
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
    },
  },
};