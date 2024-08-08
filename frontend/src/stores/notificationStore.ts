import { defineStore } from 'pinia'
import axios from 'axios'
import { socket } from '@/plugins/socketPlugin'
import { useAlertStore } from './alertStore'

interface Notification {
  id: number
  userId: number
  message: string
  read: boolean
}

interface NotificationState {
  notifications: Notification[]
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: []
  }),
  actions: {
    async fetchNotifications() {
      try {
        const response = await axios.get('/notifications')
        this.notifications = response.data
      } catch (error) {
        useAlertStore().setAlert('Failed to fetch notifications', 'danger')
      }
    },
    async markAsRead(notificationId: number) {
      try {
        const response = await axios.put(`/notifications/${notificationId}/read`)
        const index = this.notifications.findIndex((n) => n.id === notificationId)
        if (index !== -1) {
          this.notifications[index] = response.data
          useAlertStore().setAlert('Notification marked as read', 'success')
        }
      } catch (error) {
        useAlertStore().setAlert('Failed to mark notification as read', 'danger')
      }
    },
    subscribeToSocketEvents() {
      socket.on('notification:create', (notification) => {
        this.notifications.push(notification)
      })
      socket.on('notification:read', (updatedNotification) => {
        const index = this.notifications.findIndex(
          (notification) => notification.id === updatedNotification.id
        )
        if (index !== -1) {
          this.notifications[index] = updatedNotification
        }
      })
    }
  },
  getters: {
    unreadNotifications: (state) => state.notifications.filter((n) => !n.read),
    getNotifications: (state) => state.notifications,
  }
})
