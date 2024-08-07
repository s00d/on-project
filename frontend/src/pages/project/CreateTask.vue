<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Create Task</h1>
          <div class="mt-3">
            <div class="mb-3">
              <label for="title" class="form-label">Task Title</label>
              <input v-model="title" type="text" id="title" class="form-control" required />
            </div>
            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <MdEditor v-model="description" language="en-US" />
            </div>
            <div class="mb-3" v-if="project?.statuses">
              <label for="status" class="form-label">Status</label>
              <select v-model="status" id="status" class="form-select" required>
                <option v-for="status in project.statuses" :value="status" :key="status" v-text="status"></option>
              </select>
            </div>
            <div class="mb-3" v-if="project?.priorities">
              <label for="priority" class="form-label">Priority</label>
              <select v-model="priority" id="priority" class="form-select" required>
                <option v-for="priority in project.priorities" :value="priority" :key="priority" v-text="priority"></option>
              </select>
            </div>
            <div class="mb-3">
              <label for="assignee" class="form-label">Assignee</label>
              <select v-model="assigneeIds" id="assignee" class="form-select" multiple>
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
            <div class="mb-3" v-if="project?.types">
              <label for="type" class="form-label">Task Type</label>
              <select v-model="type" id="type" class="form-select">
                <option v-for="type in project.types" :value="type" :key="type" v-text="type"></option>
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
              <label for="tags" class="form-label">Tags</label>
              <TagsInput v-model="tags" placeholder="Add a tag" />
            </div>

            <div class="mb-3">
              <label for="label" class="form-label">Label</label>
              <select v-model="labelId" id="label" class="form-select">
                <option v-for="label in labels" :key="label.id" :value="label.id">
                  {{ label.name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label for="customFields" class="form-label">Custom Fields</label>
              <div v-for="(field, index) in customFieldsStrict" :key="index" class="mb-3" style="padding: 8px 4px 0;">
                <div class="d-flex align-items-center">
                  <label :for="field.name" class="form-label" v-text="field.name"></label>
                  <input
                    v-model="customFields[field.name]"
                    :id="field.name"
                    :type="field.type"
                    class="form-control mr-2"
                    placeholder="Field Value"
                  />
                </div>
              </div>
            </div>

            <button type="button" class="btn btn-primary" @click.prevent="createTask" >Create Task</button>
          </div>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, computed} from 'vue'
import { type Task, useTaskStore } from '@/stores/taskStore'
import { type User } from '@/stores/authStore'
import { useRoute, useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useProjectStore } from '@/stores/projectStore'
import Tabs from '@/components/Tabs.vue'
import TagsInput from "@/components/TagsInput.vue";

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const route = useRoute()
const router = useRouter()

const projectId = route.params.projectId.toString()

const project = computed(() => {
  return projectStore.project
})

const title = ref('')
const description = ref('')
const status = ref((project?.value?.statuses && project?.value?.statuses.length > 0) ? project?.value?.statuses[0] : 'To Do')
const priority = ref((project?.value?.priorities && project?.value?.priorities.length > 0) ? project?.value?.priorities[0] : 'Medium')
const assigneeIds = ref<number[]>([])
const dueDate = ref<string | null>(null)
const estimatedTime = ref<number | null>(null)
const type = ref<string>((project?.value?.types && project?.value?.types.length > 0) ? project?.value?.types[0] : 'frontend')
const plannedDate = ref<string | null>(null)
const relatedTaskId = ref<number | null>(null)
const estimatedCost = ref<number | null>(null)
const actualTime = ref<number | null>(null)
const actualCost = ref<number | null>(null)
const labelId = ref<number | null>(null)
const tags = ref<string[]>([])
const customFields = ref<{ [name: string]: string }>({})
const customFieldsStrict = ref<{ name: string; description: string; type: string }[]>([])

const users = ref<User[]>([])
const tasks = ref<Task[]>([])

const labels = computed(() => taskStore.labels)

const createTask = async () => {
  const taskData = {
    title: title.value,
    description: description.value,
    status: status.value,
    priority: priority.value,
    projectId: parseInt(projectId),
    assigneeIds: assigneeIds.value,
    dueDate: dueDate.value ? new Date(dueDate.value) : null,
    estimatedTime: estimatedTime.value,
    type: type.value,
    plannedDate: plannedDate.value ? new Date(plannedDate.value) : null,
    relatedTaskId: relatedTaskId.value,
    actualTime: actualTime.value,
    labelId: labelId.value,
    customFields: customFields.value,
    tags: tags.value
  }
  await taskStore.createTask(parseInt(projectId), taskData)
  router.push(`/cabinet/projects/${projectId}`)
}

onMounted(async () => {
  await projectStore.fetchProject(parseInt(projectId))
  customFieldsStrict.value = projectStore.project?.customFields ?? [];
  users.value = await projectStore.fetchUsers(parseInt(projectId))
  await taskStore.fetchLabels(parseInt(projectId))
})
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
