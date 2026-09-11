import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api-distribucion-fkhpfeavh9c9gvay.canadacentral-01.azurewebsites.net'
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api
