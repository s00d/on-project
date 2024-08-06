<div class="container mt-5">
<h1>Login</h1>
<form @submit.prevent="login" class="mt-3">
  <div class="mb-3">
    <label for="email" class="form-label">Email</label>
    <input v-model="email" type="email" id="email" class="form-control" />
  </div>
  <div class="mb-3">
    <label for="password" class="form-label">Password</label>
    <input v-model="password" type="password" id="password" class="form-control" />
  </div>
  <button type="submit" class="btn btn-primary">Login</button>
</form>
</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: "LoginPage",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const email = ref('');
    const password = ref('');

    const login = async () => {
      try {
        const result = await authStore.login({ email: email.value, password: password.value });
        if (result?.twoFactorRequired) {
          router.push('/verify-2fa');
        } else {
          router.push('/projects');
        }
      } catch (error) {
        alert('Login failed');
      }
    };

    return { email, password, login };
  },
});
</script>
