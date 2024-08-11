<template>
  <ul class="list-group">
    <li
      v-for="entry in taskHistory"
      :key="entry.id"
      class="list-group-item d-flex justify-content-between align-items-start"
    >
      <div class="me-3 flex-grow-1">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong class="username">{{ entry.user.username }}: <span v-if="entry.action" class="action-label">{{ entry.action }}</span></strong>

          <span class="badge bg-secondary align-self-start">{{ new Date(entry.timestamp).toLocaleString() }}</span>
        </div>

        <div v-for="(change, field) in entry.changes" :key="field" class="change-entry">
          <span>
            <strong>{{ field }}:</strong>
            <span>{{ change.oldValue ?? 'N/A' }}</span>
            &rarr;
            <span>{{ change.newValue }}</span>
          </span>
        </div>
      </div>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineProps } from 'vue'
import axios from 'axios'

export interface TaskHistory {
  id: number;
  taskId: number;        // ID задачи
  userId: number;        // ID пользователя, который совершил действие
  action: string;        // Описание действия
  changes: Record<string, { oldValue: any; newValue: any }>; // Объект изменений
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

<style scoped>
.list-group-item {
  padding: 10px;
}

.username {
  font-weight: bold;
  margin-right: 10px;
}

.action-label {
  display: inline-block;
  padding: 2px 6px;
  font-size: 0.8em;
  color: #fff;
  background-color: #007bff;
  border-radius: 3px;
  margin-bottom: 5px;
}

.change-entry {
  margin-left: 15px;
}

.badge {
  font-size: 0.8em;
}

.btn-danger {
  font-size: 0.9em;
}

.me-3.flex-grow-1 {
  width: 100%;
}
</style>
