const defaultValue = {
  list: [
    'react真好玩',
    'koa有点意思',
    'ssr更有意思'
  ]
}

function list (state = defaultValue, action) {
  switch(action.type) {
    default:
      return state
  }
}

export default list