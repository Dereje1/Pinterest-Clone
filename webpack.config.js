const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const configMain = {
  entry: './client/src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './client/public'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: path.resolve(__dirname, 'node_modules'),
        use: ['babel-loader'],
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      title: 'React Template',
      template: './client/public/template.html',
    }),
  ],
  devServer: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
    historyApiFallback: true, // router will not work without this?
  },
};

module.exports = configMain;
