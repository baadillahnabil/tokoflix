import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import qs from 'query-string'
import accounting from 'accounting'
import kebabCase from 'lodash/kebabCase'
import find from 'lodash/find'

import Classes from './home.module.scss'

import { BASE_URL_IMAGE } from '../../services/env'
import API from '../../services/services'

import { contextWrapper } from '../../contextApi/context'

class Home extends Component {
  state = {
    movies: [],
    genres: [],
    showLoading: true,
    currentPage: 1,
    totalPages: 1,
  }

  // Context API
  contextApiState = this.props.state
  contextApiActions = this.props.actions

  async componentDidMount() {
    await this.getGenres()
    await this.getMovies()
  }

  getMovies = async () => {
    try {
      await this.setState({
        movies: [],
        showLoading: true,
      })

      // Get page from url params
      const pageFromUrl = qs.parse(this.props.location.search).page
      if (pageFromUrl) {
        await this.setState({
          currentPage: pageFromUrl,
        })
      } else {
        await this.setState({
          currentPage: 1,
        })
      }

      const response = await API.get('/movie/now_playing', {
        params: {
          page: this.state.currentPage,
          sort_by: 'release_date.desc',
          region: 'ID',
        },
      })

      // NOTE: Because the data of 'Now Playing in Indonesia' is not much,
      // I recommend if you want to test with the complete data,
      // change the params above like this one:
      //      params: {
      //        page: this.state.currentPage,
      //        sort_by: 'popularity.desc',
      //      },

      const movies = []
      for (const result of response.data.results) {
        const movie = {
          ...result,
          owned: false,
        }

        // Generate movie genre based on it's IDs
        const genres = []
        for (const genre_id of result.genre_ids) {
          const match = this.state.genres.find(genre => genre.id === genre_id)
          genres.push(match.name)
        }
        movie.genres = genres.join(', ')

        // Calculate the price
        let price = 0
        const rating = result.vote_average
        if (rating <= 3) {
          price = 3500
        } else if (rating <= 6) {
          price = 8250
        } else if (rating <= 8) {
          price = 16350
        } else if (rating <= 10) {
          price = 21250
        }
        movie.price = price

        // Check whether already owned or not
        movie.owned =
          find(
            this.contextApiState.moviesOwned,
            movieId => movieId === result.id
          ) !== undefined

        movies.push(movie)
      }

      await this.setState({
        movies,
        totalPages: response.data.total_pages,
      })
    } catch (error) {
      console.log(error)
    } finally {
      await this.setState({
        showLoading: false,
      })
    }
  }

  getGenres = async () => {
    try {
      await this.setState({
        genres: [],
        showLoading: true,
      })

      const response = await API.get('/genre/movie/list')
      await this.setState({
        genres: response.data.genres,
      })
    } catch (error) {
      console.log(error)
    } finally {
      await this.setState({
        showLoading: false,
      })
    }
  }

  onNextPage = async () => {
    let currentPage = Number(this.state.currentPage)
    this.props.history.push(`?page=${(currentPage += 1)}`)
    await this.getMovies()
  }

  onPrevPage = async () => {
    let currentPage = Number(this.state.currentPage)
    if ((currentPage -= 1) === 1) {
      this.props.history.push('/')
    } else {
      this.props.history.push(`?page=${currentPage}`)
    }
    await this.getMovies()
  }

  onBuy = async movie => {
    // 1. Check minimum balance to prevent insufficient balance
    if (this.contextApiState.balance <= 0) {
      this.contextApiActions.updateSnackbar({
        open: true,
        message: 'Insufficient Balance',
        duration: 1500,
      })
    }

    // 2. Check if owned
    if (!movie.owned) {
      // 1. Check if balance is enough to deduct current price
      const currentBalance = this.contextApiState.balance
      if (currentBalance - movie.price <= 0) {
        this.contextApiActions.updateSnackbar({
          open: true,
          message: 'Insufficient Balance',
          duration: 1500,
        })
        return
      }

      // 2. Update ContextAPI Balance
      await this.contextApiActions.updateBalance(currentBalance - movie.price)
      this.contextApiState = this.props.state

      // 3. Add the id to list of movies owned
      const moviesOwned = [...this.contextApiState.moviesOwned]
      moviesOwned.push(movie.id)
      await this.contextApiActions.updateMoviesOwned(moviesOwned)
      this.contextApiState = this.props.state

      // 4. Change button style
      const moviesClone = [...this.state.movies]
      const updateIndex = moviesClone.findIndex(
        movieObj => movieObj.id === movie.id
      )
      moviesClone[updateIndex].owned = true
      await this.setState({
        movies: moviesClone,
      })
    }
  }

  goToDetailPage = async movie => {
    this.props.history.push(`/${movie.id}-${kebabCase(movie.title)}`)
  }

  render() {
    // Render cards with data from API
    let moviesCards = []
    if (this.state.movies !== []) {
      for (const movie of this.state.movies) {
        moviesCards.push(
          <Grid item xs={3} key={movie.id}>
            <Card className={Classes.card}>
              <CardActionArea onClick={() => this.goToDetailPage(movie)}>
                <CardMedia
                  className={Classes.media}
                  image={BASE_URL_IMAGE + movie.poster_path}
                  title={movie.title}
                />
                <CardContent className={Classes.cardContent}>
                  <div className={Classes.movieMeta}>
                    <span>
                      <span className={Classes.rating}>
                        {movie.vote_average}
                      </span>{' '}
                      / 10
                    </span>{' '}
                    {' - '}
                    <span>{movie.genres}</span>
                  </div>
                  <p className={Classes.movieTitle}>{movie.title}</p>
                  <p className={Classes.movieOverview}>{movie.overview}</p>
                </CardContent>
              </CardActionArea>
              <CardActions className={Classes.cardActions}>
                <p className={Classes.price}>
                  {accounting.formatMoney(movie.price, 'Rp ', 0, '.')}
                </p>
                <Button
                  color="primary"
                  disabled={movie.owned}
                  variant="outlined"
                  onClick={() => this.onBuy(movie)}
                >
                  {movie.owned ? 'Owned' : 'Buy'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )
      }
    }

    return (
      <div className={Classes.home}>
        <p className={Classes.title}>Now Playing</p>
        {this.state.showLoading && (
          <div className={Classes.loading}>
            <CircularProgress color="primary" />
          </div>
        )}
        <Grid container spacing={24}>
          {moviesCards}
        </Grid>
        <div className={Classes.pagination}>
          <Button
            variant="outlined"
            color="primary"
            onClick={this.onPrevPage}
            disabled={this.state.currentPage <= 1}
          >
            Prev
          </Button>
          <p className={Classes.currentPageText}>
            Page
            <span className={Classes.pageNumber}>{this.state.currentPage}</span>
          </p>
          <Button
            variant="outlined"
            color="secondary"
            onClick={this.onNextPage}
            disabled={this.state.currentPage >= this.state.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    )
  }
}

export default contextWrapper(Home)
