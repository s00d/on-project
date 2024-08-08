<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Notifications</h1>
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
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted} from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import Tabs from '@/components/Tabs.vue'

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
