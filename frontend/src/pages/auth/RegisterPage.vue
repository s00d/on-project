<template>
  <div class="container mt-5">
    <h1>Register</h1>
    <form @submit.prevent="register" class="mt-3">
      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input
          v-model="username"
          type="text"
          id="username"
          class="form-control"
          autocomplete="username"
        />
      </div>
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
          autocomplete="new-password"
        />
      </div>
      <button type="submit" class="btn btn-primary">Register</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import {useAlertStore} from "@/stores/alertStore";

const authStore = useAuthStore()
const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')

const register = async () => {
  try {
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value
    })
    useAlertStore().setAlert('Registration successful', 'success')
    router.push('/auth/login')
  } catch (error) {
    useAlertStore().setAlert('Registration failed', 'danger')
  }
}
</script>
