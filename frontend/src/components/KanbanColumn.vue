<template>
  <div
    class="kanban-column"
    :class="{ 'drag-over': isDragOver }"
    @dragover.prevent
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <h2 class="column-title">{{ status }}</h2>
    <div
      v-for="task in tasks"
      :key="task.id"
      class="task-card"
      draggable="true"
      @dragstart="(event) => onDragStart(event, task.id)"
    >
      <h5 class="card-title">{{ task.title }}</h5>
      <p v-if="task.assignees && task.assignees.length">
        Assigned to:
        <span v-for="assignee in task.assignees" :key="assignee">
          <span v-if="users[assignee]" v-text="users[assignee].username"></span>
        </span>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/stores/taskStore'
import type {User} from "@/stores/authStore";

interface Props {
  status: string
  tasks: Task[]
  projectId: string
  users: {[key: string]: User}
}

const props = defineProps<Props>()
const emit = defineEmits(['task-dropped'])

const isDragOver = ref(false)

const onDragStart = (event: DragEvent, taskId: number) => {
  event.dataTransfer?.setData('text/plain', taskId.toString())
}

const onDrop = (event: DragEvent) => {
  const taskId = event.dataTransfer?.getData('text/plain')
  if (taskId) {
    const newStatus = props.status
    emit('task-dropped', Number(taskId), newStatus)
  }
  isDragOver.value = false
}

const onDragEnter = () => {
  isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}
</script>

<style>
.kanban-column {
  width: 30%;
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
  margin: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.kanban-column.drag-over {
  background-color: #d3e0ff;
}

.column-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.task-card {
  background-color: #fff;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  background-color: rgba(128, 128, 128, 0.13);
}

.card-title {
  font-size: 1.25rem;
  margin-bottom: 10px;
}

.task-card p {
  margin: 0;
  font-size: 1rem;
}
</style>
