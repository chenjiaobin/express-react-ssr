const path = require('path')

function resolvePath (filepath) {
  return path.join(__dirname, filepath)
}

module.exports = {
  entry: resolvePath('../client/server.js'),
  output: {
    filename: 'server.js',
    path: resolvePath('../dist'),
    publicPath: '/public',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /.jsx$/,  // 正则，处理以.jsx结尾的文件
        loader: 'babel-loader'  // 使用的loader
      },
      {
        test: /js$/,
        loader: 'babel-loader',
        exclude: [
          resolvePath('../node_modules')
        ]
      }
    ]
  }
}