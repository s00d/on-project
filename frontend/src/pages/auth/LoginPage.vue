<template>
  <div class="container mt-5">
    <h1>Login</h1>
    <form @submit.prevent="login" class="mt-3">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input v-model="email" type="email" id="email" class="form-control" autocomplete="email" />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input
          v-model="password"
          type="password"
          id="password"
          class="form-control"
          autocomplete="current-password"
        />
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { useAlertStore } from '@/stores/alertStore'

const authStore = useAuthStore()
const router = useRouter()
const email = ref('admin@admin.ru')
const password = ref('admin@admin.ru')
const error = ref('')

const login = async () => {
  try {
    const result = await authStore.login({ email: email.value, password: password.value })
    if (result?.twoFactorRequired) {
      useAlertStore().setAlert('2FA required', 'warning')
      router.push({ name: 'TwoFactorAuth' })
    } else {
      useAlertStore().setAlert('Login successful', 'success')
      router.push({ name: 'ProjectList' })
    }
  } catch (err: any) {
    useAlertStore().setAlert('Login failed', 'danger')
  }
}
</script>
