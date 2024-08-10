<template>
  <div class="admin-panel">
    <div class="content">
      <div class="project-board">
        <div class="board-header">
          <router-link class="btn btn-primary" :to="{ name: 'ProjectList' }">
            < Cabinet
          </router-link>
          <h1 class="board-title">Notifications</h1>
        </div>

        <ul class="list-group mt-3">
          <li
            v-for="notification in notifications"
            :key="notification.id"
            class="list-group-item"
            :class="{ 'list-group-item-secondary': notification.read }"
          >
            <p>{{ notification.message }}</p>
            <button
              v-if="!notification.read"
              @click="markAsRead(notification.id)"
              class="btn btn-primary"
            >
              Mark as Read
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'

const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.getNotifications)

onMounted(() => {
  notificationStore.fetchNotifications()
  notificationStore.subscribeToSocketEvents()
})

const markAsRead = async (notificationId: number) => {
  await notificationStore.markAsRead(notificationId)
}
</script>

<style scoped>
.project-board {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
  background-color: #f4f5f7;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.board-title {
  font-size: 2rem;
  font-weight: bold;
}
</style>
