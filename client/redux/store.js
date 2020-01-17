import { createStore } from 'redux'
import reducer from './reducer/index'

// 因为在服务端和客户端都要用到，所以返回一个可以传递参数的函数出去
export default (data) => createStore(reducer, data)