// 用于合并webpack的配置
const merge = require('webpack-merge')
// 用户导出html文件
const HTMLplugin = require('html-webpack-plugin')
const { resolvePath } = require('./webpack-util')
// webpack公共配置文件，主要用于服务端打包和客户端打包的公用配置
const baseConfig = require('./webpack-base')
// 分离CSS为单独的问题
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = merge(baseConfig, {
  // 用于调试
  devtool: 'inline-source-map',
  mode: 'development',
  entry: {
    app: resolvePath('../client/client.js')
  },
  output: {
    filename: 'js/[name].[hash].js',
    path: resolvePath('../dist'),
    // 服务端的publicPath要跟这里的一致，作用是在最后打包出来的静态资源路径都是在/public下，这里主要的作用是因为服务端渲染时，打包后的js文件也返回了html文件，所以需要通过设置一个静态资源文件的路径来区分
    publicPath: '/public'
  },
  devServer: {
    port: 8060,
    contentBase: '../client', //src文件夹里面的内容改变就会重新打包
    // 路由使用history，因此有个问题就是，一步路由没有缓存在页面中，第一次进入页面会找不到，因此在开发环境可以配置historyApiFallback恢复正常
  	historyApiFallback: true,
  	hot: true,
  	inline: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: [/node_modules/],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', 
              // https://stackoverflow.com/questions/57899750/error-while-configuring-css-modules-with-webpack
              // Syntax of css-loader options has changed in version 3.0.0. localIdentName was moved under modules option.
              // 因此不能写成 options: { modules: true, importLoaders: 1, localIdentName: '[name]___[hash:base64:5]' }
              // 只能写成以下方式
              options: { modules: { localIdentName: '[name]___[hash:base64:5]' }, importLoaders: 1 } 
            },
            'postcss-loader'
          ]
        })
      }
    ]
  },
  plugins: [
    new HTMLplugin({
      filename: 'index.html',
      template: resolvePath("../template.html")
    }),
    // 注意：如果打包的时候报错，那重新npm install –save-dev extract-text-webpack-plugin@next安装一下，因为webpack版本较高，所以老版本的extract-text-webpack-plugin有问题
    new ExtractTextPlugin('./css/[name]-[hash:8].css')
  ]
})
