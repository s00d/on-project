<template>
  <div class="dropdown" @click="toggleDropdown">
    <button
      class="btn btn-light dropdown-toggle"
      type="button"
      id="notificationDropdown"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      Notifications <span class="badge bg-danger">{{ unreadNotifications.length }}</span>
    </button>
    <ul v-if="isDropdownOpen" class="dropdown-menu show" aria-labelledby="notificationDropdown">
      <li v-if="unreadNotifications.length === 0" class="dropdown-item">No new notifications</li>
      <li v-for="notification in unreadNotifications" :key="notification.id" class="dropdown-item">
        {{ notification.message }}
        <button class="btn btn-link" @click="markAsRead(notification.id)">Mark as read</button>
      </li>
      <li class="dropdown-item">
        <router-link class="nav-link" :to="{ name: 'NotificationList' }" tag="span"
          >See all</router-link
        >
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'

const notificationStore = useNotificationStore()
const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    notificationStore.fetchNotifications()
  }
}

const markAsRead = async (notificationId: number) => {
  await notificationStore.markAsRead(notificationId)
}

onMounted(() => {
  notificationStore.subscribeToSocketEvents()
})

const unreadNotifications = computed(() => notificationStore.unreadNotifications)
</script>

<style scoped>
.dropdown-menu {
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
}
</style>
