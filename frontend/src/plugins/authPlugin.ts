import { useAuthStore } from '@/stores/authStore'
import type { App } from 'vue'

export default {
  install: (app: App) => {
    const authStore = useAuthStore()

    if (!authStore.isUserLoaded) {
      authStore.fetchUser().catch((error) => {
        console.error('Failed to fetch user', error)
      })
    }
  }
}
