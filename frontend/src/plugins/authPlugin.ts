import { useAuthStore } from '@/stores/authStore'
import type { App } from 'vue'

export default {
  install: async (app: App) => {
    const authStore = useAuthStore()

    if (!authStore.isUserLoaded) {
      await authStore.fetchUser().catch(() => {})
    }
  }
}
