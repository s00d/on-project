<template>
  <div class="modal-body">
    <div class="mb-3">
      <label for="title" class="form-label">Task Title</label>
      <input v-model="taskData.title" type="text" id="title" class="form-control" required />
    </div>
    <div class="mb-3">
      <label for="description" class="form-label">Description</label>
      <MdEditor v-model="taskData.description" language="en-US" previewTheme="github" noMermaid :preview="false" />
    </div>
    <div class="mb-3" v-if="project?.statuses">
      <label for="status" class="form-label">Status</label>
      <select v-model="taskData.status" id="status" class="form-select" required>
        <option v-for="status in project.statuses" :value="status" :key="status" v-text="status"></option>
      </select>
    </div>
    <div class="mb-3" v-if="project?.priorities">
      <label for="priority" class="form-label">Priority</label>
      <select v-model="taskData.priority" id="priority" class="form-select" required>
        <option v-for="priority in project.priorities" :value="priority" :key="priority" v-text="priority"></option>
      </select>
    </div>
    <div class="mb-3">
      <label for="assignee" class="form-label">Assignee</label>
      <select v-model="taskData.assignees" id="assignee" class="form-select" multiple>
        <option v-for="user in users" :key="user.id" :value="user.id">
          {{ user.username }}
        </option>
      </select>
    </div>
    <div class="mb-3">
      <label for="dueDate" class="form-label">Due Date</label>
      <input v-model="taskData.dueDate" type="datetime-local" id="dueDate" class="form-control" />
    </div>
    <div class="mb-3">
      <label for="estimatedTime" class="form-label">Estimated Time (hours)</label>
      <input v-model="taskData.estimatedTime" type="number" id="estimatedTime" class="form-control" />
    </div>
    <div class="mb-3" v-if="project?.types">
      <label for="type" class="form-label">Task Type</label>
      <select v-model="taskData.type" id="type" class="form-select">
        <option v-for="type in project.types" :value="type" :key="type" v-text="type"></option>
      </select>
    </div>
    <div class="mb-3">
      <label for="plannedDate" class="form-label">Planned Date</label>
      <input v-model="taskData.plannedDate" type="datetime-local" id="plannedDate" class="form-control" />
    </div>
    <div class="mb-3">
      <label for="relatedTaskId" class="form-label">Related Task</label>
      <select v-model="taskData.relatedTaskId" id="relatedTaskId" class="form-select">
        <option v-for="task in tasks" :key="task.id" :value="task.id">
          {{ task.title }}
        </option>
      </select>
    </div>
    <div class="mb-3">
      <label for="actualTime" class="form-label">Actual Time (hours)</label>
      <input v-model="taskData.actualTime" type="number" id="actualTime" class="form-control" />
    </div>
    <div class="mb-3" v-if="taskData.tags">
      <label for="tags" class="form-label">Tags</label>
      <TagsInput v-model="taskData.tags" placeholder="Add a tag" />
    </div>

    <div class="mb-3">
      <label for="label" class="form-label">Label</label>
      <select v-model="taskData.labelId" id="label" class="form-select">
        <option v-for="label in labels" :key="label.id" :value="label.id">
          {{ label.name }}
        </option>
      </select>
    </div>

    <div class="mb-3" v-if="taskData.customFields">
      <label for="customFields" class="form-label">Custom Fields</label>
      <div v-for="(field, index) in customFieldsStrict" :key="index" class="mb-3" style="padding: 8px 4px 0;">
        <div class="d-flex align-items-center">
          <label :for="field.description" class="form-label" v-text="field.description" style="padding: 10px 6px 0;"></label>
          <input
            v-model="taskData.customFields[field.description]"
            :id="field.description"
            :type="field.type"
            class="form-control mr-2"
            placeholder="Field Value"
          />
        </div>
      </div>
    </div>

    <!-- Conditional rendering for comments -->
    <div v-if="mode === 'edit' && showComments && comments" class="mt-3">
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

    <div class="modal-footer">
      <button type="button" class="btn btn-primary" @click.prevent="submitTask">{{ buttonText }}</button>
      <button
        type="button"
        class="btn btn-secondary"
        @click="$emit('close')"
      >
        Close
      </button>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, defineProps, defineEmits } from 'vue'
import {type Task, type Comment, useTaskStore} from '@/stores/taskStore'
import {type Project} from '@/stores/projectStore'
import TagsInput from "@/components/TagsInput.vue";
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import CommentCard from '@/components/CommentCard.vue'
import {useAuthStore, type User} from "@/stores/authStore";

const props = defineProps<{
  projectId: string
  project: Project|null
  initialTaskData?: any // Initial data for the task (used for editing)
  mode: 'create' | 'edit'
  showComments?: boolean
  users: {[key: string]: User}
}>()

const emit = defineEmits(['task-saved', 'close'])

const taskStore = useTaskStore()
const authStore = useAuthStore()

const taskData = ref<Task>({
  id: 0,
  projectId: 0,
  title: '',
  description: '',
  status: 'To Do',
  priority: 'Low',
  assignees: [] as number[],
  dueDate: null as Date | null,
  estimatedTime: 0,
  type: 'Frontend',
  plannedDate: null as Date | null,
  relatedTaskId: null as number | null,
  actualTime: 0,
  labelId: null as number | null,
  customFields: {} as Record<string, string>,
  tags: [] as string[],
})

const tasks = ref<Task[]>([])
const newCommentContent = ref('')
const attachment = ref<File | null>(null)
const comments = ref<Comment[]>([])

const customFieldsStrict = ref<{ name: string; description: string; type: string }[]>([])

const labels = computed(() => taskStore.labels)

const buttonText = computed(() => props.mode === 'create' ? 'Create Task' : 'Save Changes')

onMounted(async () => {
  if (props.mode === 'edit' && props.initialTaskData) {
    taskData.value = { ...props.initialTaskData }
  }
  customFieldsStrict.value = props.project?.customFields ?? [];
  const {tasks} = await taskStore.fetchTasks(parseInt(props.projectId), {})
  tasks.value = tasks;
  await taskStore.fetchLabels(parseInt(props.projectId))

  if (props.showComments) {
    await fetchComments()
  }
})

const submitTask = async () => {
  if (props.mode === 'create') {
    await taskStore.createTask(parseInt(props.projectId), taskData.value)
  } else {
    await taskStore.updateTask(parseInt(props.projectId), taskData.value.id, taskData.value)
  }
  emit('task-saved', 'close')
}

const fetchComments = async () => {
  await taskStore.fetchComments(taskData.value.id)
  comments.value = taskStore.getComments
}

const addComment = async () => {
  await taskStore.addComment(
    taskData.value.id,
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
</script>

<style scoped>
.task-form {
  max-width: 800px;
  margin: 0 auto;
}
</style>
