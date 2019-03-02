import React, { Component } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import takeRight from 'lodash/takeRight'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'
import kebabCase from 'lodash/kebabCase'
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
    recommendations: [],
    similar: [],
  }

  async componentWillMount() {
    await this.setInitialState()
    await this.getMovieDetail()
    await this.getMovieRecommendation()
    await this.getMovieSimilar()
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

      // Generate text data from array data
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

  getMovieRecommendation = async () => {
    try {
      await this.setState({
        recommendations: [],
        showLoading: true,
      })

      const response = await API.get(`/movie/${this.state.id}/recommendations`)
      await this.setState({
        recommendations: response.data.results,
      })
    } catch (error) {
      console.log(error)
    } finally {
      await this.setState({
        showLoading: false,
      })
    }
  }

  getMovieSimilar = async () => {
    try {
      await this.setState({
        similar: [],
        showLoading: true,
      })

      const response = await API.get(`/movie/${this.state.id}/similar`)
      await this.setState({
        similar: response.data.results,
      })
    } catch (error) {
      console.log(error)
    } finally {
      await this.setState({
        showLoading: false,
      })
    }
  }

  showMovieDetail = async movie => {
    // await this.props.actions.updateIsSelectedMovieOwned(true)
    await this.props.history.push(`/${movie.id}-${kebabCase(movie.title)}`)
    await this.setInitialState()
    await this.getMovieDetail()
    await this.getMovieRecommendation()
    await this.getMovieSimilar()
  }

  render() {
    const { movie, recommendations, similar } = this.state

    let detailView = <></>
    let recommendationView = []
    let similarView = []
    if (!isEmpty(movie)) {
      // Recommendations View
      if (isEmpty(recommendations)) {
        recommendationView = (
          <p className={Classes.noRecommendation}>
            Sorry, no recommendation for this movie
          </p>
        )
      } else {
        for (const recommendation of recommendations) {
          recommendationView.push(
            <Grid item xs={3} key={recommendation.id}>
              <Card className={Classes.card}>
                <CardActionArea
                  onClick={() => this.showMovieDetail(recommendation)}
                >
                  <CardMedia
                    className={Classes.media}
                    image={BASE_URL_IMAGE + recommendation.poster_path}
                    title={recommendation.title}
                  />
                  <CardContent className={Classes.cardContent}>
                    <p className={Classes.movieTitle}>{recommendation.title}</p>
                    <p className={Classes.movieOverview}>
                      {recommendation.overview}
                    </p>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        }
      }

      // Similar View
      if (isEmpty(similar)) {
        similarView = (
          <p className={Classes.noSimilar}>
            Sorry, no similar items for this movie
          </p>
        )
      } else {
        for (const sim of similar) {
          similarView.push(
            <Grid item xs={3} key={sim.id}>
              <Card className={Classes.card}>
                <CardActionArea onClick={() => this.showMovieDetail(sim)}>
                  <CardMedia
                    className={Classes.media}
                    image={BASE_URL_IMAGE + sim.poster_path}
                    title={sim.title}
                  />
                  <CardContent className={Classes.cardContent}>
                    <p className={Classes.movieTitle}>{sim.title}</p>
                    <p className={Classes.movieOverview}>{sim.overview}</p>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        }
      }

      // Details View
      detailView = (
        <>
          {/* Loading State */}
          {this.state.showLoading && (
            <div className={Classes.loading}>
              <CircularProgress color="primary" />
            </div>
          )}

          {/* Backdrop Image */}
          <img
            src={BASE_URL_IMAGE + movie.backdrop_path}
            alt="backdrop"
            className={Classes.backdropImage}
          />

          {/* Movie Details */}
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

          {/* Movie Recommendations */}
          <div className={Classes.movieRecommendation}>
            <p className={Classes.recommendationTitle}>Recommendations</p>
            <Grid
              container
              spacing={24}
              className={Classes.recommendationContainer}
            >
              {recommendationView}
            </Grid>
          </div>

          {/* Movie Similar */}
          <div className={Classes.movieSimilar}>
            <p className={Classes.similarTitle}>Similar</p>
            <Grid container spacing={24} className={Classes.similarContainer}>
              {similarView}
            </Grid>
          </div>
        </>
      )
    }

    return <div className={Classes.detail}>{detailView}</div>
  }
}

export default Detail
