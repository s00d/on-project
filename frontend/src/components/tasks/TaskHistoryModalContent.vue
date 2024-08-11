<template>
  <div>
    <ul class="list-group">
      <li
        v-for="entry in taskHistory"
        :key="entry.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <span>
          <strong>{{ entry.user.username }}:</strong> {{ entry.action }}
        </span>
        <span class="badge bg-secondary">{{ new Date(entry.timestamp).toLocaleString() }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineProps } from 'vue'
import axios from 'axios'

export interface TaskHistory {
  id: number;
  taskId: number;        // ID задачи
  userId: number;        // ID пользователя, который совершил действие
  action: string;        // Описание действия (например, "created", "updated")
  timestamp: Date;       // Временная метка действия
  createdAt: Date;       // Временная метка создания записи в истории
  updatedAt: Date;       // Временная метка последнего обновления записи
  user: {
    id: number;
    username: string;    // Имя пользователя
  };
  task: {
    id: number;
    title: string;       // Название задачи
  };
}

const props = defineProps<{
  taskId: number
  projectId: string
}>()

const taskHistory = ref<TaskHistory[]>([])

const fetchTaskHistory = async () => {
  try {
    const response = await axios.get(`/task-history/${props.projectId}/${props.taskId}`)
    taskHistory.value = response.data
  } catch (error) {
    console.error('Error fetching task history:', error)
  }
}

onMounted(() => {
  fetchTaskHistory()
})
</script>
