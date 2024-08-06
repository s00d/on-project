<template>
  <div class="dropdown">
    <button class="btn btn-secondary dropdown-toggle" type="button" id="notificationDropdown" data-bs-toggle="dropdown" aria-expanded="false">
      Notifications <span class="badge bg-danger">{{ unreadNotifications.length }}</span>
    </button>
    <ul class="dropdown-menu" aria-labelledby="notificationDropdown">
      <li v-if="unreadNotifications.length === 0" class="dropdown-item">No new notifications</li>
      <li v-for="notification in unreadNotifications" :key="notification.id" class="dropdown-item">
        {{ notification.message }}
        <button class="btn btn-link" @click="markAsRead(notification.id)">Mark as read</button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';

export default defineComponent({
  name: 'NotificationDropdown',
  setup() {
    const notificationStore = useNotificationStore();

    onMounted(() => {
      notificationStore.fetchNotifications();
      notificationStore.subscribeToSocketEvents();
    });

    const markAsRead = async (notificationId: number) => {
      await notificationStore.markAsRead(notificationId);
    };

    return { unreadNotifications: notificationStore.unreadNotifications, markAsRead };
  },
});
</script>
