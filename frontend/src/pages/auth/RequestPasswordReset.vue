<template>
  <div class="container mt-5">
    <h1>Request Password Reset</h1>
    <form @submit.prevent="requestReset">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input v-model="email" type="email" id="email" class="form-control" autocomplete="email" />
      </div>
      <button type="submit" class="btn btn-primary">Request Password Reset</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');

const requestReset = async () => {
  await axios.post('/users/request-reset', { email: email.value });
  email.value = '';
};
</script>
