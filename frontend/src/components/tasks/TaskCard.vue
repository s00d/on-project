<template>
  <div class="modal-body">
    <div class="mb-3 d-flex align-items-center" v-if="mode === 'create'">
      <select
        id="templateSelect"
        class="form-select me-2"
        v-model="selectedTemplate"
        @change="applyTemplate"
      >
        <option :value="null" disabled>-- Select Template --</option>
        <option v-for="template in templates" :key="template.id" :value="template">
          {{ template.title }}
        </option>
      </select>
      <button
        type="button"
        class="btn btn-danger"
        @click="deleteTemplate"
        :disabled="!selectedTemplate"
      >
        x
      </button>
    </div>

    <div class="mb-3">
      <label for="title" class="form-label">Task Title</label>
      <input v-model="taskData.title" type="text" id="title" class="form-control" required />
    </div>

    <div class="d-flex flex-wrap" v-if="project">
      <div class="mb-3 me-2 flex-grow-1">
        <label for="status" class="form-label">Status</label>
        <select v-model="taskData.status" id="status" class="form-select" required>
          <option
            v-for="status in project.statuses"
            :value="status"
            :key="status"
            v-text="status"
          ></option>
        </select>
      </div>
      <div class="mb-3 me-2 flex-grow-1">
        <label for="priority" class="form-label">Priority</label>
        <select v-model="taskData.priority" id="priority" class="form-select" required>
          <option
            v-for="priority in project.priorities"
            :value="priority"
            :key="priority"
            v-text="priority"
          ></option>
        </select>
      </div>
      <div class="mb-3 flex-grow-1">
        <label for="type" class="form-label">Task Type</label>
        <select v-model="taskData.type" id="type" class="form-select">
          <option v-for="type in project.types" :value="type" :key="type" v-text="type"></option>
        </select>
      </div>
    </div>

    <div class="mb-3">
      <label for="description" class="form-label">Description</label>
      <MdEditor
        v-model="taskData.description"
        language="en-US"
        previewTheme="github"
        noMermaid
        :preview="false"
        :style="{
          height: '250px',
          textAlign: 'left'
        }"
      />
    </div>

    <div class="d-flex flex-wrap">
      <div class="mb-3 flex-grow-1">
        <label for="sprint" class="form-label">Sprint</label>
        <select v-model="taskData.sprintId" id="sprint" class="form-select">
          <option :value="null">Empty</option>
          <option v-for="sprint in project?.sprints" :value="sprint.id" :key="sprint.id">
            {{ sprint.title }}
          </option>
        </select>
      </div>
    </div>

    <div class="d-flex flex-wrap position-relative">
      <div class="mb-3 flex-grow-1 position-relative">
        <label for="assignee" class="form-label d-flex align-items-center justify-content-between">
          Assignee
          <button
            v-if="assigneesArray.length"
            type="button"
            class="clear-button"
            @click="clearSelection"
          >
            <i class="fas fa-times"></i>
          </button>
        </label>
        <select v-model="assigneesArray" id="assignee" class="form-select" multiple>
          <option v-for="user in users" :key="user.id" :value="user.id">{{ user.username }}</option>
        </select>
      </div>
    </div>

    <div class="d-flex flex-wrap">
      <div class="mb-3 me-2 flex-grow-1">
        <label for="dueDate" class="form-label">Due Date</label>
        <input v-model="taskData.dueDate" type="datetime-local" id="dueDate" class="form-control" />
      </div>
      <div class="mb-3 flex-grow-1">
        <label for="estimatedTime" class="form-label">Estimated Time (hours)</label>
        <input
          v-model="taskData.estimatedTime"
          type="number"
          id="estimatedTime"
          class="form-control"
        />
      </div>
    </div>

    <div class="d-flex flex-wrap">
      <div class="mb-3 me-2 flex-grow-1">
        <label for="plannedDate" class="form-label">Planned Date</label>
        <input
          v-model="taskData.plannedDate"
          type="datetime-local"
          id="plannedDate"
          class="form-control"
        />
      </div>
      <div class="mb-3 flex-grow-1">
        <label for="relatedTaskId" class="form-label">Related Task</label>
        <select v-model="taskData.relatedTaskId" id="relatedTaskId" class="form-select">
          <option :value="null" disabled>-- Select Related Task --</option>
          <option v-for="task in filteredRelatedTasks" :key="task.id" :value="task.id">
            {{ task.title }}
          </option>
        </select>
      </div>
    </div>

    <div class="mb-3" v-if="taskData.tags">
      <label for="tags" class="form-label">Tags</label>
      <TagsInput v-model="taskData.tags" placeholder="Add a tag" />
    </div>

    <div class="mb-3">
      <label for="label" class="form-label">Label</label>
      <select v-model="taskData.labelId" id="label" class="form-select">
        <option v-for="label in labels" :key="label.id" :value="label.id">{{ label.name }}</option>
      </select>
    </div>

    <div v-if="taskData.customFields && customFieldsStrict.length > 0" class="mb-3">
      <label for="customFields" class="form-label">Custom Fields</label>
      <div
        v-for="(field, index) in customFieldsStrict"
        :key="index"
        class="d-flex align-items-center"
      >
        <label :for="field.description" class="form-label">{{ field.description }}</label>
        <input
          v-model="taskData.customFields[field.description]"
          :id="field.description"
          :type="field.type"
          class="form-control"
        />
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

    <div class="pef"></div>

    <div class="modal-footer">
      <button type="button" class="btn btn-primary" @click.prevent="submitTask">
        {{ buttonText }}
      </button>
      <button type="button" class="btn btn-success" @click.prevent="saveAsTemplate">
        Save as Template
      </button>
      <button type="button" class="btn btn-danger" @click="$emit('close')">Close</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, defineProps, defineEmits } from 'vue'
import { type Task, type Comment, useTaskStore } from '@/stores/taskStore'
import { type Project } from '@/stores/projectStore'
import TagsInput from '@/components/TagsInput.vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import CommentCard from '@/components/CommentCard.vue'
import { useAuthStore, type User } from '@/stores/authStore'
import axios from 'axios'

interface ITaskTemplate {
  id: number
  title: string
  description: string
  priority: string
  status: string
  tag: string
  type: string
  estimatedTime: number
  actualTime: number
  customFields: Record<string, string>
  tags: string[]
}

const props = defineProps<{
  projectId: string
  project: Project | null
  initialTaskData?: any // Initial data for the task (used for editing)
  mode: 'create' | 'edit'
  showComments?: boolean
  users: { [key: string]: User }
  tasks: Task[]
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
  sprintId: null,
  order: 0,
  assignees: [] as { id: number }[],
  dueDate: null as Date | null,
  estimatedTime: 0,
  type: 'Frontend',
  plannedDate: null as Date | null,
  relatedTaskId: null as number | null,
  actualTime: 0,
  labelId: null as number | null,
  customFields: {} as Record<string, string>,
  tags: [] as string[]
})

const newCommentContent = ref('')
const attachment = ref<File | null>(null)
const comments = ref<Comment[]>([])
const assigneesArray = ref<number[]>(
  props.initialTaskData?.assignees?.map((assignee: { id: number }) => assignee.id) ?? []
)

const selectedTemplate = ref<ITaskTemplate | null>(null)
const templates = ref<ITaskTemplate[]>([])

const customFieldsStrict = ref<{ name: string; description: string; type: string }[]>([])

const labels = computed(() => taskStore.labels)

const buttonText = computed(() => (props.mode === 'create' ? 'Create Task' : 'Save Changes'))

const filteredRelatedTasks = computed(() => {
  return props.tasks.filter((task) => task.id !== taskData.value.id)
})

const clearSelection = async () => {
  assigneesArray.value = [] // Очищаем выбранные значения, если выбран пункт "---- empty ----"
}

const saveAsTemplate = async () => {
  try {
    const dataToTemplate = {
      ...taskData.value,
      labelId: taskData.value.labelId || undefined,
      relatedTaskId: taskData.value.relatedTaskId || undefined,
      sprintId: taskData.value.sprintId || undefined,
      label: taskData.value.label || undefined,
      customFields: taskData.value.customFields || {},
      tags: taskData.value.tags || []
    }
    delete (dataToTemplate as { createdAt?: string }).createdAt
    delete (dataToTemplate as { updatedAt?: string }).updatedAt
    delete (dataToTemplate as { projectId?: number }).projectId
    delete (dataToTemplate as { dueDate?: number }).dueDate
    delete (dataToTemplate as { plannedDate?: number }).plannedDate
    delete (dataToTemplate as { id?: number }).id
    delete (dataToTemplate as { assignees?: number }).assignees
    delete (dataToTemplate as { order?: number }).order

    await axios.post(`/task-templates/${props.project!.id}`, {
      ...dataToTemplate,
      assignees: assigneesArray.value
    })
    await fetchTemplates()
  } catch (error) {
    console.error('Error saving template:', error)
    throw error
  }
}

const fetchTemplates = async () => {
  if (props.project?.id) {
    try {
      const response = await axios.get(`/task-templates/${props.project.id}`)
      templates.value = response.data
    } catch (error) {
      console.error('Failed to load templates', error)
    }
  }
}

const applyTemplate = () => {
  if (selectedTemplate.value) {
    const template = selectedTemplate.value
    taskData.value.title = template.title
    taskData.value.description = template.description
    taskData.value.priority = template.priority
    taskData.value.status = template.status
    taskData.value.type = template.type
    taskData.value.tags = template.tags ?? []
    taskData.value.customFields = template.customFields ?? {}
  }
}

const deleteTemplate = async () => {
  if (selectedTemplate.value) {
    try {
      await axios.delete(`/task-templates/${props.project!.id}/${selectedTemplate.value.id}`)
      await fetchTemplates()
      selectedTemplate.value = null
    } catch (error) {
      console.error('Error deleting template:', error)
      throw error
    }
  }
}

onMounted(async () => {
  if (props.mode === 'edit' && props.initialTaskData) {
    taskData.value = { ...props.initialTaskData }
  }
  customFieldsStrict.value = props.project?.customFields ?? []
  await taskStore.fetchLabels(parseInt(props.projectId))

  if (props.showComments) {
    await fetchComments()
  }

  await fetchTemplates()
})

const submitTask = async () => {
  const dataToSave = {
    ...taskData.value,
    labelId: taskData.value.labelId || undefined,
    relatedTaskId: taskData.value.relatedTaskId || undefined,
    sprintId: taskData.value.sprintId || undefined,
    label: taskData.value.label || undefined
  }
  delete (dataToSave as { createdAt?: string }).createdAt
  delete (dataToSave as { updatedAt?: string }).updatedAt
  delete (dataToSave as { projectId?: number }).projectId
  delete (dataToSave as { dueDate?: number }).dueDate
  delete (dataToSave as { plannedDate?: number }).plannedDate
  delete (dataToSave as { id?: number }).id
  delete (dataToSave as { assignees?: number }).assignees

  if (props.mode === 'create') {
    await taskStore.createTask(parseInt(props.projectId), {
      ...dataToSave,
      assigneesIds: assigneesArray.value
    })
  } else {
    await taskStore.updateTask(parseInt(props.projectId), taskData.value.id, {
      ...dataToSave,
      assigneesIds: assigneesArray.value
    })
  }
  emit('task-saved', 'close')
}

const fetchComments = async () => {
  await taskStore.fetchComments(parseInt(props.projectId), taskData.value.id)
  comments.value = taskStore.getComments
}

const addComment = async () => {
  await taskStore.addComment(
    parseInt(props.projectId),
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
.modal-body {
  max-width: 800px;
  margin: 0 auto;
}

.pef {
  padding-bottom: 75px;
}

.modal-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: white;
}

.d-flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-grow-1 {
  flex-grow: 1;
}

.me-2 {
  margin-right: 0.5rem;
}

.form-label {
  display: inline-block;
  margin: 0;
  padding: 2px 5px;
  width: 100%;
  background-color: #f5f5f5;
  color: #333;
  font-weight: 600;
  text-align: left;
  border: 1px solid #ccc;
  transition: background-color 0.3s ease;
}

.form-label:hover {
  background-color: #e9e9e9;
}

.form-select,
.form-control {
  border-radius: 0;
  padding: 2px 5px;
}

.position-relative {
  position: relative;
}

.clear-button {
  background: transparent;
  border: none;

  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  margin-left: 8px; /* Отступ слева от текста в label */
}

.form-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%; /* Чтобы label занимал всю ширину над select */
}

.clear-button i {
  color: red;
  font-size: 1rem;
  padding-top: 4px;
}

.clear-button i:hover {
  color: darkred;
}
</style>
