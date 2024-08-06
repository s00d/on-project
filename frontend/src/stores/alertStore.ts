import { defineStore } from 'pinia';

export const useAlertStore = defineStore('alert', {
  state: () => ({
    message: '',
    type: 'success',
  }),
  actions: {
    setAlert(message: string, type: string = 'success') {
      this.message = message;
      this.type = type;
      setTimeout(() => {
        this.clearAlert();
      }, 5000);
    },
    clearAlert() {
      this.message = '';
    },
  },
});
