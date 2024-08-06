import { io } from 'socket.io-client';
import type {App} from "vue";

export const socket = io(import.meta.env.VITE_SOCKET_URL);

export default {
  install: (app: App) => {
    app.config.globalProperties.$socket = socket;
  }
};
