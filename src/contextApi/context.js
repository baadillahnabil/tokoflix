import React from 'react'

export const { Provider, Consumer } = React.createContext({})

export const contextWrapper = WrappedComponent => {
  return props => {
    return (
      <Consumer>{value => <WrappedComponent {...props} {...value} />}</Consumer>
    )
  }
}
