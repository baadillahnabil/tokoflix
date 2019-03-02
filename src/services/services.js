import axios from 'axios'
import { BASE_URL, API_KEY } from './env'

const API = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
})

export default API
