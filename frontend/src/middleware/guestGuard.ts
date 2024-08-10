import { useAuthStore } from '@/stores/authStore'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export const guestGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    next()
  } else {
    next('/cabinet')
  }
}
