<template>
  <div class="admin-panel">
    <div class="content">
      <Tabs>
        <div class="container mt-5">
          <h1>Task Templates</h1>
          <form @submit.prevent="createTemplate">
            <div class="mb-3">
              <label for="title" class="form-label">Title</label>
              <input v-model="title" type="text" id="title" class="form-control" required />
            </div>
            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea
                v-model="description"
                id="description"
                class="form-control"
                required
              ></textarea>
            </div>
            <div class="mb-3" v-if="project?.priorities">
              <label for="priority" class="form-label">Priority</label>
              <select v-model="priority" id="priority" class="form-select" required>
                <option v-for="priority in project.priorities" :value="priority" :key="priority" v-text="priority"></option>
              </select>
            </div>

            <div class="mb-3" v-if="project?.statuses">
              <label for="status" class="form-label">Status</label>
              <select v-model="status" id="status" class="form-select">
                <option v-for="status in project.statuses" :value="status"  :key="status" v-text="status"></option>
              </select>
            </div>

            <div class="mb-3" v-if="project?.tags">
              <label for="status" class="form-label">Tag</label>
              <select v-model="tag" id="status" class="form-select">
                <option v-for="tag in project.tags" :value="tag"  :key="tag" v-text="tag"></option>
              </select>
            </div>

            <div class="mb-3" v-if="project?.types">
              <label for="status" class="form-label">Type</label>
              <select v-model="type" id="status" class="form-select">
                <option v-for="type in project.types" :value="type" :key="type" v-text="type"></option>
              </select>
            </div>

            <button class="btn btn-primary" type="submit">Create Template</button>
          </form>
          <div class="mt-5">
            <h2>Existing Templates</h2>
            <ul class="list-group">
              <li v-for="template in templates" :key="template.id" class="list-group-item">
                {{ template.title }}
                <button class="btn btn-link" @click="applyTemplate(template)">Apply</button>
              </li>
            </ul>
          </div>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, computed} from 'vue'
import axios from 'axios'
import Tabs from '@/components/Tabs.vue'
import {useRoute} from "vue-router";
import {useProjectStore} from "@/stores/projectStore";

interface TaskTemplate {
  id: number
  title: string
  description: string
  priority: string
  status: string
  tag: string
  type: string
}

const route = useRoute()
const projectStore = useProjectStore()

const projectId = route.params.projectId.toString()

const title = ref('')
const description = ref('')
const priority = ref('Medium')
const status = ref('')
const tag = ref('')
const type = ref('')
const templates = ref<TaskTemplate[]>([])

const fetchTemplates = async () => {
  const response = await axios.get('/api/templates')
  templates.value = response.data
}

const createTemplate = async () => {
  const newTemplate = {
    title: title.value,
    description: description.value,
    priority: priority.value,
    status: status.value,
    tag: tag.value,
    type: type.value,
  }
  await axios.post('/api/templates', newTemplate)
  fetchTemplates()
}

const applyTemplate = async (template: TaskTemplate) => {
  // Apply the template (e.g., create a new task using the template)
  await axios.post('/api/tasks', {
    title: template.title,
    description: template.description,
    priority: template.priority,
    status: template.status,
    tag: template.tag,
    type: template.type,
  })
}

const project = computed(() => {
  return projectStore.project
})

onMounted(async () => {
  await projectStore.fetchProject(parseInt(projectId))
  await fetchTemplates()
})
</script>

<style scoped>
.admin-panel {
  display: flex;
}

.content {
  flex: 1;
  padding: 20px;
}

.container {
  max-width: 800px;
}
</style>
