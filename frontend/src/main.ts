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

axios.defaults.baseURL = import.meta.env.VITE_API_URL

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
