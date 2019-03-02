import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Snackbar from '@material-ui/core/Snackbar'
import accounting from 'accounting'

import Classes from './app.module.scss'

import Home from '../pages/Home/home'
import Detail from '../pages/Detail/detail'

import { Provider } from '../contextApi/context'

class App extends Component {
  state = {
    balance: 100000,
    snackbar: {
      open: false,
      message: '',
      duration: 1500,
    },
  }

  render() {
    return (
      <Provider
        value={{
          state: this.state,
          actions: {
            updateBalance: newBalance =>
              this.setState({
                balance: newBalance,
              }),
            updateSnackbar: ({ open, message, duration }) => {
              this.setState({
                snackbar: { open, message, duration },
              })
            },
          },
        }}
      >
        <div className={Classes.rootApp}>
          <Snackbar
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            open={this.state.snackbar.open}
            autoHideDuration={this.state.snackbar.duration}
            onClose={() =>
              this.setState({
                snackbar: {
                  open: false,
                  message: '',
                  duration: 1500,
                },
              })
            }
            message={this.state.snackbar.message}
          />
          <AppBar className={Classes.navbar} position="fixed" color="default">
            <Toolbar>
              <p className={Classes.navbarTitle}>Tokoflix</p>
              <p className={Classes.balance}>
                Rp{' '}
                <span className={Classes.balanceAmount}>
                  {accounting.formatMoney(this.state.balance, '', 0, '.')}
                </span>
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
      </Provider>
    )
  }
}

export default App
