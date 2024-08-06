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
            <div class="mb-3">
              <label for="priority" class="form-label">Priority</label>
              <select v-model="priority" id="priority" class="form-select">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
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

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'
import Tabs from '@/components/Tabs.vue'

interface TaskTemplate {
  id: number
  title: string
  description: string
  priority: string
}

export default defineComponent({
  name: 'TaskTemplates',
  components: { Tabs },
  setup() {
    const title = ref('')
    const description = ref('')
    const priority = ref('Medium')
    const templates = ref<TaskTemplate[]>([])

    const fetchTemplates = async () => {
      const response = await axios.get('/api/templates')
      templates.value = response.data
    }

    const createTemplate = async () => {
      const newTemplate = {
        title: title.value,
        description: description.value,
        priority: priority.value
      }
      await axios.post('/api/templates', newTemplate)
      fetchTemplates()
    }

    const applyTemplate = async (template: TaskTemplate) => {
      // Apply the template (e.g., create a new task using the template)
      await axios.post('/api/tasks', {
        title: template.title,
        description: template.description,
        priority: template.priority
      })
    }

    onMounted(fetchTemplates)

    return { title, description, priority, templates, createTemplate, applyTemplate }
  }
})
</script>
