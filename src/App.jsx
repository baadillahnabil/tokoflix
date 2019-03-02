import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'

import Home from './pages/Home/home'
import Detail from './pages/Detail/detail'

class App extends Component {
  render() {
    return (
      <>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/:movie_id/:slug" component={Detail} />
        </Switch>
      </>
    )
  }
}

export default App
