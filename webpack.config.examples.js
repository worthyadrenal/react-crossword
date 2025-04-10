const path = require('path');
const baseConfig = require('./webpack.config');

module.exports = {
  mode: 'development',
  entry: {
    examples: path.join(__dirname, 'examples', 'exampleCrossword.js'),
  },
  output: {
    filename: 'examples.js',
    path: path.join(__dirname, 'examples', 'lib'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'examples'),
    },
    port: 8080,
    host: '0.0.0.0',
    open: true,
  },
  resolve: baseConfig.resolve,
  resolveLoader: baseConfig.resolveLoader,
  module: baseConfig.module,
};

