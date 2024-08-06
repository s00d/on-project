<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">Project Manager</router-link>
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
            <router-link class="nav-link" to="/cabinet/profile">Profile</router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <router-link class="nav-link" to="/cabinet">Cabinet</router-link>
          </li>

          <li class="nav-item" v-if="isAuthenticated">
            <a class="nav-link" @click="logout">Logout</a>
          </li>
          <li class="nav-item" v-if="!isAuthenticated">
            <router-link class="nav-link" to="/auth/login">Login</router-link>
          </li>
          <li class="nav-item" v-if="!isAuthenticated">
            <router-link class="nav-link" to="/auth/register">Register</router-link>
          </li>

        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import NotificationDropdown from "@/components/NotificationDropdown.vue";

const authStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);

const logout = () => {
  authStore.logout();
  router.push('/auth/login');
};
</script>
