import React, { Component } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import takeRight from 'lodash/takeRight'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'
import format from 'date-fns/format'
import accounting from 'accounting'

import Classes from './detail.module.scss'

import { BASE_URL_IMAGE } from '../../services/env'
import API from '../../services/services'

class Detail extends Component {
  state = {
    id: null,
    slug: null,
    showLoading: false,
    movie: {},
  }

  async componentDidMount() {
    await this.setInitialState()
    await this.getMovieDetail()
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

  getMovieDetail = async () => {
    try {
      await this.setState({
        movie: {},
        showLoading: true,
      })

      const response = await API.get(`/movie/${this.state.id}`)

      response.data.genreText = map(response.data.genres, 'name').join(', ')
      response.data.language = map(response.data.spoken_languages, 'name').join(
        ', '
      )

      // Calculate the price
      let price = 0
      const rating = response.data.vote_average
      if (rating <= 3) {
        price = 3500
      } else if (rating <= 6) {
        price = 8250
      } else if (rating <= 8) {
        price = 16350
      } else if (rating <= 10) {
        price = 21250
      }
      response.data.price = price
      await this.setState({
        movie: response.data,
      })
    } catch (error) {
      console.log(error)
    } finally {
      await this.setState({
        showLoading: false,
      })
    }
  }

  render() {
    const { movie } = this.state

    let detail = <></>
    if (!isEmpty(movie)) {
      detail = (
        <>
          {this.state.showLoading && (
            <div className={Classes.loading}>
              <CircularProgress color="primary" />
            </div>
          )}
          <img
            src={BASE_URL_IMAGE + movie.backdrop_path}
            alt="backdrop"
            className={Classes.backdropImage}
          />
          <div className={Classes.mainArea}>
            <Card className={Classes.card}>
              <CardMedia
                className={Classes.media}
                image={BASE_URL_IMAGE + movie.poster_path}
                title={movie.title}
              />
              <div className={Classes.cardDetail}>
                <CardContent className={Classes.cardContent}>
                  <p className={Classes.movieTitle}>{movie.title}</p>
                  <p className={Classes.movieTagline}>{movie.tagline}</p>
                  <p className={Classes.movieRating}>
                    <b>Rating: </b>
                    <span className={Classes.ratingValue}>
                      {movie.vote_average}
                    </span>{' '}
                    / 10
                  </p>
                  <p className={Classes.movieGenre}>
                    <b>Genre: </b>
                    {movie.genreText}
                  </p>
                  <p className={Classes.movieLanguage}>
                    <b>Language: </b>
                    {movie.language}
                  </p>
                  <p className={Classes.movieRelease}>
                    <b>Release Date: </b>
                    {format(movie.release_date, 'DD MMMM YYYY')}
                  </p>
                  <p className={Classes.movieOverview}>"{movie.overview}"</p>
                </CardContent>
                <CardActions className={Classes.cardActions}>
                  <p className={Classes.price}>
                    {accounting.formatMoney(movie.price, 'Rp ', 0, '.')}
                  </p>
                  <Button color="secondary" variant="outlined" size="large">
                    Buy
                  </Button>
                </CardActions>
              </div>
            </Card>
          </div>
        </>
      )
    }

    return <div className={Classes.detail}>{detail}</div>
  }
}

export default Detail
