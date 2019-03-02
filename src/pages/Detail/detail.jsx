import React, { Component } from 'react'
import takeRight from 'lodash/takeRight'

class Detail extends Component {
  state = {
    id: null,
    slug: null,
  }

  async componentDidMount() {
    await this.setInitialState()
  }

  setInitialState = async () => {
    const path = this.props.location.pathname.substring(1).split('-')
    const id = path[0]
    const slug = takeRight(path, path.length - 1).join('-')
    await this.setState({
      id,
      slug,
    })
  }

  getMovieDetail = () => {}

  render() {
    return <p>Detail Page</p>
  }
}

export default Detail
