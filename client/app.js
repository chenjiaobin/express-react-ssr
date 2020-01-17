import React, { Component } from 'react'
import { Link, Switch, Route } from 'react-router-dom'
import Home from './component/home'
import Parent from './component/parent'
import Child from './component/child'
import homecss from './static/css/home.css'

export default class App extends Component {
  toggle () {
    console.log(123)
  }

  componentDidMount () {
    // 服务端是不会执行到这个周期函数的
    console.log('我是服务端渲染')
  }

  render () {
    return ( 
        <div>
          <p className={homecss.home} onClick={this.toggle.bind(this)}>服务端渲染测试</p>
          <ul>
            <li><Link to="/">首页</Link></li>
            <li><Link to="/parent">Parent</Link></li>
            <li><Link to="/child">child</Link></li>
          </ul>
          <Route exact path="/" component={Home}></Route>
          <Route exact path="/parent" component={Parent}></Route>
          <Route exact path="/child" component={Child}></Route>
        </div>    
    )
  }
}