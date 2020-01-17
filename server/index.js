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

server.use('/public', Express.static(path.join(__dirname, "../dist")))

// const template = fs.readFileSync(path.join(__dirname, "../dist/index.html"), 'utf-8')
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
      title: 'vdf'
    }
  })
  const html = renderToString(
    <Provider store={ store }>
      <StaticRouter location={req.url}>
        <App/>
      </StaticRouter>
    </Provider>
  )
  // res.send(template.replace('<!-- <app /> -->', appString))
  res.send(templating({html,store: JSON.stringify(store.getState())}))
})

server.listen('8888', () => {
  console.log('server is started, port is 8888')
})