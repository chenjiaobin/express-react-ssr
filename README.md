### 前言
祝愿各位过年回家的单身攻城狮相亲成功，已脱单的找机会~~~~

服务端渲染听起来高大上，其实也就那么回事，如果网站不是用于商业用途，也不需要被网站收录，那就还是乖乖用正常普通的方式写写就完事了，除非自己想装逼一下，那可以玩一下。以下就是我的装逼时间了~~🙃

项目地址： https://github.com/chenjiaobin/express-react-ssr

### 为什么使用SSR
* 加快首屏渲染。因为用户从发送一个网站请求到接收请求，无非就是就是有`js/css下载-请求数据-页面渲染`这几个步骤，服务端渲染(SSR)和客户端(CSR)的区别就在于以上几个步骤的顺序，后面有图说明<a style="color: red">（多说一句，JS/CSS是并行下载的，但是CSS影响JS的执行，即CSS没下载完成和解析完成之前JS执行是被阻塞的，CSS前面的JS不会。CSS不会影响DOM的解析，但是影响DOM的渲染，因为DOM的渲染需要JS DOM和CSS DOM结合成Renderdom后才被渲染。而JS文件的下载会阻塞DOM和CSS的的解析和渲染，但是不会阻塞前面的HTML和CSS的解析）</a>
* 有利于SEO，因为客户端渲染js和css会阻塞页面的渲染过程，且最终页面是通过js将对应的路由插入到dom中去的，也就是我们爬虫的时候爬到的会是`<div id="root"></div>`，而获取不到我们页面具体的内容，但是服务端渲染返回完整的<i style="color: red">可视</i>页面，即不包括交互，交互需要等待后续JS下载完成进行绑定
> 可参考https://www.jdon.com/50088

**上文中描述的客户端渲染和服务端渲染，实际上对应了两种Web构建模式：前后分离模式和直出模式**
1. 模式一：前后分离模式（对应客户端渲染）
   
![](https://user-gold-cdn.xitu.io/2020/1/17/16fb1a2f3351c071?w=814&h=642&f=png&s=22867) 
2. 模式二：直出模式（对应服务端渲染）

![](https://user-gold-cdn.xitu.io/2020/1/17/16fb1a3739c19e48?w=802&h=650&f=png&s=22562)

无论是客户端渲染，服务端渲染，它们都包含三个主体过程：

* 下载JS/CSS代码
* 请求数据
* 渲染页面

客户端渲染：a -> b ->c （a,b,c都在客户端进行）

服务端渲染：b -> c ->a （b,c在服务端进行，最后的a在客户端进行）
 
服务端渲染改变了a,b,c三个过程的执行顺序和执行方
### 技术栈
* react、react-dom、redux等（前端）
* express（Node服务端）
* webpack（前后端打包工具）
### 客户端代码
因为浏览器对于一些新的JS用法和react的语法糖无法识别，因此我们需要安装一下webpack包来对源代码进行打包处理，以保证代码能在浏览器运行，具体包的作用就不细讲，主要贴了几个比较重要的包，细看请前往[express-react-ssr](https://github.com/chenjiaobin/express-react-ssr)
```
// webpack主要的打包依赖
cnpm i webpack webpack-cli webpack-merge html-webpack-plugin autoprefixer -D
// 安装babel主要用于编辑ES6和jsx语法，转换代码的作用
cnpm i @babel/cli @babel/core @babel/preset-env @babel/preset-react babel-loader -D
// 主要用于打包css
cnpm i css-loader style-loader postcss-loader -D
```
### 步骤
执行`npm init`创建一个带项目信息的package.json，并新建build、client和server文件夹，build主要存放webpack打包配置，client存放客户端文件，即前端react页面文件，server则存放node服务端代码，主要用于服务端渲染
1. 新建文件webpack-client-config.js，客户端文件打包配置，这里我一次性给出我项目的配置，详细说明看里面的备注，具体一些关键配置后面会说明
```
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
    // 路由使用history，因此有个问题就是，一步路由没有缓存在页面中，第一次进入页面会找不到，
    // 因此在开发环境可以配置historyApiFallback恢复正常
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
              // Syntax of css-loader options has changed in version 3.0.0. localIdentName was moved under modules //option. 意思大概是css-loader3.0.0版本的localIndentName属性被移除了
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
```
> 基础webpack-config-base.js就去看项目就好了哈😁没什么特别

<i style="color: red">注：</i>这里主要的坑就是`ExtractTextPlugin`的使用，即在配置css-loader的时候如果跟不使用它的时候一样，那可能会出现问题，原因是版本css-loader 3.0.0版本的时候移除了`localIdentName`(作用：自定义样式打包规则)属性

错误配置
```
options: { modules: true, importLoaders: 1, localIdentName: '[name]___[hash:base64:5]'
```
正确配置
```
options: { modules: { localIdentName: '[name]___[hash:base64:5]' }, importLoaders: 1 }
```

2. 新建webpack-util.js，webpack基础工具配置
```
// 获取文件路径
const path = require('path')
exports.resolvePath = (filePath) => path.join(__dirname, filePath)
```
3. webpack配置完还没完事，需要根目录创建一个.babelrc文件
```
{
  "presets": ["@babel/preset-react"]
}
```
4. 开始写react文件，在client文件夹下面创建一个客户端打包入口文件client.js和app.js文件
```
// app.js
export default class App extends Component {
  render () {
    return ( 
        <div>
          <p>服务端渲染测试</p>
        </div>    
    )
  }
}

// client.js
export class Home extends React.Component {
  render () {
    return (
          <App/>
      </Provider>
    )
  }
}
ReactDom.render(<Home/>, document.getElementById('app'))
```
5. 目前基本就可以正常打包`webpack --config build/webpack-client-config.js`，打包正常你会在根目录生成了一个dist目录，不正常的话自己再调试调试把，或者拉我的项目去看下，[传送门](https://github.com/chenjiaobin/express-react-ssr)
6. 最后服务端渲染的时候要把render换成hydrate，两个的主要区别如下
> ReactDom.render()会将后端返回的dom节点所有子节点全部清除，即彻底抛弃服务端的节点，再重新生成子节点。而ReactDom.hydrate()则会复用dom节点的子节点，将其与virtualDom关联。同时hydrate也有个副作用，即当服务端和客户端的结果不一致的时候，就会focus到不一致的节点上，这就导致我们加载页面的时候，页面自动滚动到不一致的节点上。


可见，第一种方式明显是做了重复工，影响效率，因此，react16版本也放弃了用render，也可能将会在react17版本中不能用ReactDOM.render()去混合服务端渲染出来的标签

### 服务端代码
1. 安装Node相关依赖，这里主要安装了express
2. 再server目录创建index.js执行文件
```
import Express from 'express'
import path from 'path'
import { renderToString } from 'react-dom/server'
import fs from 'fs'
import React from 'react'
import { StaticRouter } from 'react-router-dom'
// const App = require('../dist/server').default
import App from '../client/app'
import { Provider } from 'react-redux'
import createStore  from '../client/redux/store'

const server = Express()
// 静态资源路径
server.use('/public', Express.static(path.join(__dirname, "../dist")))

// 这个函数主要用于匹配模板文件的{{}}标签的内容，替换成我们后端给出的数据
function templating(props) {
  const template = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf-8');
  return template.replace(/{{([\s\S]*?)}}/g, (_, key) => props[ key.trim() ]);
}

server.use('/', (req, res) => {
  const store = createStore({
    list: {
      list: ['关羽', '张飞', '赵云']
    },
    home: {
      title: '我是小菜鸡，请赐教'
    }
  })
  // 核心代码
  const html = renderToString(
    <Provider store={ store }>
    //如果我们页面上使用到了路由那就需要这个来包含
      <StaticRouter location={req.url}>
        <App/>
      </StaticRouter>
    </Provider>
  )
  res.send(templating({html,store: JSON.stringify(store.getState())}))
})
server.listen('8888', () => {
  console.log('server is started, port is 8888')
})
```
<i style="color: red">关键点：</i>
* StaticRouter和BrowserRouter的主要区别就是，在浏览器上我们可以使用js获取到location，但是在node环境却获取不到，所以react-router提供了StaticRouter来让我们自己设置location
* 在开始讲之前我还是得先和大家说说传统的spa页面路由是怎么配置的，下面就以history模式为例

首先我们从浏览器输入url，不管你的url是匹配的哪个路由，后端统统都给你index.html，然后加载js匹配对应的路由组件，渲染对应的路由。

那我们的ssr路由是怎么样的模式呢？

首先我们从浏览器输入url，后端匹配对应的路由获取到对应的路由组件，获取对应的数据填充路由组件，将组件转成html返回给浏览器，浏览器直接渲染。当这个时候如果你在页面中点击跳转，我们依旧还是不会发送请求，由js匹配对应的路由渲染

3. 服务端打包，再build文件夹新建webpack-server-pro.js，配置如下
```
const merge = require('webpack-merge')
const { resolvePath } = require('./webpack-util')
const baseConfig = require('./webpack-base')
// 打包忽略重复文件，挺重要的，之前打包没加报了Critical dependency: the request of a dependency is an // //expression的警告，不将node_modules里面的包打进去
const nodeExternals = require('webpack-node-externals')

// 打包server node的配置

module.exports = merge(baseConfig, {
  mode: 'production',
  // 表示是node环境，必须加
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
    // 必须跟客户端的路径一样
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
```
<i style="color: red">注：</i>isomorphic-style-loader主要是用于解决css在服务端打包时候的问题，因为app.js文件在服务端引进去，app.js里面有css的文件应用，那么这个时候打包就会出现`document is not defined`的错误，因此我们就需要解决css文件在服务端的问题，此时我们只需要提取css样式名字到标签上就行了，不需要额外打包出css文件，那么[isomorphic-style-loader](https://github.com/kriasoft/isomorphic-style-loader)这个包就派上用场了，配置如上。localIdentName自定义配置要和客户端的一致
4. 这个时候基本就已经完成服务端打包了，执行`webpack --config build/webpack-server-pro.js`，会在dist下生成一个server文件夹，且文件夹里面有个app.js文件，这个文件就是node的启动文件，我们通过终端进入文件夹，然后执行`node app.js`这样就可以启动我们的node服务了，前提是我们按前面的客户端打包步骤打包好前端代码，那么我们就可以通过在浏览器访问`localhost:8888`访问到后端渲染的页面了

### 打包部署
1. git clone https://github.com/chenjiaobin/express-react-ssr
2. npm install 安装依赖
3. npm run build 打包客户端
4. npm run server-pro-build 打包服务端
5. 进入第四步打包好的server目录，启动node服务node app.js（线上还是使用pm2吧，自行查阅）
6. 访问localhost:8888

✔🤣敬上，项目地址 https://github.com/chenjiaobin/express-react-ssr

### 参考
* https://www.jianshu.com/p/0ecd727107bb
* https://blog.csdn.net/weixin_42958859/article/details/88801180
* https://blog.csdn.net/weixin_33713503/article/details/88659610
* https://segmentfault.com/a/1190000019916830
