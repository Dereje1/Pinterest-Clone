var path = require('path');
const webpack = require('webpack');

let configMain = {
 entry: './src/client.js',
 output: {
   filename: 'bundle.js',
   path: path.resolve(__dirname, 'public')
 },
 watch: true,
 module:{
     loaders: [
       {
         test:/\.js$/,
         exclude:/node_modules/,
         loader: 'babel-loader',
         query: {
           presets: ['react', 'es2015','stage-1']
         }
       }
     ]
   },
   plugins: []
 }
//run this for production , note must set NODE_ENV to production in powershell where webpack is running PRIOR to running webpack
//$env:NODE_ENV="production"
 if(process.env.NODE_ENV==="production"){
   configMain.plugins.push(
     new webpack.DefinePlugin({
      "process.env": {
         NODE_ENV: JSON.stringify("production")
       }
     }),
     new webpack.optimize.UglifyJsPlugin()
   )
   configMain.watch = false
 }

 module.exports = configMain
