import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import authPlugin from './plugins/authPlugin'
import socketPlugin from './plugins/socketPlugin'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fortawesome/fontawesome-free/css/all.css'
import { useAlertStore } from '@/stores/alertStore'

axios.defaults.baseURL = import.meta.env.VITE_API_URL

axios.interceptors.response.use(
  (response) => response, // If the request is successful, just return the response
  (error) => {
    // Check if the error response exists and has a 422 status code
    if (error.response?.status === 422) {
      const { errors } = error.response.data

      console.log(1111, error.response.errors)

      // Iterate over the errors array and display each message
      if (errors && typeof errors === 'object') {
        Object.keys(errors).forEach((key) => {
          const err = errors[key]
          if (err.message) {
            useAlertStore().setAlert(err.message, 'danger')
          }
        })
      } else {
        // If there's a general error message, show it
        useAlertStore().setAlert('An error occurred', 'danger')
      }

      throw new Error('Validation Error')
    } else {
      // Optionally, handle other status codes or pass them through
      console.error('An error occurred', error.response.status, error.message)
    }

    // throw new Error(error)
    // Return a rejected promise to allow further handling if necessary
    return Promise.reject(error)
  }
)

async function initializeApp() {
  const app = createApp(App)

  app.use(createPinia())
  // Инициализируем плагин
  await authPlugin.install(app)

  // Устанавливаем роутер и хранилище после инициализации плагина
  app.use(router)
  app.use(socketPlugin)
  app.mount('#app')
}

initializeApp()
