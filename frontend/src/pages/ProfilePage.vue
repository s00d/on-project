<template>
  <div class="admin-panel">
    <div class="content">
      <div class="container mt-5">
        <h1>Profile</h1>
        <form @submit.prevent="updateProfile" class="mt-3">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input v-model="username" type="text" id="username" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input v-model="email" type="email" id="email" class="form-control" required />
          </div>
          <button type="submit" class="btn btn-primary">Update Profile</button>
        </form>
        <hr class="mt-5" />
        <h2>Change Password</h2>
        <form @submit.prevent="changePassword" class="mt-3">
          <div class="mb-3">
            <label for="currentPassword" class="form-label">Current Password</label>
            <input
              v-model="currentPassword"
              type="password"
              id="currentPassword"
              class="form-control"
              required
            />
          </div>
          <div class="mb-3">
            <label for="newPassword" class="form-label">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              id="newPassword"
              class="form-control"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary">Change Password</button>
        </form>
        <hr class="mt-5" />
        <h2>Two-Factor Authentication (2FA)</h2>
        <div v-if="!user?.twoFactorEnabled">
          <button @click="enable2FA" class="btn btn-info">Enable 2FA</button>
          <div v-if="qrCodeUrl">
            <h3>Scan this QR code with your authenticator app</h3>
            <img :src="qrCodeUrl" alt="QR Code" />
            <form @submit.prevent="verify2FA" class="mt-3">
              <div class="mb-3">
                <label for="token" class="form-label">Enter Token</label>
                <input v-model="token" type="text" id="token" class="form-control" required />
              </div>
              <button type="submit" class="btn btn-primary">Verify</button>
            </form>
          </div>
        </div>
        <div v-else>
          <button @click="disable2FA" class="btn btn-danger">Disable 2FA</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useAlertStore } from '@/stores/alertStore'

const authStore = useAuthStore()
const alertStore = useAlertStore()
const username = ref(authStore.user?.username)
const email = ref(authStore.user?.email)
const currentPassword = ref('')
const newPassword = ref('')
const qrCodeUrl = ref('')
const token = ref('')

const user = computed(() => authStore.getUser)

const updateProfile = async () => {
  try {
    await authStore.updateProfile({ username: username.value!, email: email.value! })
    alertStore.setAlert('Profile updated successfully', 'success')
  } catch (error) {
    alertStore.setAlert('Failed to update profile', 'danger')
  }
}

const changePassword = async () => {
  try {
    await authStore.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })
    alertStore.setAlert('Password changed successfully', 'success')
  } catch (error) {
    alertStore.setAlert('Failed to change password', 'danger')
  }
}

const enable2FA = async () => {
  try {
    const response = await authStore.enable2FA()
    qrCodeUrl.value = response.qrCodeUrl
  } catch (error) {
    alertStore.setAlert('Failed to enable 2FA', 'danger')
  }
}

const verify2FA = async () => {
  try {
    await authStore.verify2FA(token.value)
    alertStore.setAlert('2FA enabled successfully', 'success')
    qrCodeUrl.value = ''
  } catch (error) {
    alertStore.setAlert('Failed to verify 2FA', 'danger')
  }
}

const disable2FA = async () => {
  try {
    await authStore.disable2FA()
    alertStore.setAlert('2FA disabled successfully', 'success')
  } catch (error) {
    alertStore.setAlert('Failed to disable 2FA', 'danger')
  }
}
</script>

<style scoped>
.admin-panel {
  padding: 20px;
}
.content {
  max-width: 600px;
  margin: 0 auto;
}
</style>
