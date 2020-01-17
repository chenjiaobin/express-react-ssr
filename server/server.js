// babel-register是一个require钩子，会自动对require命令所加在的js文件进行实时转码的，不过这个库只适用于开发环境，正式环境可能会影响效率
require('@babel/register')({
  presets: [
      '@babel/preset-react',
      '@babel/preset-env'
  ],
});
// 本地开发时候对样式的处理
require('css-modules-require-hook')({
  generateScopedName: '[name]___[hash:base64:5]',
})

require('./index.js')