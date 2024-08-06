<template>
  <div class="container mt-5">
    <h1>Two-Factor Authentication</h1>
    <div v-if="!twoFactorEnabled">
      <button @click="enable2FA" class="btn btn-primary">Enable 2FA</button>
      <div v-if="qrCodeUrl">
        <img :src="qrCodeUrl" alt="QR Code" />
        <input v-model="token" placeholder="Enter token" class="form-control mt-2" />
        <button @click="verify2FA" class="btn btn-primary mt-2">Verify</button>
      </div>
    </div>
    <div v-else>
      <button @click="disable2FA" class="btn btn-danger">Disable 2FA</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export default defineComponent({
  name: 'TwoFactorAuth',
  setup() {
    const authStore = useAuthStore();
    const qrCodeUrl = ref('');
    const token = ref('');

    const enable2FA = async () => {
      const response = await axios.post('/users/2fa/enable');
      qrCodeUrl.value = response.data.qrCodeUrl;
    };

    const verify2FA = async () => {
      const response = await axios.post('/auth/2fa/verify', { token: token.value });
      if (response.data.success) {
        const user = authStore.getUser;
        if (user) {
          user.twoFactorEnabled = true;
          qrCodeUrl.value = '';
          token.value = '';
        }

      }
    };

    const disable2FA = async () => {
      const response = await axios.post('/auth/2fa/disable');
      if (response.data.success) {
        authStore.getUser.twoFactorEnabled = false;
      }
    };

    return { qrCodeUrl, token, enable2FA, verify2FA, disable2FA, twoFactorEnabled: authStore.getUser.twoFactorEnabled };
  },
});
</script>
