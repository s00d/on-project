import { useAuthStore } from '@/stores/authStore'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export const authGuard = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore()
  console.log(2222, authStore.isAuthenticated)
  if (authStore.isAuthenticated) {
    next()
  } else {
    next('/auth/login')
  }
}
