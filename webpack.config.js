/* istanbul ignore file */
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
require('babel-polyfill');

const configMain = {
  entry: ['babel-polyfill', './client/src/index.tsx'],
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './client/public'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: path.resolve(__dirname, 'node_modules'),
        use: ['babel-loader'],
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
  },
  plugins: [
    new HtmlWebPackPlugin({
      title: 'React Template',
      template: './client/template.html',
      favicon: './client/favicon.ico',
    }),
  ],
  devServer: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
    },
    historyApiFallback: true, // router will not work without this?
  },
};

module.exports = configMain;
