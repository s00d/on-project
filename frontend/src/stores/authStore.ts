import { defineStore } from 'pinia'
import axios from 'axios'
import { useAlertStore } from './alertStore'

export interface User {
  id: number
  username: string
  email: string
  twoFactorEnabled: boolean
}

export interface Role {
  id: number
  name: string
}

interface AuthState {
  token: string
  userId: number | null
  user: User | null
  roles: Role[]
  isUserLoaded: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token') || '',
    userId: null,
    user: null,
    roles: [],
    isUserLoaded: false
  }),
  actions: {
    async login(user: { email: string; password: string }) {
      try {
        const response = await axios.post('/users/login', user)
        const { token, twoFactorRequired } = response.data
        if (twoFactorRequired) {
          localStorage.setItem('token', token)
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          useAlertStore().setAlert('2FA required', 'warning')
          return { twoFactorRequired: true }
        }

        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        this.token = token
        await this.fetchUser()
        useAlertStore().setAlert('Login successful', 'success')
      } catch (error) {
        console.error('Login failed', 'danger')
        useAlertStore().setAlert('Login failed', 'danger')
      }
    },
    async register(user: { username: string; email: string; password: string }) {
      try {
        await axios.post('/users/register', user)
        useAlertStore().setAlert('Registration successful', 'success')
      } catch (error) {
        useAlertStore().setAlert('Registration failed', 'danger')
      }
    },
    async fetchUser() {
      try {
        const response = await axios.get('/users/me')
        if(response.data.user) {
          this.user = { ...response.data }
          this.userId = response.data.user.id
          this.isUserLoaded = true
        }
      } catch (error) {
        this.isUserLoaded = false
        console.error('Failed to fetch user', error)
      }
    },

    async updateProfile(user: { username: string; email: string }) {
      const response = await axios.put('/users/me', user)
      this.user = { ...response.data }
    },
    async changePassword(passwords: { currentPassword: string; newPassword: string }) {
      await axios.put('/users/me/password', passwords)
    },
    async enable2FA() {
      const response = await axios.post('/users/2fa/enable')
      return response.data
    },
    async verify2FA(token: string) {
      await axios.post('/users/2fa/verify', { token })
      await this.fetchUser()
    },
    async disable2FA() {
      await axios.post('/users/2fa/disable')
      await this.fetchUser()
    },
    logout() {
      this.token = ''
      this.user = null
      this.roles = []
      this.isUserLoaded = false
      this.userId = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      useAlertStore().setAlert('Logged out successfully', 'success')
    }
  },
  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    getUser: (state): User | null => state.user,
    getUserId: (state): number | null => state.userId,
    getUserRoles: (state): string[] => state.roles.map((role) => role.name)
  }
})
