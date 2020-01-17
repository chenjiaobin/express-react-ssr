import React from 'react'
import { connect } from 'react-redux'

function Home ({ title }) {
  return (
    <div>我是Home-- {title}</div>
  )
}

const mapStateToProps = state => {
  return { ...state.home }
}

export default connect(mapStateToProps)(Home)