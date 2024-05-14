import axios from 'axios'
import {MAINTAINANCE_MODE, SIGNIN} from './routePath'

export const BASE_API_PATH = '/api/v1/'

// Setting base URL for backend requests
const instance = axios.create({
  baseURL:
    process.env.REACT_APP_API_ENDPOINT !== undefined
      ? process.env.REACT_APP_API_ENDPOINT
      : 'https://localhost:44310',
  headers: {
    common: {'x-team-access': process.env.REACT_APP_API_TEAM_ACCESS_KEY},
  },
})

// Setting auth (if JWT present)
const token = localStorage.getItem('token')
if (token) {
  instance.defaults.headers['Authorization'] = `Bearer ${token}`
}

instance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (
      error?.response?.status === 503 &&
      error?.response?.data?.data?.isMaintenanceEnabled
    ) {
      window.location = `/${MAINTAINANCE_MODE}`
    }
    if (
      error.config.url.split('/').at(-1) === 'login' ||
      error.config.url.split('/').at(-1) === 'updateMyPassword'
    ) {
      return Promise.reject(error)
    }
    if (error.response.status === 401) {
      localStorage.clear()
      sessionStorage.clear()
      window.location = `/${SIGNIN}`
    }
    return Promise.reject(error)
  }
)

export default instance
