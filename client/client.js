import React from 'react'
import ReactDom from 'react-dom'
import App from './app'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import createStore from './redux/store'

// 这里是同步前后端的数据，避免重复渲染
const StoreFromServer = window.__STORE__ === '{{store}}' ? '{}' : window.__STORE__
const initialState = JSON.parse(StoreFromServer)
const store = createStore(initialState)

export class Home extends React.Component {
  render () {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <App/>
        </BrowserRouter>
      </Provider>
    )
  }
}

ReactDom.hydrate(<Home/>, document.getElementById('app'))