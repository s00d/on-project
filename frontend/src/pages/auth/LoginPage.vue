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
        <input v-model="password" type="password" id="password" class="form-control" autocomplete="current-password" />
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');

const login = async () => {
  try {
    const result = await authStore.login({ email: email.value, password: password.value });
    if (result?.twoFactorRequired) {
      router.push('/auth/verify-2fa');
    } else {
      router.push('/cabinet');
    }
  } catch (error) {
    alert('Login failed');
  }
};
</script>
