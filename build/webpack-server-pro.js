const merge = require('webpack-merge')
const { resolvePath } = require('./webpack-util')
const baseConfig = require('./webpack-base')
const nodeExternals = require('webpack-node-externals')

// 打包server node的配置

module.exports = merge(baseConfig, {
  mode: 'production',
  target: 'node',
  node: {
    // 使用__filename变量获取当前模块文件的带有完整绝对路径的文件名
    __filename: true,
    // 使用__dirname变量获得当前文件所在目录的完整目录名
    __dirname: true
  },
  context: resolvePath('..'),
  entry: {
    app: resolvePath('../server/index.js')
  },
  output: {
    filename: '[name].js',
    path: resolvePath('../dist/server'),
    publicPath: '/public' 
  },
  module: {
    rules: [
      {
        test: /\.css?$/,
        use: ['isomorphic-style-loader', {
         loader: 'css-loader',
         options: {
          importLoaders: 1,
          modules: {
            localIdentName: '[name]___[hash:base64:5]'
          },
         }
        }]
       }
    ]
  },
  externals: [
    nodeExternals()
  ],
})
