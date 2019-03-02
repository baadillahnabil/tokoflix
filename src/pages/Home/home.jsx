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

      const response = await API.get('/discover/movie', {
        params: {
          page: this.state.currentPage,
          sort_by: 'release_date.desc',
          language: 'en-US',
          region: 'ID',
          include_video: true,
        },
      })

      const movies = []
      for (const result of response.data.results) {
        const movie = {
          ...result,
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

      const response = await API.get('/genre/movie/list', {
        params: {
          language: 'en-US',
        },
      })

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

  onBuy = movie => {
    const currentBalance = this.contextApiState.balance
    this.contextApiActions.updateBalance(currentBalance - movie.price)
    this.contextApiState = this.props.state
  }

  render() {
    // Render cards with data from API
    let moviesCards = []
    if (this.state.movies !== []) {
      for (const movie of this.state.movies) {
        moviesCards.push(
          <Grid item xs={3} key={movie.id}>
            <Card className={Classes.card}>
              <CardActionArea>
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
                  variant="outlined"
                  className={Classes.buttonBuy}
                  onClick={() => this.onBuy(movie)}
                >
                  Buy
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
