<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <router-link class="navbar-brand" :to="{ name: 'Home' }">Project Manager</router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item" v-if="isAuthenticated">
            <NotificationDropdown />
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <router-link class="nav-link" :to="{ name: 'ProfilePage' }">Profile</router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <router-link class="nav-link" :to="{ name: 'ProjectList' }">Cabinet</router-link>
          </li>

          <li class="nav-item">
            <a class="nav-link" href="/docs">Api Docs</a>
          </li>

          <li class="nav-item" v-if="isAuthenticated">
            <a class="nav-link" @click="logout">Logout</a>
          </li>
          <li class="nav-item" v-if="!isAuthenticated">
            <router-link class="nav-link" :to="{ name: 'Login' }">Login</router-link>
          </li>
          <li class="nav-item" v-if="!isAuthenticated">
            <router-link class="nav-link" :to="{ name: 'Register' }">Register</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import NotificationDropdown from '@/components/NotificationDropdown.vue'

const authStore = useAuthStore()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const logout = () => {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>
