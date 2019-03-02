import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'

import Classes from './app.module.scss'

import Home from '../pages/Home/home'
import Detail from '../pages/Detail/detail'

class App extends Component {
  render() {
    return (
      <div className={Classes.rootApp}>
        <AppBar className={Classes.navbar} position="fixed" color="default">
          <Toolbar>
            <p className={Classes.navbarTitle}>Tokoflix</p>
            <p className={Classes.balance}>
              Rp <span className={Classes.balanceAmount}>200000</span>
            </p>
          </Toolbar>
        </AppBar>
        <div className={Classes.rootPages}>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/:movie_id/:slug" component={Detail} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default App
