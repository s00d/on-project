<template>
  <div class="card-body p-4">
    <div class="d-flex flex-start mb-3">
      <div v-html="parsedDescription" class="text-muted markdown-content" style="width: 100%"></div>
    </div>

    <div class="d-flex flex-start mb-3" v-if="assignedUsers.length > 0">
      <div>
        <h6 class="fw-bold mb-1 text-left">Assigned Users</h6>
        <p class="text-muted">
          <span v-for="user in assignedUsers" :key="user.id" class="badge bg-primary me-1">{{
            user.username
          }}</span>
        </p>
      </div>
    </div>

    <div class="d-flex flex-start mb-3" v-if="taskData.dueDate">
      <div>
        <h6 class="fw-bold mb-1 text-left">Due Date</h6>
        <p class="text-muted">{{ formattedDueDate }}</p>
      </div>
    </div>

    <div class="d-flex flex-start mb-3" v-if="taskData.plannedDate">
      <div>
        <h6 class="fw-bold mb-1 text-left">Planned Date</h6>
        <p class="text-muted">{{ formattedPlannedDate }}</p>
      </div>
    </div>

    <div class="d-flex flex-start mb-3" v-if="taskData.relatedTaskId">
      <div>
        <h6 class="fw-bold mb-1 text-left">Related Task</h6>
        <p class="text-muted">{{ relatedTaskTitle }}</p>
      </div>
    </div>

    <div class="d-flex flex-start mb-3">
      <div>
        <span class="badge" :class="priorityBadgeClass">{{ taskData.priority }}</span>
        <span class="badge bg-info">{{ labelName }}</span>
        <span v-if="taskData.startDate" class="badge bg-info">{{ taskData.startDate }}</span>
        <span v-if="taskData.stopDate" class="badge bg-info">{{ taskData.stopDate }}</span>
      </div>
    </div>

    <hr />

    <div v-if="comments" class="mt-3">
      <h5>Comments</h5>
      <CommentCard
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :project-id="projectId.toString()"
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
        <button type="submit" class="btn btn-primary mb-2">Add Comment</button>
      </form>
    </div>
  </div>

  <div class="card-footer text-end">
    <button type="button" class="btn btn-secondary" @click="$emit('close')">Close</button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, defineProps, defineEmits } from 'vue'
import { type Task, type Comment, useTaskStore } from '@/stores/taskStore'
import { type Project } from '@/stores/projectStore'
import CommentCard from '@/components/CommentCard.vue'
import { useAuthStore, type User } from '@/stores/authStore'
import { marked } from 'marked'

const props = defineProps<{
  projectId: string
  project: Project | null
  taskData: Task
  users: { [key: string]: User }
}>()

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const taskStore = useTaskStore()

const comments = ref<Comment[]>([])
const attachment = ref<File | null>(null)

const newCommentContent = ref('')

const labels = computed(() => taskStore.labels)
const labelName = computed(() => {
  const label = labels.value.find((l) => l.id === props.taskData.labelId)
  return label ? label.name : 'No Label'
})

const assignedUsers = computed(() => {
  return (
    Object.values(props.users).filter((user) => props.taskData.assignees?.includes(user.id)) ?? []
  )
})

const parsedDescription = computed(() => marked.parse(props.taskData.description))

const formattedDueDate = computed(() => {
  return props.taskData.dueDate ? new Date(props.taskData.dueDate).toLocaleString() : 'N/A'
})

const formattedPlannedDate = computed(() => {
  return props.taskData.plannedDate ? new Date(props.taskData.plannedDate).toLocaleString() : 'N/A'
})

const relatedTaskTitle = computed(() => {
  const relatedTask = taskStore.tasks.find((task) => task.id === props.taskData.relatedTaskId)
  return relatedTask ? relatedTask.title : 'No Related Task'
})

const priorityBadgeClass = computed(() => {
  switch (props.taskData.priority) {
    case 'High':
      return 'bg-danger'
    case 'Medium':
      return 'bg-warning'
    case 'Low':
      return 'bg-success'
    default:
      return 'bg-secondary'
  }
})

const fetchComments = async () => {
  await taskStore.fetchComments(props.taskData.id)
  comments.value = taskStore.getComments
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    attachment.value = target.files[0]
  }
}

const addComment = async () => {
  await taskStore.addComment(
    props.taskData.id,
    { content: newCommentContent.value, userId: authStore.userId! },
    attachment.value
  )
  newCommentContent.value = ''
  attachment.value = null
  await fetchComments()
}

onMounted(async () => {
  await fetchComments()
})
</script>

<style scoped>
.card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.card-body {
  padding: 2rem;
}

.card-footer {
  background-color: #f8f9fa;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
}

.form-control-plaintext {
  padding-left: 0;
  padding-right: 0;
  margin-bottom: 0.5rem;
  background: none;
}

.badge {
  padding: 0.5em 0.75em;
  font-size: 0.9em;
}
</style>
