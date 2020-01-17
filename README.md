** 参考
* https://www.jianshu.com/p/0ecd727107bb
* https://blog.csdn.net/weixin_42958859/article/details/88801180
* https://blog.csdn.net/weixin_33713503/article/details/88659610

## server打包出现的问题
1. 打包server的时候出现`Critical dependency: the request of a dependency is an expression`，这种情况一般出现在node环境，webpack配置的`target:node`意为加载核心模块，不打包node_modules里面的模块，但实际上光靠target指定为node是不够的，还需要借助一项外部配置 webpack-node-externals， 它可以帮助我们在打包时忽略 node_modules，因此我们需要安装`npm i webpack-node-externals`，且在webpack里面配置
```
const nodeExternals = require('webpack-node-externals')
const config = function() {
  return {
    externals: [
      nodeExternals()
    ]
  }
}

module.exports = config
```
2. 服务端打包样式问题
服务端为了避免重复打包客户端的样式文件，可以通过`isomorphic-css-loader`包来解决，配置具体看该项目的webpack-server-pro.js文件
