const { resolvePath } = require('./webpack-util')

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: [
          resolvePath('../node-modules')
        ]
      }
    ]
  },
  resolve: {
    // 文件后缀自动补全
    extensions: ['.js', '.jsx']
  }
}