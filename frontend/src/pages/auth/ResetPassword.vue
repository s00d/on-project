<template>
  <div class="container mt-5">
    <h1>Reset Password</h1>
    <form @submit.prevent="resetPassword">
      <div class="mb-3">
        <label for="token" class="form-label">Token</label>
        <input v-model="token" type="text" id="token" class="form-control" autocomplete="one-time-code" />
      </div>
      <div class="mb-3">
        <label for="newPassword" class="form-label">New Password</label>
        <input v-model="newPassword" type="password" id="newPassword" class="form-control" autocomplete="new-password" />
      </div>
      <button type="submit" class="btn btn-primary">Reset Password</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import axios from 'axios';

const token = ref('');
const newPassword = ref('');

const resetPassword = async () => {
  await axios.post('/users/reset-password', { token: token.value, newPassword: newPassword.value });
  token.value = '';
  newPassword.value = '';
};
</script>
