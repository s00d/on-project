import { defineStore } from 'pinia'

export const useAlertStore = defineStore('alert', {
  state: () => ({
    alerts: [] as Array<{ message: string; type: string }> // Array of alerts
  }),
  actions: {
    setAlert(message: string, type: string = 'danger') {
      this.alerts.push({ message, type })
      setTimeout(() => {
        this.clearAlert(message)
      }, 5000)
    },
    clearAlert(message: string) {
      this.alerts = this.alerts.filter((alert) => alert.message !== message)
    },
    clearAllAlerts() {
      this.alerts = []
    }
  }
})
