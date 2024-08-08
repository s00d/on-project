<template>
  <div class="modal-header">
    <h5 class="modal-title" v-text="task.title"></h5>
    <button type="button" class="btn-close" aria-label="Close" @click="$emit('close')"></button>
  </div>
  <div class="modal-body">
    <div class="mb-3">
      <label for="title" class="form-label">Title</label>
      <input type="text" v-model="task.title" id="title" class="form-control" />
    </div>
    <div class="mb-3">
      <label for="description" class="form-label">Description</label>
      <textarea v-model="task.description" id="description" class="form-control"></textarea>
    </div>
    <div class="mb-3" v-if="project?.statuses">
      <label for="status" class="form-label">Status</label>
      <select v-model="task.status" id="status" class="form-select">
        <option v-for="status in project.statuses" :value="status"  :key="status" v-text="status"></option>
      </select>
    </div>
    <div class="mb-3">
      <label for="assignees" class="form-label">Assignee</label>
      <select v-model="task.assignees" id="assignees" class="form-select" multiple>
        <option v-for="user in users" :key="user.id" :value="user.id">
          {{ user.username }}
        </option>
      </select>
    </div>
    <div class="mb-3" v-if="task.Label">
      <label for="label" class="form-label">Label</label>
      <input type="text" v-model="task.Label.name" id="label" class="form-control" />
    </div>
    <div class="mb-3">
      <label for="estimatedTime" class="form-label">Estimated Time (hours)</label>
      <input type="number" v-model="task.estimatedTime" id="estimatedTime" class="form-control" />
    </div>
    <div class="mb-3" v-if="project?.types">
      <label for="type" class="form-label">Task Type</label>
      <select v-model="task.type" id="type" class="form-select">
        <option v-for="type in project.types" :value="type" :key="type" v-text="type"></option>
      </select>
    </div>

    <div class="mb-3">
      <label for="plannedDate" class="form-label">Planned Date</label>
      <input type="date" v-model="task.plannedDate" id="plannedDate" class="form-control" />
    </div>
    <div class="mb-3">
      <label for="relatedTaskId" class="form-label">Related Task</label>
      <input type="number" v-model="task.relatedTaskId" id="relatedTaskId" class="form-control" />
    </div>
    <div class="mb-3">
      <label for="actualTime" class="form-label">Actual Time (hours)</label>
      <input type="number" v-model="task.actualTime" id="actualTime" class="form-control" />
    </div>
    <div class="mb-3">
      <label for="tags" class="form-label">Tags</label>
      <TagsInput v-model="tags" placeholder="Add a tag" />
    </div>

    <div class="mb-3">
      <label for="label" class="form-label">Label</label>
      <select v-model="task.labelId" id="label" class="form-select">
        <option v-for="label in labels" :key="label.id" :value="label.id">
          {{ label.name }}
        </option>
      </select>
    </div>

    <div class="mb-3" v-if="task.customFields">
      <label for="customFields" class="form-label">Custom Fields</label>
      <div v-for="(field, index) in customFieldsStrict" :key="index" class="mb-3">
        <div class="d-flex align-items-center">
          <label :for="field.name" class="form-label" v-text="field.name" style="padding: 8px 4px 0;"></label>
          <input
            v-model="task.customFields[field.name]"
            :id="field.name"
            :type="field.type"
            class="form-control mr-2"
            placeholder="Field Value"
          />
        </div>
      </div>
    </div>

    <div class="mt-3" v-if="showComments">
      <h5>Comments</h5>
      <CommentCard
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :project-id="project.id.toString()"
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
  </div>
  <div class="modal-footer">
    <button @click="saveTask" class="btn btn-primary">Save</button>
    <button
      type="button"
      class="btn btn-secondary"
      @click="$emit('close')"
    >
      Close
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import {type Comment, type Task, useTaskStore} from '@/stores/taskStore'
import {useAuthStore, type User} from '@/stores/authStore'
import CommentCard from '@/components/CommentCard.vue'
import {type Project, useProjectStore} from "@/stores/projectStore";
import TagsInput from "@/components/TagsInput.vue";

const props = defineProps<{
  task: Task
  project: Project
  showComments: boolean
}>()

const emit = defineEmits(['close', 'update'])

const taskStore = useTaskStore()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const task = ref({ ...props.task })
const comments = ref<Comment[]>([])
const newCommentContent = ref('')
const attachment = ref<File | null>(null)
const tags = ref(task.value.tags ? task.value.tags : [])
const users = ref<User[]>([])
const customFieldsStrict = ref<{ name: string; description: string; type: string }[]>([])

const labels = computed(() => taskStore.labels)

const fetchUsers = async () => {
  users.value = await projectStore.fetchUsers(props.project.id)
}

const saveTask = async () => {
  await taskStore.updateTask(props.project.id, task.value.id, {
    title: task.value.title,
    description: task.value.description,
    status: task.value.status,
    assignees: task.value.assignees,
    labelId: task.value.labelId,
    dueDate: task.value.dueDate,
    estimatedTime: task.value.estimatedTime,
    type: task.value.type,
    plannedDate: task.value.plannedDate,
    relatedTaskId: task.value.relatedTaskId,
    actualTime: task.value.actualTime,
    tags: tags.value
  })
  emit('close')
  emit('update')
}

const deleteTask = async () => {
  await taskStore.deleteTask(props.project.id, task.value.id)
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

onMounted(async () => {
  customFieldsStrict.value = props.project?.customFields ?? [];

  if (props.showComments) {
    await fetchComments()
  }
  await fetchUsers()
  await taskStore.fetchLabels(props.project?.id)
  taskStore.subscribeToSocketEvents()
})
</script>


<style>
/* Add any styles you need here */
</style>
