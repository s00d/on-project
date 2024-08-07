<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Create Task</h1>
          <form @submit.prevent="createTask" class="mt-3">
            <div class="mb-3">
              <label for="title" class="form-label">Task Title</label>
              <input v-model="title" type="text" id="title" class="form-control" required />
            </div>
            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <MdEditor v-model="description" language="en-US" />
            </div>
            <div class="mb-3">
              <label for="status" class="form-label">Status</label>
              <select v-model="status" id="status" class="form-select" required>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="priority" class="form-label">Priority</label>
              <select v-model="priority" id="priority" class="form-select" required>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="assignee" class="form-label">Assignee</label>
              <select v-model="assigneeId" id="assignee" class="form-select">
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.username }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="dueDate" class="form-label">Due Date</label>
              <input v-model="dueDate" type="date" id="dueDate" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="estimatedTime" class="form-label">Estimated Time (hours)</label>
              <input v-model="estimatedTime" type="number" id="estimatedTime" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="type" class="form-label">Task Type</label>
              <select v-model="type" id="type" class="form-select">
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="test">Test</option>
                <option value="deploy">Deploy</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="plannedDate" class="form-label">Planned Date</label>
              <input v-model="plannedDate" type="date" id="plannedDate" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="relatedTaskId" class="form-label">Related Task</label>
              <select v-model="relatedTaskId" id="relatedTaskId" class="form-select">
                <option v-for="task in tasks" :key="task.id" :value="task.id">
                  {{ task.title }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="estimatedCost" class="form-label">Estimated Cost</label>
              <input v-model="estimatedCost" type="number" id="estimatedCost" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="actualTime" class="form-label">Actual Time (hours)</label>
              <input v-model="actualTime" type="number" id="actualTime" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="actualCost" class="form-label">Actual Cost</label>
              <input v-model="actualCost" type="number" id="actualCost" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="tags" class="form-label">Tags (comma-separated)</label>
              <input v-model="tags" type="text" id="tags" class="form-control" />
            </div>
            <button type="submit" class="btn btn-primary">Create Task</button>
          </form>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import {type Task, useTaskStore} from '@/stores/taskStore'
import { type User } from '@/stores/authStore'
import { useRoute, useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useProjectStore } from '@/stores/projectStore'
import Tabs from '@/components/Tabs.vue'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const route = useRoute()
const router = useRouter()

const projectId = route.params.projectId.toString()
const title = ref('')
const description = ref('')
const status = ref('To Do')
const priority = ref('Medium')
const assigneeId = ref<number | null>(null)
const dueDate = ref<string | null>(null)
const estimatedTime = ref<number | null>(null)
const type = ref<string>('frontend')
const plannedDate = ref<string | null>(null)
const relatedTaskId = ref<number | null>(null)
const estimatedCost = ref<number | null>(null)
const actualTime = ref<number | null>(null)
const actualCost = ref<number | null>(null)
const tags = ref<string>('')

const users = ref<User[]>([])
const tasks = ref<Task[]>([])

const fetchUsers = async () => {
  users.value = await projectStore.fetchUsers(parseInt(projectId))
}

const createTask = async () => {
  const taskData = {
    title: title.value,
    description: description.value,
    status: status.value,
    priority: priority.value,
    projectId: parseInt(projectId),
    assigneeId: assigneeId.value,
    dueDate: dueDate.value ? new Date(dueDate.value) : null,
    estimatedTime: estimatedTime.value,
    type: type.value,
    plannedDate: plannedDate.value ? new Date(plannedDate.value) : null,
    relatedTaskId: relatedTaskId.value,
    actualTime: actualTime.value,
    tags: tags.value.split(',').map(tag => tag.trim()) // Преобразование строки тегов в массив
  }
  await taskStore.createTask(parseInt(projectId), taskData)
  router.push(`/cabinet/projects/${projectId}`)
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
