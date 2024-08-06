<template>
  <div>
    <template v-if="isEditing">
      <div class="mb-3">
        <label for="title" class="form-label">Title</label>
        <input type="text" v-model="task.title" id="title" class="form-control" />
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea v-model="task.description" id="description" class="form-control"></textarea>
      </div>
      <div class="mb-3">
        <label for="status" class="form-label">Status</label>
        <select v-model="task.status" id="status" class="form-select">
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
      <div class="mb-3" v-if="task.assignee">
        <label for="assignee" class="form-label">Assignee</label>
        <input type="text" v-model="task.assignee.username" id="assignee" class="form-control" />
      </div>
      <div class="mb-3" v-if="task.label">
        <label for="label" class="form-label">Label</label>
        <input type="text" v-model="task.label.name" id="label" class="form-control" />
      </div>
      <button @click="saveTask" class="btn btn-primary">Save</button>
      <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
    </template>
    <template v-else>
      <h5 class="card-title">{{ task.title }}</h5>
      <p class="card-text">{{ task.description }}</p>
      <p>Status: {{ task.status }}</p>
      <p v-if="task.assignee">Assigned to: {{ task.assignee.username }}</p>
      <p v-if="task.label">
        Label: <span :style="{ backgroundColor: task.label.color }">{{ task.label.name }}</span>
      </p>
      <p v-if="task.dueDate">Due Date: {{ new Date(task.dueDate).toLocaleDateString() }}</p>
      <div class="mb-3">
        <label for="status" class="form-label">Change Status</label>
        <select v-model="task.status" @change="updateTaskStatus" class="form-select">
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
      <button @click="startEdit" class="btn btn-secondary">Edit</button>
      <button @click="deleteTask" class="btn btn-danger">Delete</button>
      <div class="mt-3" v-if="showComments">
        <h5>Comments</h5>
        <CommentCard
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :project-id="projectId"
        />
        <form @submit.prevent="addComment" class="mt-3">
          <div class="mb-3">
            <label for="content" class="form-label">New Comment</label>
            <textarea v-model="newCommentContent" id="content" class="form-control"></textarea>
          </div>
          <div class="mb-3">
            <label for="attachment" class="form-label">Attachment</label>
            <input type="file" id="attachment" class="form-control" @change="handleFileUpload" />
          </div>
          <button type="submit" class="btn btn-primary">Add Comment</button>
        </form>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { type Comment, type Task, useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/authStore'
import CommentCard from './CommentCard.vue'

const props = defineProps<{
  task: Task
  projectId: string
  showComments: boolean
}>()

const taskStore = useTaskStore()
const authStore = useAuthStore()
const task = ref({ ...props.task })
const comments = ref<Comment[]>([])
const newCommentContent = ref('')
const attachment = ref<File | null>(null)
const isEditing = ref(false)

const updateTaskStatus = async () => {
  const projectId = parseInt(props.projectId)
  await taskStore.updateTask(projectId, task.value.id, { status: task.value.status })
}

const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  task.value = { ...props.task } // reset changes
}

const saveTask = async () => {
  const projectId = parseInt(props.projectId)
  await taskStore.updateTask(projectId, task.value.id, {
    title: task.value.title,
    description: task.value.description,
    status: task.value.status,
    assigneeId: task.value.assignee?.id,
    labelId: task.value.label?.id,
    dueDate: task.value.dueDate
  })
  isEditing.value = false
}

const deleteTask = async () => {
  const projectId = parseInt(props.projectId)
  await taskStore.deleteTask(projectId, task.value.id)
}

const fetchComments = async () => {
  await taskStore.fetchComments(task.value.id)
  comments.value = taskStore.getComments
}

const addComment = async () => {
  await taskStore.addComment(
    task.value.id,
    { content: newCommentContent.value, userId: authStore.userId! },
    attachment.value
  )
  newCommentContent.value = ''
  attachment.value = null
  await fetchComments()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    attachment.value = target.files[0]
  }
}

onMounted(() => {
  if (props.showComments) {
    fetchComments()
  }
  taskStore.subscribeToSocketEvents()
})

const canEditTask = computed(() => authStore.userId === task.value.assignee?.id)
const canDeleteTask = computed(() => authStore.getUserRoles.includes('Developer'))
</script>

<style>
/* Add any styles you need here */
</style>
