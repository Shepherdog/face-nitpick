var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var workspacePath = './game';

module.exports = {
  entry: {
    app: workspacePath + '/index.js'
  },
  output: {
    path: path.resolve(__dirname, workspacePath),
    publicPath: './',
    filename: 'build.js?[chunkhash:8]'
  },
  module: {
    // avoid webpack trying to shim process
    noParse: /es6-promise\.js$/,
    rules: [
      {
        test: /\.html$/,
        loader: 'vue-html-loader'
      },
      {
        test: /\.js$/,
        // excluding some local linked packages.
        exclude: /node_modules\//,
        loader: 'babel-loader',
        query: {presets: ['es2015']}
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  },
  plugins: [
  ]
};

// env switch from dev to prd with different config
if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new HtmlWebpackPlugin({
      template: workspacePath + '/index.tmpl'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    //new webpack.optimize.OccurenceOrderPlugin()
  ]
} else {
  module.exports.devtool = '#source-map'
}