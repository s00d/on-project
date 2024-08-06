import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
