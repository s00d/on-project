<template>
  <div class="container mt-5">
    <h1>Register</h1>
    <form @submit.prevent="register" class="mt-3">
      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input v-model="username" type="text" id="username" class="form-control" />
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input v-model="email" type="email" id="email" class="form-control" />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input v-model="password" type="password" id="password" class="form-control" />
      </div>
      <button type="submit" class="btn btn-primary">Register</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'RegisterPage',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const username = ref('');
    const email = ref('');
    const password = ref('');

    const register = async () => {
      try {
        await authStore.register({ username: username.value, email: email.value, password: password.value });
        alert('Registration successful');
        router.push('/login');
      } catch (error) {
        alert('Registration failed');
      }
    };

    return { username, email, password, register };
  },
});
</script>
