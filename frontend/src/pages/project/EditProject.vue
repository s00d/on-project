<template>
  <div class="admin-panel">
    <div class="content">
      <div class="container mt-5">
        <h1>Edit Project</h1>
        <form @submit.prevent="updateProject" class="mt-3">
          <div class="mb-3">
            <label for="name" class="form-label">Project Name</label>
            <input v-model="name" type="text" id="name" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <MdEditor v-model="description" language="en-US" />
          </div>
          <button type="submit" class="btn btn-primary">Update Project</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useRoute, useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const projectStore = useProjectStore()
const route = useRoute()
const router = useRouter()
const name = ref('')
const description = ref('')

const fetchProject = async () => {
  const project = await projectStore.fetchProject(Number(route.params.id))
  if (project) {
    name.value = project.name
    description.value = project.description
  }
}

const updateProject = async () => {
  await projectStore.updateProject(Number(route.params.id), {
    name: name.value,
    description: description.value
  })
  router.push('/cabinet')
}

onMounted(() => {
  fetchProject()
})
</script>
